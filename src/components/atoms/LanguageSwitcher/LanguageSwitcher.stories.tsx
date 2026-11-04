import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import {
  OmniaThemeProvider,
  useTheme,
  type Skin,
  type Theme,
} from '../../../lib/OmniaThemeProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

const meta = {
  title: 'Atoms/Language switcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live demo: its own provider owns the locale, so the toggle flips the surrounding copy. */
function InteractiveDemo(): ReactElement {
  const { locale } = useTheme();
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <LanguageSwitcher />
      <p style={{ margin: 0 }}>
        {locale === 'fr' ? 'Langue active : Français' : 'Active language: English'}
      </p>
    </div>
  );
}

/**
 * Selecting a language presses its button and releases the other. Theme and skin still follow the
 * toolbar; only the locale is owned here so the toggle can drive it.
 */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: { selfThemed: true },
  render: (_args, { globals }) => (
    <OmniaThemeProvider
      theme={(globals.theme ?? 'light') as Theme}
      skin={(globals.skin ?? 'default') as Skin}
    >
      <InteractiveDemo />
    </OmniaThemeProvider>
  ),
  play: async ({ canvas, step }) => {
    const en = canvas.getByRole('button', { name: 'English' });
    const fr = canvas.getByRole('button', { name: 'Français' });
    await step('selecting Français presses it and releases English', async () => {
      await userEvent.click(fr);
      await expect(fr).toHaveAttribute('aria-pressed', 'true');
      await expect(en).toHaveAttribute('aria-pressed', 'false');
    });
    await step('selecting English presses it back', async () => {
      await userEvent.click(en);
      await expect(en).toHaveAttribute('aria-pressed', 'true');
      await expect(fr).toHaveAttribute('aria-pressed', 'false');
    });
    en.blur();
  },
};

/** Static view driven by the toolbar locale; reused by the per-mode stories below. */
export const Default: Story = {
  render: () => <LanguageSwitcher />,
};

export const DarkNeutral: Story = { ...Default, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Default, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...Default, globals: { theme: 'dark', skin: 'pixel' } };
