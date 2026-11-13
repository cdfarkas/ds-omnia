import type { CSSProperties } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Button } from '../../atoms/Button';
import { Link } from '../../atoms/Link';
import { Text } from '../../atoms/Text';
import { PageTemplate } from '../../templates/PageTemplate';
import { PageHeader } from './PageHeader';

// The test runner ignores the padded layout: this padding keeps the block off the viewport edge,
// where axe cannot sample its background. Fullscreen stories skip it so the skip link stays hidden.
const fit: Decorator = (Story, { parameters }) =>
  parameters.layout === 'fullscreen' ? (
    <Story />
  ) : (
    <div style={{ padding: '1rem' }}>
      <Story />
    </div>
  );

const trail: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--omnia-palette-space-2)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  color: 'var(--omnia-color-text-muted)',
  fontFamily: 'var(--omnia-font-sans)',
};

function Trail() {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={trail}>
        <li>
          <Link href="#home" variant="inline">
            Home
          </Link>{' '}
          <span aria-hidden="true">/</span>
        </li>
        <li>
          <Link href="#projects" variant="inline">
            Projects
          </Link>{' '}
          <span aria-hidden="true">/</span>
        </li>
        <li aria-current="page">Omnia</li>
      </ol>
    </nav>
  );
}

const fullCode = `<PageHeader>
  <PageHeader.Breadcrumb>
    <nav aria-label="Breadcrumb">…</nav>
  </PageHeader.Breadcrumb>
  <PageHeader.Title>Omnia</PageHeader.Title>
  <PageHeader.Description>A themeable, bilingual design system.</PageHeader.Description>
  <PageHeader.Actions>
    <Button intent="neutral">Export</Button>
    <Button>New release</Button>
  </PageHeader.Actions>
</PageHeader>`;

const Full = ({ heading = 'Omnia' }: { heading?: string }) => (
  <PageHeader>
    <PageHeader.Breadcrumb>
      <Trail />
    </PageHeader.Breadcrumb>
    <PageHeader.Title>{heading}</PageHeader.Title>
    <PageHeader.Description>A themeable, bilingual design system.</PageHeader.Description>
    <PageHeader.Actions>
      <Button intent="neutral">Export</Button>
      <Button>New release</Button>
    </PageHeader.Actions>
  </PageHeader>
);

const meta = {
  title: 'Organisms/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  decorators: [fit],
  args: { children: null },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Breadcrumb, an `h1` title, a description and page actions; keyboard order follows the reading order. */
export const Default: Story = {
  tags: ['interaction'],
  parameters: { controls: { disable: true }, docs: { source: { code: fullCode } } },
  render: () => <Full />,
  play: async ({ canvas, step }) => {
    await step('the title is the page h1', async () => {
      await expect(canvas.getByRole('heading', { level: 1 })).toHaveAccessibleName(
        'Omnia',
      );
    });
    await step('focus walks the breadcrumb links, then the actions', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('link', { name: 'Home' })).toHaveFocus();
      await userEvent.tab();
      await expect(canvas.getByRole('link', { name: 'Projects' })).toHaveFocus();
      await userEvent.tab();
      const exportButton = canvas.getByRole('button', { name: 'Export' });
      await expect(exportButton).toHaveFocus();
      exportButton.blur();
    });
  },
};

export const TitleOnly: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<PageHeader>\n  <PageHeader.Title>Settings</PageHeader.Title>\n</PageHeader>',
      },
    },
  },
  render: () => (
    <PageHeader>
      <PageHeader.Title>Settings</PageHeader.Title>
    </PageHeader>
  ),
};

export const WithoutBreadcrumb: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<PageHeader>
  <PageHeader.Title>Projects</PageHeader.Title>
  <PageHeader.Description>Everything your team is shipping this quarter.</PageHeader.Description>
  <PageHeader.Actions>
    <Button>New project</Button>
  </PageHeader.Actions>
</PageHeader>`,
      },
    },
  },
  render: () => (
    <PageHeader>
      <PageHeader.Title>Projects</PageHeader.Title>
      <PageHeader.Description>
        Everything your team is shipping this quarter.
      </PageHeader.Description>
      <PageHeader.Actions>
        <Button>New project</Button>
      </PageHeader.Actions>
    </PageHeader>
  ),
};

/** The page's title block, first inside `PageTemplate.Main`; the template's header stays the banner. */
export const InPageTemplate: Story = {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      source: {
        code: `<PageTemplate>
  <PageTemplate.Header>…</PageTemplate.Header>
  <PageTemplate.Main>
    ${fullCode.replace(/\n/g, '\n    ')}
  </PageTemplate.Main>
</PageTemplate>`,
      },
    },
  },
  render: () => (
    <PageTemplate>
      <PageTemplate.Header
        style={{
          padding: 'var(--omnia-palette-space-4)',
          background: 'var(--omnia-color-bg-subtle)',
          color: 'var(--omnia-color-text-primary)',
          fontFamily: 'var(--omnia-font-sans)',
        }}
      >
        <strong>Omnia</strong>
      </PageTemplate.Header>
      <PageTemplate.Main
        style={{
          display: 'grid',
          alignContent: 'start',
          gap: 'var(--omnia-palette-space-5)',
          padding: 'var(--omnia-palette-space-4)',
        }}
      >
        <Full />
        <Text>Release notes, tokens and components live below the page header.</Text>
      </PageTemplate.Main>
    </PageTemplate>
  ),
};

/** A long title wraps and, in a narrow block, the actions drop under the text. */
export const LongTitleNarrow: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: fullCode } } },
  render: () => (
    <div style={{ inlineSize: '18rem' }}>
      <Full heading="Quarterly accessibility review for every component" />
    </div>
  ),
};
