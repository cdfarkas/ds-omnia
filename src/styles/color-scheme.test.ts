import { afterEach, describe, expect, test } from 'vitest';
import { skins } from '../lib/OmniaThemeProvider';
import './tokens.css';

const root = document.documentElement;

const modes = skins.flatMap((skin) => [
  { theme: 'light', skin },
  { theme: 'dark', skin },
]);

afterEach(() => {
  delete root.dataset.theme;
  delete root.dataset.skin;
});

describe.each(modes)('color-scheme in theme=$theme skin=$skin', ({ theme, skin }) => {
  test(`is exactly "${theme}" and the browser draws native fields to match`, () => {
    root.dataset.theme = theme;
    root.dataset.skin = skin;
    const field = document.createElement('input');
    document.body.append(field);
    const [red] = /\d+/.exec(getComputedStyle(field).backgroundColor) ?? [];
    field.remove();

    expect(getComputedStyle(root).colorScheme).toBe(theme);
    expect(Number(red) < 128).toBe(theme === 'dark');
  });
});

test('without data-theme the document stays light', () => {
  expect(getComputedStyle(root).colorScheme).toBe('light');
});
