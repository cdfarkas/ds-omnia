import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../../atoms/Button';
import { SectionHeading } from './SectionHeading';
import './SectionHeading.overrides.css';

// The test runner ignores the padded layout: this block padding keeps the heading off the
// viewport edge, where axe cannot sample its background.
const fit: Decorator = (Story) => (
  <div style={{ padding: '1rem' }}>
    <Story />
  </div>
);

const full = (
  <>
    <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
    <SectionHeading.Description>
      Everything your team is shipping this quarter.
    </SectionHeading.Description>
    <SectionHeading.Actions>
      <Button intent="neutral">Export</Button>
      <Button>New project</Button>
    </SectionHeading.Actions>
  </>
);

const fullCode = `<SectionHeading>
  <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
  <SectionHeading.Description>Everything your team is shipping this quarter.</SectionHeading.Description>
  <SectionHeading.Actions>
    <Button intent="neutral">Export</Button>
    <Button>New project</Button>
  </SectionHeading.Actions>
</SectionHeading>`;

const meta = {
  title: 'Molecules/SectionHeading',
  component: SectionHeading,
  parameters: { layout: 'padded' },
  decorators: [fit],
  args: { children: full },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controllable surface, and the catalogue a11y check: heading, description and actions. */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: { docs: { source: { code: fullCode } } },
  render: (args) => <SectionHeading {...args} />,
  play: async ({ canvas, step }) => {
    await step('the title is a level-2 heading with an accessible name', async () => {
      const heading = canvas.getByRole('heading', { level: 2 });
      await expect(heading).toHaveAccessibleName('Projects');
    });
    await step('the description text is present', async () => {
      await expect(canvas.getByText(/shipping this quarter/i)).toBeInTheDocument();
    });
    await step('the section actions are reachable as buttons', async () => {
      await expect(canvas.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      await expect(
        canvas.getByRole('button', { name: 'New project' }),
      ).toBeInTheDocument();
    });
  },
};

export const TitleOnly: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<SectionHeading>
  <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
</SectionHeading>`,
      },
    },
  },
  render: () => (
    <SectionHeading>
      <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
    </SectionHeading>
  ),
};

export const WithDescription: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<SectionHeading>
  <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
  <SectionHeading.Description>Everything your team is shipping this quarter.</SectionHeading.Description>
</SectionHeading>`,
      },
    },
  },
  render: () => (
    <SectionHeading>
      <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
      <SectionHeading.Description>
        Everything your team is shipping this quarter.
      </SectionHeading.Description>
    </SectionHeading>
  ),
};

export const WithActions: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<SectionHeading>
  <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
  <SectionHeading.Actions>
    <Button>New project</Button>
  </SectionHeading.Actions>
</SectionHeading>`,
      },
    },
  },
  render: () => (
    <SectionHeading>
      <SectionHeading.Title level={2}>Projects</SectionHeading.Title>
      <SectionHeading.Actions>
        <Button>New project</Button>
      </SectionHeading.Actions>
    </SectionHeading>
  ),
};

/** In a narrow container the actions drop under the text, whatever the viewport width. */
export const Narrow: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: fullCode } } },
  render: () => (
    <div style={{ inlineSize: '18rem', maxInlineSize: '100%' }}>
      <SectionHeading>{full}</SectionHeading>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-section-heading` class in
 * `@layer overrides` re-points the two gap variables — no `!important`, no hashed class names.
 * See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<SectionHeading className="omnia-demo-override-section-heading">…</SectionHeading>',
      },
    },
  },
  args: { className: 'omnia-demo-override-section-heading' },
  render: (args) => <SectionHeading {...args} />,
};

const Full: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: fullCode } } },
  render: () => <SectionHeading>{full}</SectionHeading>,
};

export const DarkNeutral: Story = { ...Full, globals: { theme: 'dark' } };

export const PixelLight: Story = { ...Full, globals: { skin: 'pixel' } };

export const PixelDark: Story = {
  ...Full,
  globals: { theme: 'dark', skin: 'pixel' },
};
