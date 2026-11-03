import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { intents, type Intent } from '../../../lib/intents';
import { Indicator } from './Indicator';
import './Indicator.overrides.css';

const row = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
} as const;

const meta = {
  title: 'Atoms/Indicator',
  component: Indicator,
  args: { intent: 'neutral', variantSize: 'md', pulse: false, 'aria-label': 'Status' },
  argTypes: {
    intent: { control: 'inline-radio', options: [...intents] },
    variantSize: { control: 'inline-radio', options: ['sm', 'md'] },
    pulse: { control: 'boolean' },
  },
} satisfies Meta<typeof Indicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the dot is an img named by its state. */
export const Playground: Story = {
  tags: ['interaction'],
  render: (args) => <Indicator {...args} />,
  play: async ({ canvas, step }) => {
    await step('the indicator is an img named by its state', async () => {
      const img = canvas.getByRole('img');
      await expect(img).toHaveAccessibleName('Status');
    });
  },
};

const intentLabel: Record<Intent, string> = {
  primary: 'Primary',
  neutral: 'Idle',
  success: 'Available',
  warning: 'Degraded',
  info: 'Syncing',
  danger: 'Offline',
};

export const Intents: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Indicator intent="success" aria-label="Available" />' } },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
      {intents.map((intent) => (
        <Indicator key={intent} intent={intent} aria-label={intentLabel[intent]} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Indicator variantSize="sm" aria-label="Available" />' } },
  },
  render: () => (
    <div style={row}>
      <Indicator variantSize="sm" intent="success" aria-label="Available" />
      <Indicator variantSize="md" intent="success" aria-label="Available" />
    </div>
  ),
};

/** The live state: a pulsing halo draws the eye; it stops under prefers-reduced-motion. */
export const Pulse: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Indicator intent="success" pulse aria-label="Live" />' } },
  },
  render: () => (
    <div style={row}>
      <Indicator intent="success" pulse aria-label="Live" />
      <Indicator intent="danger" pulse aria-label="Recording" />
    </div>
  ),
};

/**
 * Decorative: a caller whose own text already states the status passes `aria-hidden` (spread
 * after the defaults), dropping the dot from the accessibility tree.
 */
export const Decorative: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<Indicator intent="success" aria-hidden="true" aria-label="Available" />',
      },
    },
  },
  render: () => (
    <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
      <Indicator intent="success" aria-hidden="true" aria-label="Available" />
      Available
    </span>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-indicator` class in
 * `@layer overrides` re-points `--omnia-indicator-color` — no `!important`, no hashed names.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-indicator', 'aria-label': 'Custom' },
};

export const DarkNeutral: Story = { ...Intents, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Intents, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...Intents, globals: { theme: 'dark', skin: 'pixel' } };
