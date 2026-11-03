import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Badge } from '../../atoms/Badge';
import { Link } from '../../atoms/Link';
import { Text } from '../../atoms/Text';
import { List } from './List';
import './List.overrides.css';

const items = (
  <>
    <List.Item>Tokens drive every colour</List.Item>
    <List.Item>Two themes and two skins</List.Item>
    <List.Item>Labels in French and English</List.Item>
  </>
);

const meta = {
  title: 'Molecules/List',
  component: List,
  args: { as: 'ul', children: items },
  argTypes: {
    as: { control: 'inline-radio', options: ['ul', 'ol'] },
    children: { control: false },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the list exposes its items. */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: {
    docs: {
      source: {
        code: '<List>\n  <List.Item>Tokens drive every colour</List.Item>\n  <List.Item>Two themes and two skins</List.Item>\n</List>',
      },
    },
  },
  render: (args) => <List {...args} />,
  play: async ({ canvas, step }) => {
    await step('the list exposes its three items', async () => {
      const list = canvas.getByRole('list');
      await expect(list).toBeInTheDocument();
      await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    });
  },
};

export const Ordered: Story = {
  args: { as: 'ol' },
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<List as="ol">\n  <List.Item>Install the package</List.Item>\n  <List.Item>Import the styles</List.Item>\n</List>',
      },
    },
  },
  render: (args) => (
    <List {...args}>
      <List.Item>Install the package</List.Item>
      <List.Item>Import the styles</List.Item>
      <List.Item>Wrap the app in the theme provider</List.Item>
    </List>
  ),
};

export const Nested: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<List>\n  <List.Item>\n    Atoms\n    <List>\n      <List.Item>Button</List.Item>\n    </List>\n  </List.Item>\n</List>',
      },
    },
  },
  render: () => (
    <List>
      <List.Item>
        Atoms
        <List>
          <List.Item>Button</List.Item>
          <List.Item>Badge</List.Item>
        </List>
      </List.Item>
      <List.Item>
        Getting started
        <List as="ol">
          <List.Item>Install the package</List.Item>
          <List.Item>Import the styles</List.Item>
        </List>
      </List.Item>
      <List.Item>Molecules</List.Item>
    </List>
  ),
};

export const RichItems: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<List.Item>\n  <Link href="#tokens" variant="inline">Tokens</Link>{\' \'}\n  <Badge intent="success">Stable</Badge>\n</List.Item>',
      },
    },
  },
  render: () => (
    <List>
      <List.Item>
        <Link href="#tokens" variant="inline">
          Tokens
        </Link>{' '}
        <Badge intent="success">Stable</Badge>
      </List.Item>
      <List.Item>
        <Link href="#theming" variant="inline">
          Theming
        </Link>{' '}
        <Text as="span" tone="muted">
          — light, dark, neutral and pixel
        </Text>
      </List.Item>
      <List.Item>
        <Text as="span">Navigation bar</Text> <Badge intent="warning">Planned</Badge>
      </List.Item>
    </List>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-list` class in
 * `@layer overrides` re-points `--omnia-list-marker-color` — no `!important`, no hashed class
 * names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-list' },
};

export const DarkNeutral: Story = { ...Nested, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Nested, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Nested,
  globals: { theme: 'dark', skin: 'pixel' },
};
