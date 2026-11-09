import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Stat } from './Stat';
import './Stat.overrides.css';

const meta = {
  title: 'Molecules/Stat',
  component: Stat,
  args: {
    children: (
      <Stat.Item>
        <Stat.Label>components</Stat.Label>
        <Stat.Value>30+</Stat.Value>
        <Stat.Hint>in the library</Stat.Hint>
      </Stat.Item>
    ),
  },
  argTypes: {
    children: { control: false },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  parameters: { layout: 'padded', docs: { source: { type: 'dynamic' } } },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: the caption is the term, the figure its description. */
export const Playground: Story = {
  tags: ['interaction'],
  play: async ({ canvas, step }) => {
    await step(
      'the caption is the term and the figure and hint describe it',
      async () => {
        expect(canvas.getByRole('term')).toHaveTextContent('components');
        const definitions = canvas.getAllByRole('definition');
        expect(definitions.map((el) => el.textContent)).toEqual([
          '30+',
          'in the library',
        ]);
      },
    );
    await step('the figure is drawn above its caption', async () => {
      const value = canvas.getByText('30+').getBoundingClientRect();
      const label = canvas.getByRole('term').getBoundingClientRect();
      expect(value.bottom).toBeLessThanOrEqual(label.top);
    });
  },
};

export const WithoutHint: Story = {
  args: {
    children: (
      <Stat.Item>
        <Stat.Label>components</Stat.Label>
        <Stat.Value>30+</Stat.Value>
      </Stat.Item>
    ),
  },
};

/** Several figures in one list: a row that wraps to fewer columns when narrow. */
export const Several: Story = {
  render: (args) => (
    <Stat {...args}>
      <Stat.Item>
        <Stat.Label>apps</Stat.Label>
        <Stat.Value>12</Stat.Value>
        <Stat.Hint>in 5 days</Stat.Hint>
      </Stat.Item>
      <Stat.Item>
        <Stat.Label>sessions measured</Stat.Label>
        <Stat.Value>682</Stat.Value>
      </Stat.Item>
      <Stat.Item>
        <Stat.Label>median cost</Stat.Label>
        <Stat.Value>$0.51</Stat.Value>
      </Stat.Item>
      <Stat.Item>
        <Stat.Label>evals</Stat.Label>
        <Stat.Value>{'100 % / 36 %'}</Stat.Value>
      </Stat.Item>
    </Stat>
  ),
  tags: ['interaction'],
  play: async ({ canvas, canvasElement, step }) => {
    await step('the four figures form one description list', async () => {
      expect(canvasElement.querySelectorAll('dl')).toHaveLength(1);
      expect(canvas.getAllByRole('term')).toHaveLength(4);
      expect(canvasElement.querySelectorAll('[data-part="value"]')).toHaveLength(4);
    });
  },
};

export const Vertical: Story = {
  render: Several.render,
  args: { orientation: 'vertical' },
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-stat` class in
 * `@layer overrides` re-points the figure colour — no `!important`, no hashed class names.
 * See docs/overrides.md.
 */
export const Overridden: Story = {
  args: { className: 'omnia-demo-override-stat' },
};

export const DarkNeutral: Story = { globals: { theme: 'dark' } };

export const PixelLight: Story = { globals: { skin: 'pixel' } };

export const PixelDark: Story = { globals: { theme: 'dark', skin: 'pixel' } };
