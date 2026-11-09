import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from '../../atoms/Badge';
import { Link } from '../../atoms/Link';
import { DescriptionList } from './DescriptionList';
import './DescriptionList.overrides.css';

const project = [
  <DescriptionList.Item key="name">
    <DescriptionList.Term>Name</DescriptionList.Term>
    <DescriptionList.Detail>Omnia</DescriptionList.Detail>
  </DescriptionList.Item>,
  <DescriptionList.Item key="status">
    <DescriptionList.Term>Status</DescriptionList.Term>
    <DescriptionList.Detail>
      <Badge intent="success">Stable</Badge>
    </DescriptionList.Detail>
  </DescriptionList.Item>,
  <DescriptionList.Item key="repository">
    <DescriptionList.Term>Repository</DescriptionList.Term>
    <DescriptionList.Detail>
      <Link href="https://github.com/cdfarkas/ds-omnia" variant="inline">
        cdfarkas/ds-omnia
      </Link>
    </DescriptionList.Detail>
  </DescriptionList.Item>,
  <DescriptionList.Item key="description">
    <DescriptionList.Term>Description</DescriptionList.Term>
    <DescriptionList.Detail>
      A bilingual, themeable React design system, catalogued in Storybook.
    </DescriptionList.Detail>
  </DescriptionList.Item>,
];

const meta = {
  title: 'Molecules/DescriptionList',
  component: DescriptionList,
  args: { children: project },
  argTypes: { children: { control: false } },
  parameters: { layout: 'padded', docs: { source: { type: 'dynamic' } } },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: each term is paired with its detail. */
export const Playground: Story = {
  tags: ['interaction'],
  play: async ({ canvas, step }) => {
    await step('the list exposes its terms and their details', async () => {
      const terms = canvas.getAllByRole('term');
      expect(terms.map((term) => term.textContent)).toEqual([
        'Name',
        'Status',
        'Repository',
        'Description',
      ]);
      expect(canvas.getAllByRole('definition')).toHaveLength(4);
    });
    await step('each detail sits in the same item as its term', async () => {
      const item = canvas.getByText('Status').parentElement as HTMLElement;
      expect(within(item).getByRole('definition')).toHaveTextContent('Stable');
    });
  },
};

/** Below its width threshold the list stacks each term above its detail. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '18rem' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-description-list` class
 * in `@layer overrides` re-points the term and divider colours — no `!important`, no hashed class
 * names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-description-list' },
};

export const DarkNeutral: Story = { globals: { theme: 'dark' } };

export const PixelLight: Story = { globals: { skin: 'pixel' } };

export const PixelDark: Story = { globals: { theme: 'dark', skin: 'pixel' } };
