import type { Meta, StoryObj } from '@storybook/react-vite';
import { intents } from '../../../lib/intents';
import { Badge } from './Badge';
import './Badge.overrides.css';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  args: {
    children: 'Badge',
    intent: 'neutral',
  },
  argTypes: {
    intent: {
      control: 'inline-radio',
      options: [...intents],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface: every arg is spread, so intent and children are live. */
export const Playground: Story = {
  render: (args) => <Badge {...args} />,
};

export const Primary: Story = { args: { intent: 'primary' } };

export const Neutral: Story = { args: { intent: 'neutral' } };

export const Danger: Story = { args: { intent: 'danger' } };

export const Intents: Story = {
  parameters: { docs: { source: { code: '<Badge intent="danger">Danger</Badge>' } } },
  render: (args) => (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
    >
      {intents.map((intent) => (
        <Badge {...args} key={intent} intent={intent}>
          {intent.charAt(0).toUpperCase() + intent.slice(1)}
        </Badge>
      ))}
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-badge` class in
 * `@layer overrides` re-points `--omnia-badge-radius`/`--omnia-badge-bg`/`--omnia-badge-fg` —
 * no `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-badge', children: 'Overridden' },
};

export const DarkNeutral: Story = { ...Intents, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Intents, globals: { skin: 'pixel' } };

export const PixelDark: Story = { ...Intents, globals: { theme: 'dark', skin: 'pixel' } };
