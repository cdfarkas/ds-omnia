import type { Preview, Decorator } from '@storybook/react-vite';
import { setLocale, type Locale } from '../src/lib/i18n';
import { OmniaThemeProvider, type Theme, type Skin } from '../src/lib/OmniaThemeProvider';

import '@fontsource-variable/fraunces';
import '@fontsource-variable/space-grotesk';
import '@fontsource/press-start-2p';
import '../src/styles/layers.css';
import '../src/styles/reset.css';
import '../src/styles/tokens.css';
import '../src/styles/skins.css';
import './docs-theme.css';

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const withTheme: Decorator = (Story, context) => (
  <OmniaThemeProvider
    theme={(context.globals.theme ?? 'light') as Theme}
    skin={(context.globals.skin ?? 'default') as Skin}
  >
    <Story />
  </OmniaThemeProvider>
);

const withLocale: Decorator = (Story, context) => {
  setLocale((context.globals.locale ?? 'en') as Locale);
  return <Story />;
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Logo', 'Colors', 'Typography', 'Favicon & app icons'],
          'Guidelines',
          [
            'Tokens & theming',
            'Prop naming',
            'Component naming',
            'Accessibility',
            'Responsive',
            'Testing & gates',
            'Bilingual',
          ],
          'Atoms',
          '*',
        ],
      },
    },
    a11y: {
      test: 'error',
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Colour theme',
      defaultValue: prefersDark ? 'dark' : 'light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    skin: {
      description: 'Visual skin',
      defaultValue: 'default',
      toolbar: {
        title: 'Skin',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Neutral' },
          { value: 'pixel', title: 'Pixel' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Locale',
      defaultValue: 'en',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'fr', title: 'Français' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme, withLocale],
  tags: ['autodocs'],
};

export default preview;
