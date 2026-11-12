import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { PageTemplate } from './PageTemplate';
import './PageTemplate.overrides.css';

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

const headerSlot = `  <PageTemplate.Header>
    <strong>Omnia</strong>
  </PageTemplate.Header>`;

const navSlot = `  <PageTemplate.Navbar>
    <ul>
      <li><a href="#main">Overview</a></li>
      <li><a href="#main">Projects</a></li>
      <li><a href="#main">About</a></li>
    </ul>
  </PageTemplate.Navbar>`;

const mainSlot = `  <PageTemplate.Main>
    <h1>Main content</h1>
    <p>The shell is a frame only: drop a Container, a Grid or any content in here.</p>
  </PageTemplate.Main>`;

const asideSlot = `  <PageTemplate.Aside>
    <p>Aside: a complementary region.</p>
  </PageTemplate.Aside>`;

const footerSlot = `  <PageTemplate.Footer>
    <small>© 2026 Omnia</small>
  </PageTemplate.Footer>`;

const playgroundCode = `<PageTemplate>\n${headerSlot}\n${navSlot}\n${mainSlot}\n${footerSlot}\n</PageTemplate>`;
const minimalCode = `<PageTemplate>\n${headerSlot}\n${mainSlot}\n</PageTemplate>`;
const asideCode = `<PageTemplate>\n${headerSlot}\n${navSlot}\n${mainSlot}\n${asideSlot}\n${footerSlot}\n</PageTemplate>`;
const overriddenCode = `<PageTemplate className="omnia-demo-override-page-template">\n${headerSlot}\n${navSlot}\n${mainSlot}\n${footerSlot}\n</PageTemplate>`;

const meta = {
  title: 'Templates/PageTemplate',
  component: PageTemplate,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageTemplate>;

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
    <PageTemplate>
      <PageTemplate.Header style={banded}>
        <strong>Omnia</strong>
      </PageTemplate.Header>
      <PageTemplate.Navbar style={region}>
        <Nav />
      </PageTemplate.Navbar>
      <PageTemplate.Main style={region}>
        <Body />
      </PageTemplate.Main>
      <PageTemplate.Footer style={banded}>
        <small style={muted}>© 2026 Omnia</small>
      </PageTemplate.Footer>
    </PageTemplate>
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
    <PageTemplate>
      <PageTemplate.Header style={banded}>
        <strong>Omnia</strong>
      </PageTemplate.Header>
      <PageTemplate.Main style={region}>
        <Body />
      </PageTemplate.Main>
    </PageTemplate>
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
    <PageTemplate>
      <PageTemplate.Header style={banded}>
        <strong>Omnia</strong>
      </PageTemplate.Header>
      <PageTemplate.Navbar style={side}>
        <Nav />
      </PageTemplate.Navbar>
      <PageTemplate.Main style={region}>
        <Body />
      </PageTemplate.Main>
      <PageTemplate.Aside style={side}>
        <p style={muted}>Aside: a complementary region.</p>
      </PageTemplate.Aside>
      <PageTemplate.Footer style={banded}>
        <small style={muted}>© 2026 Omnia</small>
      </PageTemplate.Footer>
    </PageTemplate>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-page-template` class in
 * `@layer overrides` re-points `--omnia-page-template-navbar-width` — no `!important`.
 */
export const Overridden: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: overriddenCode } },
  },
  render: () => (
    <PageTemplate className="omnia-demo-override-page-template">
      <PageTemplate.Header style={banded}>
        <strong>Omnia</strong>
      </PageTemplate.Header>
      <PageTemplate.Navbar style={side}>
        <Nav />
      </PageTemplate.Navbar>
      <PageTemplate.Main style={region}>
        <Body />
      </PageTemplate.Main>
      <PageTemplate.Footer style={banded}>
        <small style={muted}>© 2026 Omnia</small>
      </PageTemplate.Footer>
    </PageTemplate>
  ),
};
