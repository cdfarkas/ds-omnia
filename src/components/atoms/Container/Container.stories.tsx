import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Container } from './Container';
import './Container.overrides.css';

const demo = {
  padding: '1rem',
  border: 'var(--omnia-border-width-regular) solid var(--omnia-color-border-default)',
  borderRadius: 'var(--omnia-radius-md)',
  background: 'var(--omnia-color-bg-subtle)',
  color: 'var(--omnia-color-text-primary)',
  textAlign: 'center',
} as const;

const label = {
  display: 'block',
  marginBlockEnd: '0.25rem',
  fontSize: '0.75rem',
  color: 'var(--omnia-color-text-muted)',
} as const;

const stack = { display: 'flex', flexDirection: 'column', gap: '1rem' } as const;

const meta = {
  title: 'Atoms/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: { variantSize: 'md' },
  argTypes: {
    variantSize: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Caps its content width, centers it and adds page gutters. The box marks the content column. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => (
    <Container {...args}>
      <div style={demo} data-testid="demo">
        Centered, width-capped content
      </div>
    </Container>
  ),
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-part="root"]') as HTMLElement;
    await expect(root).toHaveAttribute('data-variant-size', 'md');
    await expect(getComputedStyle(root).maxWidth).not.toBe('none');
    await expect(canvas.getByTestId('demo')).toBeInTheDocument();
  },
};

/** The width scale: sm → xl cap the content column; full removes the cap, keeping the gutters. */
export const Scale: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: { code: '<Container variantSize="lg">…</Container>' },
    },
  },
  render: () => (
    <div style={stack}>
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Container key={size} variantSize={size}>
          <div style={demo}>
            <span style={label}>variantSize=&quot;{size}&quot;</span>
            {size === 'full' ? 'Full bleed, gutters only' : `Capped at ${size}`}
          </div>
        </Container>
      ))}
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-container` class in
 * `@layer overrides` re-points `--omnia-container-max`/`--omnia-container-gutter` — no `!important`.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-container' },
  render: (args) => (
    <Container {...args}>
      <div style={demo} data-testid="demo">
        Overridden width and gutter
      </div>
    </Container>
  ),
};
