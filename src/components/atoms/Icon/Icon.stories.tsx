import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon, type IconGlyph } from './Icon';
import './Icon.overrides.css';

const glyphNames: readonly IconGlyph[] = [
  'github',
  'linkedin',
  'bluesky',
  'sun',
  'moon',
  'arrow-up-right',
  'arrow-down',
];

const gallery = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5rem',
} as const;

const cell = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.75rem',
} as const;

const row = { display: 'flex', gap: '1.5rem', alignItems: 'center' } as const;

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  args: { glyph: 'github', variantSize: 'lg' },
  argTypes: {
    glyph: { control: 'select', options: glyphNames },
    variantSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    chromatic: {
      modes: {
        'light-neutral': { theme: 'light', skin: 'default' },
        'dark-neutral': { theme: 'dark', skin: 'default' },
        'light-pixel': { theme: 'light', skin: 'pixel' },
        'dark-pixel': { theme: 'dark', skin: 'pixel' },
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: a labelled icon is a named `img`. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Icon {...args} aria-label="GitHub" />,
  play: async ({ canvas, step }) => {
    await step('a labelled icon exposes a named img role', async () => {
      await expect(canvas.getByRole('img', { name: 'GitHub' })).toBeVisible();
    });
  },
};

/** Every v1 glyph, each labelled with its name so the whole set is legible side by side. */
export const AllGlyphs: Story = {
  render: (args) => (
    <div style={gallery}>
      {glyphNames.map((g) => (
        <div key={g} style={cell}>
          <Icon {...args} glyph={g} aria-label={g} />
          <code>{g}</code>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Icon {...args} glyph="arrow-up-right" variantSize="sm" aria-label="small" />
      <Icon {...args} glyph="arrow-up-right" variantSize="md" aria-label="medium" />
      <Icon {...args} glyph="arrow-up-right" variantSize="lg" aria-label="large" />
    </div>
  ),
};

/**
 * Decorative: no label, so the icon is `aria-hidden` and dropped from the accessibility tree.
 * It follows the surrounding text colour and size via `currentColor` and no `variantSize`.
 */
export const Decorative: Story = {
  render: () => (
    <span style={{ ...row, fontSize: '1.25rem' }}>
      Open in a new tab
      <Icon glyph="arrow-up-right" />
    </span>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-icon` class in
 * `@layer overrides` re-points `--omnia-icon-color` — no `!important`, no hashed class names.
 */
export const Overridden: Story = {
  render: (args) => (
    <Icon {...args} glyph="moon" className="omnia-demo-override-icon" aria-label="moon" />
  ),
};

export const DarkNeutral: Story = { ...AllGlyphs, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...AllGlyphs, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...AllGlyphs,
  globals: { theme: 'dark', skin: 'pixel' },
};
