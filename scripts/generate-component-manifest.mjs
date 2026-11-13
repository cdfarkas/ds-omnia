import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { storyNameFromExport, toId } from 'storybook/internal/csf';

export const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const toPosix = (p) => p.split(sep).join('/');
const collapse = (text) => text.replace(/\s+/g, ' ').trim();

function jsDocText(node) {
  const jsDoc = node.jsDoc;
  if (!jsDoc || jsDoc.length === 0) return undefined;
  const comment = jsDoc[jsDoc.length - 1].comment;
  const text = typeof comment === 'string' ? comment : ts.getTextOfJSDocComment(comment);
  return text ? collapse(text) : undefined;
}

export function discoverComponents(root) {
  const source = readFileSync(join(root, 'src', 'index.ts'), 'utf8');
  const re =
    /export \* from '\.\/(components\/(?:atoms|molecules|organisms|templates)\/[^']+)'/g;
  const found = [];
  let match;
  while ((match = re.exec(source)))
    found.push({ name: match[1].split('/').pop(), dir: match[1] });
  return found;
}

function enumOptions(checker, typeNode) {
  if (!typeNode) return undefined;
  const type = checker.getTypeAtLocation(typeNode);
  const parts = type.isUnion() ? type.types : [type];
  const values = [];
  for (const part of parts) {
    if (part.isStringLiteral()) values.push(part.value);
    else return undefined;
  }
  return values.length > 0 ? values : undefined;
}

function paramDefaults(func, sf) {
  const defaults = new Map();
  const first = func?.parameters?.[0];
  if (first && ts.isObjectBindingPattern(first.name)) {
    for (const el of first.name.elements) {
      if (el.initializer)
        defaults.set(el.name.getText(sf), collapse(el.initializer.getText(sf)));
    }
  }
  return defaults;
}

function storyEntries(root, dir, name) {
  const path = join(root, 'src', dir, `${name}.stories.tsx`);
  const sf = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let title;
  const exportNames = [];
  sf.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const decl of node.declarationList.declarations) {
      const declName = decl.name.getText(sf);
      let init = decl.initializer;
      while (
        init &&
        (ts.isSatisfiesExpression(init) ||
          ts.isAsExpression(init) ||
          ts.isParenthesizedExpression(init))
      ) {
        init = init.expression;
      }
      if (declName === 'meta' && init && ts.isObjectLiteralExpression(init)) {
        for (const prop of init.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            prop.name.getText(sf) === 'title' &&
            ts.isStringLiteral(prop.initializer)
          ) {
            title = prop.initializer.text;
          }
        }
      }
      if (exported && declName !== 'meta') exportNames.push(declName);
    }
  });
  if (!title) return [];
  return exportNames.map((exp) => ({
    name: exp,
    id: toId(title, storyNameFromExport(exp)),
  }));
}

function propsOf(checker, sf, iface, func) {
  const defaults = paramDefaults(func, sf);
  const props = [];
  const variantAxes = [];
  for (const member of iface?.members ?? []) {
    if (!ts.isPropertySignature(member)) continue;
    const propName = member.name.getText(sf);
    const options = enumOptions(checker, member.type);
    const entry = {
      name: propName,
      type: member.type ? collapse(member.type.getText(sf)) : 'unknown',
      required: !member.questionToken,
    };
    const def = defaults.get(propName);
    if (def !== undefined) entry.default = def;
    if (options) {
      entry.options = options;
      variantAxes.push(propName);
    }
    const description = jsDocText(member);
    if (description) entry.description = description;
    props.push(entry);
  }
  return { props, variantAxes };
}

function componentEntry(program, checker, root, { name, dir }) {
  const sf = program.getSourceFile(join(root, 'src', dir, `${name}.tsx`));
  const funcs = new Map();
  const ifaces = new Map();
  let compound;
  sf.forEachChild((node) => {
    if (ts.isFunctionDeclaration(node) && node.name) funcs.set(node.name.text, node);
    if (ts.isInterfaceDeclaration(node)) ifaces.set(node.name.text, node);
    if (ts.isVariableStatement(node)) {
      const decl = node.declarationList.declarations.find(
        (d) => d.name.getText(sf) === name,
      );
      if (decl) compound = { statement: node, init: decl.initializer };
    }
  });
  // A compound is `const Name = Object.assign(Root, { Part: PartFn })` (ADR 0024).
  const assign =
    compound?.init &&
    ts.isCallExpression(compound.init) &&
    compound.init.expression.getText(sf) === 'Object.assign' &&
    compound.init.arguments;
  const func = funcs.get(assign ? assign[0].getText(sf) : name);
  const entry = { name };
  const description = (assign && jsDocText(compound.statement)) || jsDocText(func ?? {});
  if (description) entry.description = description;
  entry.source = toPosix(join('src', dir, `${name}.tsx`));
  Object.assign(entry, propsOf(checker, sf, ifaces.get(`${name}Props`), func));
  if (assign && ts.isObjectLiteralExpression(assign[1])) {
    entry.parts = assign[1].properties.filter(ts.isPropertyAssignment).map((prop) => {
      const part = prop.name.getText(sf);
      const partFunc = funcs.get(prop.initializer.getText(sf));
      return {
        name: `${name}.${part}`,
        ...propsOf(checker, sf, ifaces.get(`${name}${part}Props`), partFunc),
      };
    });
  }
  entry.stories = storyEntries(root, dir, name);
  return entry;
}

export function buildManifest(root = DEFAULT_ROOT) {
  const components = discoverComponents(root);
  const rootFiles = components.map((c) => join(root, 'src', c.dir, `${c.name}.tsx`));
  const { config } = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root);
  const program = ts.createProgram(rootFiles, parsed.options);
  const checker = program.getTypeChecker();
  const name = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name;
  return {
    $note:
      'Generated by scripts/generate-component-manifest.mjs (pnpm docs:manifest). Do not edit by hand.',
    package: name,
    components: components.map((c) => componentEntry(program, checker, root, c)),
  };
}

export function renderMarkdown(manifest) {
  const cell = (text) => text.replace(/\|/g, '\\|');
  const lines = [
    '<!-- Generated by scripts/generate-component-manifest.mjs (pnpm docs:manifest). Do not edit by hand. -->',
    '',
    '# Omnia components',
    '',
    `Machine-readable API index: [\`components.json\`](./components.json). Package \`${manifest.package}\`.`,
    '',
  ];
  const propTable = (props) => {
    lines.push(
      '| Prop | Type | Required | Default | Options |',
      '| --- | --- | --- | --- | --- |',
    );
    for (const p of props) {
      const def = p.default ? `\`${cell(p.default)}\`` : '—';
      const options = p.options ? p.options.map((o) => `\`${o}\``).join(', ') : '—';
      lines.push(
        `| \`${p.name}\` | \`${cell(p.type)}\` | ${p.required ? 'yes' : 'no'} | ${def} | ${options} |`,
      );
    }
  };
  for (const c of manifest.components) {
    lines.push(`## ${c.name}`, '');
    if (c.description) lines.push(c.description, '');
    lines.push(`Source: \`${c.source}\``, '');
    propTable(c.props);
    for (const part of c.parts ?? []) {
      lines.push('', `### ${part.name}`, '');
      propTable(part.props);
    }
    lines.push(
      '',
      `Stories: ${c.stories.map((s) => `\`${s.id}\``).join(', ') || '—'}`,
      '',
    );
  }
  return `${lines.join('\n')}\n`;
}

const invokedDirectly =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invokedDirectly) {
  const manifest = buildManifest();
  writeFileSync(
    join(DEFAULT_ROOT, 'docs', 'components.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  writeFileSync(join(DEFAULT_ROOT, 'docs', 'components.md'), renderMarkdown(manifest));
  console.log(
    `Wrote docs/components.json (${manifest.components.length} components) and docs/components.md`,
  );
}
