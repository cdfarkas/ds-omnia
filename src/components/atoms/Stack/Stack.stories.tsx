import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Stack } from './Stack';
import './Stack.overrides.css';

const item = {
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

const group = { display: 'flex', flexDirection: 'column', gap: '1.5rem' } as const;

const card = {
  padding: '1rem',
  border: 'var(--omnia-border-width-regular) solid var(--omnia-color-border-default)',
  borderRadius: 'var(--omnia-radius-md)',
  background: 'var(--omnia-color-bg-subtle)',
  maxWidth: '420px',
} as const;

const heading = { fontWeight: 600, color: 'var(--omnia-color-text-primary)' } as const;
const action = { fontSize: '0.75rem', color: 'var(--omnia-color-text-muted)' } as const;

function items(count: number) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} style={item} data-testid="item">
      {i + 1}
    </div>
  ));
}

const meta = {
  title: 'Atoms/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
  args: { direction: 'column', gap: 'md' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['row', 'column'] },
    gap: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    alignItems: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch'],
    },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Children flow in one `direction` with a consistent `gap`. Flip the controls to compare. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Stack {...args}>{items(4)}</Stack>,
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-part="root"]') as HTMLElement;
    await expect(root).toHaveAttribute('data-direction', 'column');
    await expect(getComputedStyle(root).display).toBe('flex');
    await expect(canvas.getAllByTestId('item')).toHaveLength(4);
  },
};

/** The two directions: `column` stacks top to bottom, `row` lines up left to right. */
export const Directions: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: { code: '<Stack direction="row">…</Stack>' },
    },
  },
  render: () => (
    <div style={group}>
      {(['column', 'row'] as const).map((d) => (
        <div key={d}>
          <span style={label}>direction={d}</span>
          <Stack direction={d}>{items(3)}</Stack>
        </div>
      ))}
    </div>
  ),
};

/**
 * Align children along each axis: `justify` on the main axis (here it spreads the row apart with
 * `between`), `alignItems` on the cross axis (here it centres them).
 */
export const Alignment: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<Stack direction="row" justify="between" alignItems="center">…</Stack>',
      },
    },
  },
  render: () => (
    <div style={group}>
      {(['start', 'center', 'end', 'between'] as const).map((j) => (
        <div key={j}>
          <span style={label}>justify={j}</span>
          <Stack direction="row" justify={j} gap="sm">
            {items(3)}
          </Stack>
        </div>
      ))}
    </div>
  ),
};

/**
 * Nest stacks to compose a layout: a `column` holds a header `row` whose `justify="between"` and
 * `alignItems="center"` push the title and action apart, over a `row` of items.
 */
export const Nested: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: [
          '<Stack gap="md">',
          '  <Stack direction="row" justify="between" alignItems="center">',
          '    <span>Title</span>',
          '    <span>Action</span>',
          '  </Stack>',
          '  <Stack direction="row" gap="sm">…</Stack>',
          '</Stack>',
        ].join('\n'),
      },
    },
  },
  render: () => (
    <Stack gap="md" style={card}>
      <Stack direction="row" justify="between" alignItems="center">
        <span style={heading}>Title</span>
        <span style={action}>Action</span>
      </Stack>
      <Stack direction="row" gap="sm">
        {items(3)}
      </Stack>
    </Stack>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-stack` class in
 * `@layer overrides` re-points `--omnia-stack-gap` — no `!important`.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-stack', direction: 'row' },
  render: (args) => <Stack {...args}>{items(4)}</Stack>,
};
