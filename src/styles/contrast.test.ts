import { describe, expect, test } from 'vitest';
import './tokens.css';

type Rgb = [number, number, number];

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const modes = [
  { theme: 'light', skin: 'default' },
  { theme: 'dark', skin: 'default' },
  { theme: 'light', skin: 'pixel' },
  { theme: 'dark', skin: 'pixel' },
];

// SC 1.4.11 (3:1) for boundaries and indicators, SC 1.4.3 (4.5:1) for muted and placeholder text.
const pairs = [
  { fg: 'border-strong', bg: 'bg-surface', min: 3 },
  { fg: 'border-default', bg: 'bg-surface', min: 3 },
  { fg: 'border-focus', bg: 'bg-surface', min: 3 },
  { fg: 'danger-border', bg: 'bg-surface', min: 3 },
  { fg: 'text-on-accent', bg: 'accent', min: 3 },
  { fg: 'text-on-accent', bg: 'accent-hover', min: 3 },
  { fg: 'text-muted', bg: 'bg-surface', min: 4.5 },
  { fg: 'text-muted', bg: 'bg-subtle', min: 4.5 },
  { fg: 'text-muted', bg: 'bg-disabled', min: 4.5 },
  { fg: 'text-placeholder', bg: 'bg-surface', min: 4.5 },
  { fg: 'text-placeholder', bg: 'bg-subtle', min: 4.5 },
  { fg: 'text-placeholder', bg: 'bg-disabled', min: 4.5 },
];

function resolveToken(name: string): Rgb {
  const probe = document.createElement('span');
  probe.style.color = `var(--omnia-color-${name})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  const match = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(color);
  if (!match)
    throw new Error(`--omnia-color-${name} resolved to "${color}", not an opaque rgb()`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

const root = document.documentElement;

describe.each(modes)('token contrast in theme=$theme skin=$skin', ({ theme, skin }) => {
  test.each(pairs)('$fg on $bg >= $min:1', ({ fg, bg, min }) => {
    root.dataset.theme = theme;
    root.dataset.skin = skin;
    const ratio = contrastRatio(resolveToken(fg), resolveToken(bg));
    expect(
      ratio,
      `theme=${theme} skin=${skin}: --omnia-color-${fg} on --omnia-color-${bg} is ${ratio.toFixed(2)}:1, needs >= ${min}:1`,
    ).toBeGreaterThanOrEqual(min);
  });
});

describe.each(modes)('placeholder in theme=$theme skin=$skin', ({ theme, skin }) => {
  test('text-placeholder differs from text-primary', () => {
    root.dataset.theme = theme;
    root.dataset.skin = skin;
    expect(resolveToken('text-placeholder')).not.toEqual(resolveToken('text-primary'));
  });
});
