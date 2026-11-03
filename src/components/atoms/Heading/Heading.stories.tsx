import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Heading, type HeadingLevel, type HeadingSize } from './Heading';
import './Heading.overrides.css';

// Padding keeps the large heading off the viewport edge, where axe cannot sample the
// background behind the glyphs and reports an unresolved ("obscured") contrast result.
const fit: Decorator = (Story) => (
  <div style={{ display: 'inline-block', padding: '1rem' }}>
    <Story />
  </div>
);

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  alignItems: 'flex-start',
} as const;

const label = {
  fontFamily: 'var(--omnia-font-sans)',
  fontSize: '0.75rem',
  color: 'var(--omnia-color-text-muted)',
} as const;

const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
const sizes: HeadingSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const meta = {
  title: 'Atoms/Heading',
  component: Heading,
  args: { level: 2, children: 'The quick brown fox' },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    variantSize: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the heading exposes an accessible name. */
export const Playground: Story = {
  tags: ['interaction'],
  decorators: [fit],
  render: (args) => <Heading {...args} />,
  play: async ({ canvas, step }) => {
    await step('the heading is a level-2 heading with an accessible name', async () => {
      const heading = canvas.getByRole('heading', { level: 2 });
      await expect(heading).toHaveAccessibleName(/quick brown fox/i);
    });
  },
};

export const Levels: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Heading level={1}>Heading</Heading>' } },
  },
  render: () => (
    <div style={column}>
      {levels.map((level) => (
        <div key={level}>
          <span style={label}>{`level ${level}`}</span>
          <Heading level={level}>The quick brown fox</Heading>
        </div>
      ))}
    </div>
  ),
};

export const Scale: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Heading level={2} variantSize="2xl">Heading</Heading>' } },
  },
  render: () => (
    <div style={column}>
      {sizes.map((size) => (
        <div key={size}>
          <span style={label}>{size}</span>
          <Heading level={2} variantSize={size}>
            The quick brown fox
          </Heading>
        </div>
      ))}
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-heading` class in
 * `@layer overrides` re-points `--omnia-heading-color`/`--omnia-heading-font-weight` — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  decorators: [fit],
  args: { level: 2, className: 'omnia-demo-override-heading', children: 'Overridden' },
};

export const DarkNeutral: Story = { ...Levels, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Levels, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Levels,
  globals: { theme: 'dark', skin: 'pixel' },
};
