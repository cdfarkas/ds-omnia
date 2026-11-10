import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const makeBrowser = () => ({
  enabled: true,
  provider: playwright(),
  headless: true,
  instances: [{ browser: 'chromium' as const }],
});

const modes = [
  { key: 'light-neutral', theme: 'light', skin: 'default' },
  { key: 'dark-neutral', theme: 'dark', skin: 'default' },
  { key: 'light-pixel', theme: 'light', skin: 'pixel' },
  { key: 'dark-pixel', theme: 'dark', skin: 'pixel' },
  { key: 'light-brutalist', theme: 'light', skin: 'brutalist' },
  { key: 'dark-brutalist', theme: 'dark', skin: 'brutalist' },
];

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.*',
        'src/**/*.test.*',
        'src/**/*.mdx',
        'src/**/index.ts',
        'src/bundle.ts',
        'src/lib/DocsTheme.tsx',
        'src/**/*.check.ts',
        'src/**/*.d.ts',
      ],
      reporter: ['text-summary', 'json-summary', 'lcov'],
      thresholds: { statements: 98.62, branches: 96.19, functions: 95.09, lines: 99.23 },
    },
    projects: [
      ...modes.map(({ key, theme, skin }) => ({
        extends: true as const,
        plugins: [
          storybookTest({ configDir: '.storybook', initialGlobals: { theme, skin } }),
          // storybookTest gives all four modes one optimizer cache; concurrent writes corrupt it on Windows.
          {
            name: 'omnia:mode-cache-dir',
            enforce: 'post' as const,
            config: () => ({ cacheDir: `node_modules/.cache/sb-vitest/${key}` }),
          },
        ],
        test: {
          name: `storybook:${key}`,
          browser: makeBrowser(),
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      })),
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'unit',
          browser: makeBrowser(),
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./vitest.unit-setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['scripts/**/*.test.ts', '.storybook/**/*.test.ts'],
        },
      },
    ],
  },
});
