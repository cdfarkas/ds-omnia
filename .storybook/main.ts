import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  staticDirs: [{ from: '../src/assets/brand', to: '/brand' }],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  managerHead: (head) => `${head}
    <link rel="icon" type="image/svg+xml" href="brand/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="brand/favicon-32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="brand/apple-touch-icon.png" />`,
};

export default config;
