import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Button } from '../../atoms/Button';
import { Heading } from '../../atoms/Heading';
import { Text } from '../../atoms/Text';
import { Card, type CardProps } from './Card';
import './Card.overrides.css';

const frame = { maxInlineSize: '26rem' } as const;

const fullCode = `<Card>
  <Card.Header>
    <Heading level={3} variantSize="md">Release notes</Heading>
  </Card.Header>
  <Card.Body>
    <Text>Version 2.4 ships faster search and a refreshed settings page.</Text>
  </Card.Body>
  <Card.Footer>
    <Button intent="neutral">Later</Button>
    <Button>Read more</Button>
  </Card.Footer>
</Card>`;

const FullCard = (args: CardProps) => (
  <div style={frame}>
    <Card {...args}>
      <Card.Header>
        <Heading level={3} variantSize="md">
          Release notes
        </Heading>
      </Card.Header>
      <Card.Body>
        <Text>Version 2.4 ships faster search and a refreshed settings page.</Text>
      </Card.Body>
      <Card.Footer>
        <Button intent="neutral">Later</Button>
        <Button>Read more</Button>
      </Card.Footer>
    </Card>
  </div>
);

const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full card: header, body and footer in source order, with the footer actions in tab order. */
export const Playground: Story = {
  tags: ['interaction'],
  parameters: { docs: { source: { code: fullCode } } },
  render: (args) => <FullCard {...args} />,
  play: async ({ canvas, canvasElement, step }) => {
    await step('the parts render in source order', async () => {
      const parts = [...canvasElement.querySelectorAll('[data-scope="card"]')].map((el) =>
        el.getAttribute('data-part'),
      );
      await expect(parts).toEqual(['root', 'header', 'body', 'footer']);
    });
    await step('the footer actions are reachable and clickable', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Later' })).toHaveFocus();
      const readMore = canvas.getByRole('button', { name: 'Read more' });
      await userEvent.click(readMore);
      await expect(readMore).toHaveFocus();
      readMore.blur();
      await expect(readMore).not.toHaveFocus();
    });
  },
};

/** Every part is optional: a body alone is a padded surface. */
export const BodyOnly: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: '<Card>\n  <Card.Body>…</Card.Body>\n</Card>' } },
  },
  render: () => (
    <div style={frame}>
      <Card>
        <Card.Body>
          <Text>Your workspace is up to date. Nothing needs your attention.</Text>
        </Card.Body>
      </Card>
    </div>
  ),
};

export const WithHeader: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: '<Card>\n  <Card.Header>…</Card.Header>\n  <Card.Body>…</Card.Body>\n</Card>',
      },
    },
  },
  render: () => (
    <div style={frame}>
      <Card>
        <Card.Header>
          <Heading level={3} variantSize="md">
            Storage
          </Heading>
        </Card.Header>
        <Card.Body>
          <Text>12 GB of 50 GB used.</Text>
        </Card.Body>
      </Card>
    </div>
  ),
};

/** A narrow card keeps the base padding, and its footer actions wrap onto a new line. */
export const Narrow: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: fullCode } },
  },
  render: () => (
    <div style={{ inlineSize: '15rem' }}>
      <Card>
        <Card.Header>
          <Heading level={3} variantSize="md">
            Draft
          </Heading>
        </Card.Header>
        <Card.Body>
          <Text>Last edited two hours ago.</Text>
        </Card.Body>
        <Card.Footer>
          <Button intent="neutral">Discard</Button>
          <Button intent="neutral">Preview</Button>
          <Button>Publish</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

/**
 * Consumer override through the public contract: a `.omnia-demo-override-card` class in
 * `@layer overrides` re-points `--omnia-card-border-color`/`--omnia-card-radius` — no
 * `!important`, no hashed class names. See docs/overrides.md.
 */
export const Overridden: Story = {
  parameters: { controls: { disable: true } },
  args: { className: 'omnia-demo-override-card' },
  render: (args) => <FullCard {...args} />,
};

export const DarkNeutral: Story = {
  render: (args) => <FullCard {...args} />,
  globals: { theme: 'dark' },
};

export const PixelLight: Story = {
  render: (args) => <FullCard {...args} />,
  globals: { skin: 'pixel' },
};

export const PixelDark: Story = {
  render: (args) => <FullCard {...args} />,
  globals: { theme: 'dark', skin: 'pixel' },
};
