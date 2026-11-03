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
        'src/**/*.check.ts',
        'src/**/*.d.ts',
      ],
      reporter: ['text-summary', 'json-summary', 'lcov'],
    },
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: makeBrowser(),
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
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
    ],
  },
});
