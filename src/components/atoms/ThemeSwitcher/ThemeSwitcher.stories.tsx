import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { t, type Locale } from '../../../lib/i18n';
import { OmniaThemeProvider, useTheme, type Skin } from '../../../lib/OmniaThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';

const meta = {
  title: 'Atoms/Theme switcher',
  component: ThemeSwitcher,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live demo: its own provider owns the theme, so the toggle repaints the whole page. */
function InteractiveDemo(): ReactElement {
  const { theme, locale } = useTheme();
  const active = t(
    theme === 'dark' ? 'themeSwitcher.dark' : 'themeSwitcher.light',
    locale,
  );
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <ThemeSwitcher />
      <p style={{ margin: 0 }}>
        {locale === 'fr' ? `Thème actif : ${active}` : `Active theme: ${active}`}
      </p>
    </div>
  );
}

/**
 * Selecting a theme presses its button and releases the other. Skin and locale still follow the
 * toolbar; only the theme is owned here so the toggle can drive it.
 */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: { selfThemed: true },
  render: (_args, { globals }) => (
    <OmniaThemeProvider
      skin={(globals.skin ?? 'default') as Skin}
      locale={(globals.locale ?? 'en') as Locale}
    >
      <InteractiveDemo />
    </OmniaThemeProvider>
  ),
  play: async ({ canvas, step, globals }) => {
    const locale = (globals.locale ?? 'en') as Locale;
    const light = canvas.getByRole('button', { name: t('themeSwitcher.light', locale) });
    const dark = canvas.getByRole('button', { name: t('themeSwitcher.dark', locale) });
    await step('selecting Dark presses it and releases Light', async () => {
      await userEvent.click(dark);
      await expect(dark).toHaveAttribute('aria-pressed', 'true');
      await expect(light).toHaveAttribute('aria-pressed', 'false');
    });
    await step('selecting Light presses it back', async () => {
      await userEvent.click(light);
      await expect(light).toHaveAttribute('aria-pressed', 'true');
      await expect(dark).toHaveAttribute('aria-pressed', 'false');
    });
    light.blur();
  },
};

/** Static view driven by the toolbar theme; reused by the per-mode stories below. */
export const Default: Story = {
  render: () => <ThemeSwitcher />,
};

export const DarkNeutral: Story = { ...Default, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Default, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...Default, globals: { theme: 'dark', skin: 'pixel' } };
