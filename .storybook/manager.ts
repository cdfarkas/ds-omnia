import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

addons.setConfig({
  theme: create({
    base: prefersDark ? 'dark' : 'light',
    brandTitle: 'Omnia',
    brandImage: prefersDark ? 'brand/logo-dark.svg' : 'brand/logo.svg',
    brandUrl: undefined,
  }),
});
