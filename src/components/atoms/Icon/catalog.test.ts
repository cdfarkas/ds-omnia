import { describe, test, expect } from 'vitest';
import { filterGlyphs, ICON_CATEGORIES } from './catalog';
import { ICON_GLYPHS } from './glyphMap';

describe('filterGlyphs', () => {
  test('empty or blank query returns all 33', () => {
    expect(filterGlyphs('')).toHaveLength(33);
    expect(filterGlyphs('   ')).toHaveLength(33);
  });

  test('matches a case-insensitive substring of the glyph name', () => {
    expect(filterGlyphs('CHEV')).toEqual(['chevron-down', 'chevron-right']);
    expect(filterGlyphs('eye')).toEqual(['eye', 'eye-off']);
    expect(filterGlyphs('arrow')).toEqual(['arrow-left', 'arrow-right']);
  });

  test('a query with no match returns an empty list', () => {
    expect(filterGlyphs('zzz')).toEqual([]);
  });
});

describe('ICON_CATEGORIES', () => {
  test('covers every glyph exactly once', () => {
    const grouped = ICON_CATEGORIES.flatMap((category) => category.glyphs);
    expect(grouped).toHaveLength(ICON_GLYPHS.length);
    expect([...grouped].sort()).toEqual([...ICON_GLYPHS].sort());
  });
});
