import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

const src = join(import.meta.dirname, '..', 'src');

/** True when a stories file's default-export meta sets `parameters.docs.source.code`. */
function metaSetsSourceCode(code: string): boolean {
  const sf = ts.createSourceFile(
    'x.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const consts = new Map<string, ts.Expression>();
  let meta: ts.Expression | undefined;
  for (const statement of sf.statements) {
    if (ts.isVariableStatement(statement))
      for (const { name, initializer } of statement.declarationList.declarations)
        if (ts.isIdentifier(name) && initializer) consts.set(name.text, initializer);
    if (ts.isExportAssignment(statement)) meta = statement.expression;
  }
  const resolve = (node: ts.Expression | undefined): ts.Expression | undefined => {
    if (!node) return undefined;
    if (
      ts.isSatisfiesExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isParenthesizedExpression(node)
    )
      return resolve(node.expression);
    return ts.isIdentifier(node) && consts.has(node.text)
      ? resolve(consts.get(node.text))
      : node;
  };
  const prop = (node: ts.Expression | undefined, key: string) => {
    const object = resolve(node);
    if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
    for (const p of object.properties) {
      if (ts.isShorthandPropertyAssignment(p) && p.name.text === key) return p.name;
      if (
        ts.isPropertyAssignment(p) &&
        (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
        p.name.text === key
      )
        return p.initializer;
    }
  };
  return (
    prop(prop(prop(prop(meta, 'parameters'), 'docs'), 'source'), 'code') !== undefined
  );
}

describe('metaSetsSourceCode', () => {
  test('catches a snippet on a const meta behind satisfies', () => {
    const code = `const usage = '<X />';
const meta = { title: 'X', parameters: { docs: { source: { code: usage } } } } satisfies Meta<typeof X>;
export default meta;`;
    expect(metaSetsSourceCode(code)).toBe(true);
  });

  test('catches a snippet on an inline default export behind as', () => {
    expect(
      metaSetsSourceCode(
        `export default { parameters: { docs: { source: { code: '' } } } } as Meta;`,
      ),
    ).toBe(true);
  });

  test('allows a per-story snippet and a meta source type', () => {
    const code = `const meta = { parameters: { docs: { source: { type: 'dynamic' } } } } satisfies Meta;
export default meta;
export const A = { parameters: { docs: { source: { code: '<X />' } } } };`;
    expect(metaSetsSourceCode(code)).toBe(false);
  });
});

const storyFiles = readdirSync(src, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.stories.tsx'))
  .map((file) => file.replaceAll('\\', '/'));

test('finds the stories files', () => expect(storyFiles.length).toBeGreaterThan(10));

test.each(storyFiles)('%s sets no file-wide docs.source.code on its meta', (file) => {
  expect(metaSetsSourceCode(readFileSync(join(src, file), 'utf8'))).toBe(false);
});
