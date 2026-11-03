import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Icon } from './Icon';
import { IconCatalog } from './catalog';
import { ICON_GLYPHS } from './glyphMap';
import './Icon.overrides.css';

const row = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
} as const;

const gallery = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))',
  gap: '1rem',
  fontSize: '1.5rem',
} as const;

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  args: { glyph: 'home', variantStyle: 'regular' },
  argTypes: {
    glyph: { control: 'select', options: [...ICON_GLYPHS] },
    variantStyle: { control: 'inline-radio', options: ['regular', 'solid'] },
    variantSize: { control: 'inline-radio', options: [undefined, 'sm', 'md', 'lg'] },
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

/** Controllable surface, and the catalogue a11y check: a labelled icon is a named `role="img"`. */
export const Playground: Story = {
  tags: ['interaction'],
  args: { variantSize: 'lg', 'aria-label': 'Home' },
  render: (args) => <Icon {...args} />,
  play: async ({ canvas, step }) => {
    await step('a labelled icon exposes an img with that name', async () => {
      const img = canvas.getByRole('img');
      await expect(img).toHaveAccessibleName('Home');
    });
  },
};

/** Searchable catalogue grouped by category, each cell showing both styles — the glyph finder. */
export const Catalog: Story = {
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: { source: { code: '<Icon glyph="home" aria-label="Home" />' } },
  },
  render: () => <IconCatalog />,
};

export const Gallery: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Icon glyph="home" aria-label="Home" />' } },
  },
  render: (args) => (
    <div style={gallery}>
      {ICON_GLYPHS.map((glyph) => (
        <Icon
          key={glyph}
          glyph={glyph}
          variantStyle={args.variantStyle}
          aria-label={glyph}
        />
      ))}
    </div>
  ),
};

export const Solid: Story = {
  ...Gallery,
  args: { variantStyle: 'solid' },
  parameters: {
    controls: { disable: true },
    docs: {
      source: { code: '<Icon glyph="home" variantStyle="solid" aria-label="Home" />' },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: { code: '<Icon glyph="star" variantSize="lg" aria-label="Large star" />' },
    },
  },
  render: () => (
    <div style={row}>
      <Icon glyph="star" variantSize="sm" aria-label="Small star" />
      <Icon glyph="star" variantSize="md" aria-label="Medium star" />
      <Icon glyph="star" variantSize="lg" aria-label="Large star" />
      <span style={{ fontSize: '2rem' }}>
        text <Icon glyph="star" aria-label="Inline star" /> flows at 1em
      </span>
    </div>
  ),
};

/**
 * Decorative (the default): no `aria-label`, so the icon is `aria-hidden` and the labelled
 * `Link`/`Button` beside it carries the meaning.
 */
export const Decorative: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Icon glyph="download" variantSize="md" />' } },
  },
  render: () => (
    <span style={row}>
      <Icon glyph="download" variantSize="md" />
      Download the report
    </span>
  ),
};

/** Labelled: an `aria-label` promotes the icon to a named `role="img"` for standalone use. */
export const Labelled: Story = {
  args: { glyph: 'warning', variantSize: 'lg', 'aria-label': 'Warning' },
  parameters: { controls: { disable: true } },
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-icon` class in
 * `@layer overrides` re-points `--omnia-icon-color`/`--omnia-icon-size` — no `!important`.
 */
export const Overridden: Story = {
  args: { glyph: 'heart', 'aria-label': 'Heart', className: 'omnia-demo-override-icon' },
  parameters: { controls: { disable: true } },
};

export const DarkNeutral: Story = { ...Gallery, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Gallery, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Gallery,
  globals: { theme: 'dark', skin: 'pixel' },
};
