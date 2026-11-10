import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Grid } from './Grid';
import './Grid.overrides.css';

const cell = {
  padding: '1rem',
  border: 'var(--omnia-border-width-regular) solid var(--omnia-color-border-default)',
  borderRadius: 'var(--omnia-radius-md)',
  background: 'var(--omnia-color-bg-subtle)',
  color: 'var(--omnia-color-text-primary)',
  textAlign: 'center',
} as const;

const label = {
  display: 'block',
  marginBlockEnd: '0.5rem',
  fontSize: '0.75rem',
  color: 'var(--omnia-color-text-muted)',
} as const;

const stack = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

function cells(count: number) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} style={cell} data-testid="cell">
      {i + 1}
    </div>
  ));
}

const meta = {
  title: 'Atoms/Grid',
  component: Grid,
  parameters: { layout: 'padded' },
  args: { columns: 3, gap: 'md' },
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6 } },
    gap: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Up to `columns` equal columns with a `gap`. Shrink the frame and the grid reflows to fewer. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Grid {...args}>{cells(6)}</Grid>,
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-part="root"]') as HTMLElement;
    await expect(root).toHaveAttribute('data-columns', '3');
    await expect(getComputedStyle(root).display).toBe('grid');
    await expect(canvas.getAllByTestId('cell')).toHaveLength(6);
  },
};

/** The column cap: each grid holds up to `columns` tracks, collapsing as the frame narrows. */
export const Columns: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: { code: '<Grid columns={4}>…</Grid>' },
    },
  },
  render: () => (
    <div style={stack}>
      {([2, 3, 4] as const).map((n) => (
        <div key={n}>
          <span style={label}>columns={n}</span>
          <Grid columns={n}>{cells(n + 2)}</Grid>
        </div>
      ))}
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-grid` class in
 * `@layer overrides` re-points `--omnia-grid-min`/`--omnia-grid-gap` — no `!important`.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-grid', columns: 4 },
  render: (args) => <Grid {...args}>{cells(8)}</Grid>,
};
