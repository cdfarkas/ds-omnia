import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { t, type Locale } from '../../../lib/i18n';
import {
  OmniaThemeProvider,
  type Skin,
  type Theme,
} from '../../../lib/OmniaThemeProvider';
import { Link } from '../../atoms/Link';
import { ThemeSwitcher } from '../../atoms/ThemeSwitcher';
import { LanguageSwitcher } from '../../atoms/LanguageSwitcher';
import { NavBar } from '../../molecules/NavBar';
import { PageTemplate } from '../../templates/PageTemplate';
import { AppHeader } from './AppHeader';
import './AppHeader.overrides.css';

function Bar({ className }: { className?: string }) {
  return (
    <AppHeader className={className}>
      <AppHeader.Brand>
        <Link href="#home">Omnia</Link>
      </AppHeader.Brand>
      <AppHeader.Nav>
        <NavBar>
          <NavBar.Link href="#work" current>
            Work
          </NavBar.Link>
          <NavBar.Link href="#about">About</NavBar.Link>
          <NavBar.Link href="#writing">Writing</NavBar.Link>
        </NavBar>
      </AppHeader.Nav>
      <AppHeader.Actions>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </AppHeader.Actions>
    </AppHeader>
  );
}

/** Owns theme and locale in state seeded from the toolbar, so the switchers really switch. */
function LiveProvider({
  globals,
  children,
}: {
  globals: Record<string, unknown>;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState((globals.theme ?? 'light') as Theme);
  const [locale, setLocale] = useState((globals.locale ?? 'en') as Locale);
  return (
    <OmniaThemeProvider
      theme={theme}
      onThemeChange={setTheme}
      skin={(globals.skin ?? 'default') as Skin}
      locale={locale}
      onLocaleChange={setLocale}
    >
      {children}
    </OmniaThemeProvider>
  );
}

const barCode = `<AppHeader>
  <AppHeader.Brand>
    <Link href="#home">Omnia</Link>
  </AppHeader.Brand>
  <AppHeader.Nav>
    <NavBar>
      <NavBar.Link href="#work" current>Work</NavBar.Link>
      <NavBar.Link href="#about">About</NavBar.Link>
      <NavBar.Link href="#writing">Writing</NavBar.Link>
    </NavBar>
  </AppHeader.Nav>
  <AppHeader.Actions>
    <ThemeSwitcher />
    <LanguageSwitcher />
  </AppHeader.Actions>
</AppHeader>`;

const inPageCode = `<PageTemplate>
  <PageTemplate.Header>
${barCode.replace(/^/gm, '    ')}
  </PageTemplate.Header>
  <PageTemplate.Main>
    <h1>Main content</h1>
  </PageTemplate.Main>
</PageTemplate>`;

const brandOnlyCode = `<AppHeader>
  <AppHeader.Brand>
    <Link href="#home">Omnia</Link>
  </AppHeader.Brand>
</AppHeader>`;

const overriddenCode = barCode.replace(
  '<AppHeader>',
  '<AppHeader className="omnia-demo-override-app-header">',
);

const meta = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  subcomponents: {
    'AppHeader.Brand': AppHeader.Brand,
    'AppHeader.Nav': AppHeader.Nav,
    'AppHeader.Actions': AppHeader.Actions,
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Brand, primary navigation and the theme and language switchers. Keyboard focus runs brand →
 * links → switchers; the theme switcher repaints the page.
 */
export const Default: Story = {
  tags: ['interaction'],
  parameters: { selfThemed: true, docs: { source: { code: barCode } } },
  render: (_args, { globals }) => (
    <LiveProvider globals={globals}>
      <Bar />
    </LiveProvider>
  ),
  play: async ({ canvas, step, globals }) => {
    const locale = (globals.locale ?? 'en') as Locale;
    await step('Tab runs from the brand through the links to the actions', async () => {
      for (const name of ['Omnia', 'Work', 'About', 'Writing']) {
        await userEvent.tab();
        await expect(canvas.getByRole('link', { name })).toHaveFocus();
      }
      await userEvent.tab();
      await expect(
        canvas.getByRole('group', { name: t('themeSwitcher.label', locale) }),
      ).toContainElement(document.activeElement as HTMLElement);
    });
    await step('the theme switcher flips the page theme and back', async () => {
      const start = document.documentElement.dataset.theme as Theme;
      const other: Theme = start === 'dark' ? 'light' : 'dark';
      const button = (theme: Theme) =>
        canvas.getByRole('button', { name: t(`themeSwitcher.${theme}`, locale) });
      await userEvent.click(button(other));
      await expect(button(other)).toHaveAttribute('aria-pressed', 'true');
      await expect(document.documentElement).toHaveAttribute('data-theme', other);
      await userEvent.click(button(start));
      await expect(document.documentElement).toHaveAttribute('data-theme', start);
      button(start).blur();
    });
  },
};

/** Where it belongs: inside `PageTemplate.Header`, which supplies the single banner landmark. */
export const InPageTemplate: Story = {
  parameters: { docs: { source: { code: inPageCode } } },
  render: () => (
    <PageTemplate>
      <PageTemplate.Header>
        <Bar />
      </PageTemplate.Header>
      <PageTemplate.Main style={{ padding: 'var(--omnia-palette-space-4)' }}>
        <h1>Main content</h1>
      </PageTemplate.Main>
    </PageTemplate>
  ),
};

/** The smallest header: a brand alone. Every part is opt-in. */
export const BrandOnly: Story = {
  parameters: { docs: { source: { code: brandOnlyCode } } },
  render: () => (
    <AppHeader>
      <AppHeader.Brand>
        <Link href="#home">Omnia</Link>
      </AppHeader.Brand>
    </AppHeader>
  ),
};

/** At 320 CSS px the parts wrap onto new lines instead of overflowing. */
export const Narrow: Story = {
  parameters: { docs: { source: { code: barCode } } },
  render: () => (
    <div style={{ inlineSize: '320px', maxInlineSize: '100%' }}>
      <Bar />
    </div>
  ),
};

/**
 * Consumer override through the public contract: `.omnia-demo-override-app-header` in
 * `@layer overrides` re-points the padding and border-colour variables. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: { docs: { source: { code: overriddenCode } } },
  render: () => <Bar className="omnia-demo-override-app-header" />,
};
