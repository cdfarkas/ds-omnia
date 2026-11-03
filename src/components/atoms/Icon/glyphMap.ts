import { skins, type Skin } from '../../../lib/OmniaThemeProvider';

/** The 33 semantic glyph names vendored by ADR 0019; the one source for the union, map and stories. */
export const ICON_GLYPHS = [
  'close',
  'check',
  'chevron-down',
  'chevron-right',
  'arrow-left',
  'arrow-right',
  'external-link',
  'search',
  'plus',
  'minus',
  'menu',
  'info',
  'warning',
  'error',
  'success',
  'eye',
  'eye-off',
  'calendar',
  'user',
  'settings',
  'home',
  'trash',
  'edit',
  'copy',
  'download',
  'upload',
  'heart',
  'star',
  'bell',
  'sun',
  'moon',
  'globe',
  'loader',
] as const;

export type IconGlyph = (typeof ICON_GLYPHS)[number];
export type IconStyle = 'regular' | 'solid';

type StyleMap = Record<IconStyle, Record<IconGlyph, string>>;
export type GlyphMap = Record<Skin, StyleMap>;

const files = import.meta.glob<string>('../../../icons/*/*/*.svg', {
  query: '?raw',
  eager: true,
  import: 'default',
});

function emptyStyleMap(): StyleMap {
  return {
    regular: {} as Record<IconGlyph, string>,
    solid: {} as Record<IconGlyph, string>,
  };
}

const map: GlyphMap = Object.fromEntries(
  skins.map((skin) => [skin, emptyStyleMap()]),
) as GlyphMap;

for (const [path, svg] of Object.entries(files)) {
  const match = /\/(default|pixel)\/(regular|solid)\/(.+)\.svg$/.exec(path);
  if (!match) continue;
  const [, skin, style, glyph] = match;
  map[skin as Skin][style as IconStyle][glyph as IconGlyph] = svg;
}

export const glyphMap = map;
