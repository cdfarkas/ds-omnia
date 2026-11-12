import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AppShell } from './AppShell';
import './AppShell.overrides.css';

const region: CSSProperties = {
  padding: 'var(--omnia-palette-space-4)',
  color: 'var(--omnia-color-text-primary)',
  fontFamily: 'var(--omnia-font-sans)',
};

const banded: CSSProperties = {
  ...region,
  background: 'var(--omnia-color-bg-subtle)',
  borderBlock:
    'var(--omnia-border-width-regular) solid var(--omnia-color-border-default)',
};

const side: CSSProperties = {
  ...region,
  minInlineSize: '12rem',
  borderInlineEnd:
    'var(--omnia-border-width-regular) solid var(--omnia-color-border-default)',
};

const navList: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--omnia-palette-space-3)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const link: CSSProperties = { color: 'var(--omnia-color-link)' };
const muted: CSSProperties = { color: 'var(--omnia-color-text-muted)' };

function Nav() {
  return (
    <ul style={navList}>
      {['Overview', 'Projects', 'About'].map((page) => (
        <li key={page}>
          <a href="#main" style={link}>
            {page}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Body() {
  return (
    <>
      <h1>Main content</h1>
      <p style={muted}>
        The shell is a frame only: drop a Container, a Grid or any content in here.
      </p>
    </>
  );
}

const headerSlot = `  <AppShell.Header>
    <strong>Omnia</strong>
  </AppShell.Header>`;

const navSlot = `  <AppShell.Navbar>
    <ul>
      <li><a href="#main">Overview</a></li>
      <li><a href="#main">Projects</a></li>
      <li><a href="#main">About</a></li>
    </ul>
  </AppShell.Navbar>`;

const mainSlot = `  <AppShell.Main>
    <h1>Main content</h1>
    <p>The shell is a frame only: drop a Container, a Grid or any content in here.</p>
  </AppShell.Main>`;

const asideSlot = `  <AppShell.Aside>
    <p>Aside: a complementary region.</p>
  </AppShell.Aside>`;

const footerSlot = `  <AppShell.Footer>
    <small>© 2026 Omnia</small>
  </AppShell.Footer>`;

const playgroundCode = `<AppShell>\n${headerSlot}\n${navSlot}\n${mainSlot}\n${footerSlot}\n</AppShell>`;
const minimalCode = `<AppShell>\n${headerSlot}\n${mainSlot}\n</AppShell>`;
const asideCode = `<AppShell>\n${headerSlot}\n${navSlot}\n${mainSlot}\n${asideSlot}\n${footerSlot}\n</AppShell>`;
const overriddenCode = `<AppShell className="omnia-demo-override-app-shell">\n${headerSlot}\n${navSlot}\n${mainSlot}\n${footerSlot}\n</AppShell>`;

const meta = {
  title: 'Templates/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A full shell — header, primary navbar, main and footer. The skip link is the first focusable
 * element; focus it to jump straight to the main region.
 */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: { docs: { source: { code: playgroundCode } } },
  render: () => (
    <AppShell>
      <AppShell.Header style={banded}>
        <strong>Omnia</strong>
      </AppShell.Header>
      <AppShell.Navbar style={region}>
        <Nav />
      </AppShell.Navbar>
      <AppShell.Main style={region}>
        <Body />
      </AppShell.Main>
      <AppShell.Footer style={banded}>
        <small style={muted}>© 2026 Omnia</small>
      </AppShell.Footer>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const skip = canvasElement.querySelector(
      '[data-part="skip-link"]',
    ) as HTMLAnchorElement;
    const main = canvasElement.querySelector('[data-part="main"]') as HTMLElement;
    await expect(skip).toBeInTheDocument();
    skip.focus();
    await expect(skip).toHaveFocus();
    await expect(skip.getAttribute('href')).toBe(`#${main.id}`);
    await expect(main).toHaveAttribute('tabindex', '-1');
    skip.blur();
  },
};

/** The smallest shell: only a header and the required main region. */
export const MinimalShell: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: minimalCode } },
  },
  render: () => (
    <AppShell>
      <AppShell.Header style={banded}>
        <strong>Omnia</strong>
      </AppShell.Header>
      <AppShell.Main style={region}>
        <Body />
      </AppShell.Main>
    </AppShell>
  ),
};

/**
 * Every region in use: from `48em` the navbar and aside flank the main column, with the header and
 * footer spanning the full width above and below.
 */
export const WithAside: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: asideCode } },
  },
  render: () => (
    <AppShell>
      <AppShell.Header style={banded}>
        <strong>Omnia</strong>
      </AppShell.Header>
      <AppShell.Navbar style={side}>
        <Nav />
      </AppShell.Navbar>
      <AppShell.Main style={region}>
        <Body />
      </AppShell.Main>
      <AppShell.Aside style={side}>
        <p style={muted}>Aside: a complementary region.</p>
      </AppShell.Aside>
      <AppShell.Footer style={banded}>
        <small style={muted}>© 2026 Omnia</small>
      </AppShell.Footer>
    </AppShell>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-app-shell` class in
 * `@layer overrides` re-points `--omnia-appshell-navbar-width` — no `!important`.
 */
export const Overridden: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: overriddenCode } },
  },
  render: () => (
    <AppShell className="omnia-demo-override-app-shell">
      <AppShell.Header style={banded}>
        <strong>Omnia</strong>
      </AppShell.Header>
      <AppShell.Navbar style={side}>
        <Nav />
      </AppShell.Navbar>
      <AppShell.Main style={region}>
        <Body />
      </AppShell.Main>
      <AppShell.Footer style={banded}>
        <small style={muted}>© 2026 Omnia</small>
      </AppShell.Footer>
    </AppShell>
  ),
};
