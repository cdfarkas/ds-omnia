import { describe, test, expect } from 'vitest';
import { skins } from '../../../lib/OmniaThemeProvider';
import { glyphMap, ICON_GLYPHS, type IconStyle } from './glyphMap';

const styles: readonly IconStyle[] = ['regular', 'solid'];

describe('glyph map', () => {
  test('lists exactly 33 unique glyph names', () => {
    expect(new Set(ICON_GLYPHS).size).toBe(33);
  });

  test('resolves every glyph in both styles for both skins (132 raw SVGs)', () => {
    const missing: string[] = [];
    let resolved = 0;
    for (const skin of skins) {
      for (const style of styles) {
        for (const glyph of ICON_GLYPHS) {
          const svg = glyphMap[skin][style][glyph];
          if (typeof svg === 'string' && svg.includes('<svg')) resolved += 1;
          else missing.push(`${skin}/${style}/${glyph}`);
        }
      }
    }
    expect(missing).toEqual([]);
    expect(resolved).toBe(132);
  });
});
