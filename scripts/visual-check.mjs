import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('storybook-static');
const outDir = resolve('visual-report');
const PORT = 6007;

if (!existsSync(root)) {
  console.error('storybook-static not found. Run `pnpm build-storybook` first.');
  process.exit(1);
}

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
};

function serve() {
  return new Promise((res) => {
    const server = createServer(async (req, resp) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = join(root, urlPath === '/' ? '/index.html' : urlPath);
        if (!existsSync(filePath)) {
          resp.writeHead(404);
          resp.end('not found');
          return;
        }
        const data = await readFile(filePath);
        resp.writeHead(200, {
          'content-type': mime[extname(filePath)] || 'application/octet-stream',
        });
        resp.end(data);
      } catch (err) {
        resp.writeHead(500);
        resp.end(String(err));
      }
    });
    server.listen(PORT, () => res(server));
  });
}

const stories = [
  { id: 'atoms-button--primary', name: 'primary' },
  { id: 'atoms-button--neutral', name: 'neutral' },
  { id: 'atoms-button--danger', name: 'danger' },
  { id: 'atoms-button--intents', name: 'intents' },
  { id: 'atoms-button--sizes', name: 'sizes' },
  { id: 'atoms-button--loading', name: 'loading' },
  { id: 'atoms-button--disabled', name: 'disabled' },
  { id: 'atoms-button--overridden', name: 'overridden' },
  { id: 'atoms-badge--primary', name: 'badge-primary' },
  { id: 'atoms-badge--neutral', name: 'badge-neutral' },
  { id: 'atoms-badge--danger', name: 'badge-danger' },
  { id: 'atoms-badge--intents', name: 'badge-intents' },
  { id: 'atoms-badge--overridden', name: 'badge-overridden' },
  { id: 'atoms-link--standalone', name: 'link-standalone' },
  { id: 'atoms-link--inline', name: 'link-inline' },
  { id: 'atoms-link--external', name: 'link-external' },
  { id: 'atoms-link--variants', name: 'link-variants' },
  { id: 'atoms-link--overridden', name: 'link-overridden' },
  { id: 'atoms-input--playground', name: 'input-playground' },
  { id: 'atoms-input--sizes', name: 'input-sizes' },
  { id: 'atoms-input--with-adornments', name: 'input-with-adornments' },
  { id: 'atoms-input--invalid', name: 'input-invalid' },
  { id: 'atoms-input--disabled', name: 'input-disabled' },
  { id: 'atoms-input--read-only', name: 'input-read-only' },
  { id: 'atoms-input--states', name: 'input-states' },
  { id: 'atoms-input--overridden', name: 'input-overridden' },
  { id: 'atoms-checkbox--playground', name: 'checkbox-playground' },
  { id: 'atoms-checkbox--checked', name: 'checkbox-checked' },
  { id: 'atoms-checkbox--indeterminate', name: 'checkbox-indeterminate' },
  { id: 'atoms-checkbox--sizes', name: 'checkbox-sizes' },
  { id: 'atoms-checkbox--invalid', name: 'checkbox-invalid' },
  { id: 'atoms-checkbox--disabled', name: 'checkbox-disabled' },
  { id: 'atoms-checkbox--without-visible-label', name: 'checkbox-without-visible-label' },
  { id: 'atoms-checkbox--long-label', name: 'checkbox-long-label' },
  { id: 'atoms-checkbox--states', name: 'checkbox-states' },
  { id: 'atoms-checkbox--overridden', name: 'checkbox-overridden' },
  { id: 'atoms-switch--playground', name: 'switch-playground' },
  { id: 'atoms-switch--checked', name: 'switch-checked' },
  { id: 'atoms-switch--sizes', name: 'switch-sizes' },
  { id: 'atoms-switch--invalid', name: 'switch-invalid' },
  { id: 'atoms-switch--disabled', name: 'switch-disabled' },
  { id: 'atoms-switch--without-visible-label', name: 'switch-without-visible-label' },
  { id: 'atoms-switch--long-label', name: 'switch-long-label' },
  { id: 'atoms-switch--states', name: 'switch-states' },
  { id: 'atoms-switch--overridden', name: 'switch-overridden' },
];

const filter = process.argv[2];

const modes = [
  { key: 'light-neutral', theme: 'light', skin: 'default' },
  { key: 'dark-neutral', theme: 'dark', skin: 'default' },
  { key: 'light-pixel', theme: 'light', skin: 'pixel' },
  { key: 'dark-pixel', theme: 'dark', skin: 'pixel' },
];

const server = await serve();
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 440, height: 220 },
  deviceScaleFactor: 2,
});
const manifest = [];

async function open(id, theme, skin, locale) {
  const globals = `theme:${theme};skin:${skin};locale:${locale}`;
  const url = `http://localhost:${PORT}/iframe.html?id=${id}&viewMode=story&globals=${encodeURIComponent(globals)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#storybook-root > *', { timeout: 20000 });
  await page.waitForTimeout(250);
  return page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    skin: document.documentElement.getAttribute('data-skin'),
    scrollWidth: document.documentElement.scrollWidth,
  }));
}

async function shoot(id, name, mode, locale, suffix, focus = false) {
  const applied = await open(id, mode.theme, mode.skin, locale);
  if (focus) {
    await page.mouse.click(5, 5);
    await page.keyboard.press('Tab');
  }
  await page.waitForTimeout(150);
  const file = `${name}__${suffix}.png`;
  await page.screenshot({ path: join(outDir, file), fullPage: true });
  manifest.push({
    story: name,
    storyId: id,
    mode: mode.key,
    locale,
    focus,
    appliedTheme: applied.theme,
    appliedSkin: applied.skin,
    viewport: page.viewportSize(),
    scrollWidth: applied.scrollWidth,
    file,
  });
}

async function shootInteraction(id, name, mode) {
  const applied = await open(id, mode.theme, mode.skin, 'en');
  await page.evaluate(() => document.activeElement?.blur());
  const btn = page.locator('#storybook-root button').first();
  await btn.hover();
  await page.waitForTimeout(250);
  const hoverFile = `${name}__hover-${mode.key}.png`;
  await page.screenshot({ path: join(outDir, hoverFile) });
  manifest.push({
    story: name,
    storyId: id,
    mode: mode.key,
    state: 'hover',
    appliedTheme: applied.theme,
    appliedSkin: applied.skin,
    file: hoverFile,
  });

  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const pressFile = `${name}__press-${mode.key}.png`;
  await page.screenshot({ path: join(outDir, pressFile) });
  await page.mouse.up();
  manifest.push({
    story: name,
    storyId: id,
    mode: mode.key,
    state: 'press',
    appliedTheme: applied.theme,
    appliedSkin: applied.skin,
    file: pressFile,
  });
}

for (const s of stories) {
  if (filter && !s.id.includes(filter)) continue;
  for (const m of modes) {
    await shoot(s.id, s.name, m, 'en', m.key);
  }
}

if (!filter || filter.includes('button')) {
  const primary = 'atoms-button--primary';
  const loading = 'atoms-button--loading';

  await shootInteraction(primary, 'primary', modes[0]);
  await shootInteraction(primary, 'primary', modes[3]);

  await shoot(primary, 'primary', modes[0], 'en', 'focus-light-neutral', true);
  await shoot(primary, 'primary', modes[3], 'en', 'focus-dark-pixel', true);

  await shoot(loading, 'loading', modes[0], 'fr', 'light-neutral__fr');
  await shoot(loading, 'loading', modes[0], 'en', 'light-neutral__en');
}

if (!filter || filter.includes('input')) {
  for (const m of modes) {
    await shoot(
      'atoms-input--with-adornments',
      'input-with-adornments',
      m,
      'en',
      `focus-${m.key}`,
      true,
    );
  }
}

if (!filter || filter.includes('checkbox')) {
  for (const m of modes) {
    await shoot(
      'atoms-checkbox--checked',
      'checkbox-checked',
      m,
      'en',
      `focus-${m.key}`,
      true,
    );
  }
}

if (!filter || filter.includes('switch')) {
  for (const m of modes) {
    await shoot(
      'atoms-switch--checked',
      'switch-checked',
      m,
      'en',
      `focus-${m.key}`,
      true,
    );
  }
}

if (!filter || filter.includes('link')) {
  for (const m of modes) {
    await shoot(
      'atoms-link--standalone',
      'link-standalone',
      m,
      'en',
      `focus-${m.key}`,
      true,
    );
  }
  await shoot(
    'atoms-link--external',
    'link-external',
    modes[0],
    'fr',
    'light-neutral__fr',
  );
}

await page.setViewportSize({ width: 320, height: 568 });
for (const s of stories) {
  if (filter && !s.id.includes(filter)) continue;
  for (const m of modes) {
    await shoot(s.id, s.name, m, 'en', `${m.key}__w320`);
  }
}

await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
await browser.close();
server.close();
console.log(`Captured ${manifest.length} screenshots to ${outDir}`);
