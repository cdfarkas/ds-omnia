import { useState } from 'react';
import { Input } from '../Input';
import { useLocale } from '../../../lib/Localized';
import { Icon } from './Icon';
import { ICON_GLYPHS, type IconGlyph } from './glyphMap';
import styles from './catalog.module.css';

interface IconCategory {
  en: string;
  fr: string;
  glyphs: readonly IconGlyph[];
}

/** Static category map; each of the 33 glyphs appears exactly once (guarded by a test). Adjustable. */
export const ICON_CATEGORIES: readonly IconCategory[] = [
  {
    en: 'Navigation',
    fr: 'Navigation',
    glyphs: [
      'menu',
      'home',
      'chevron-down',
      'chevron-right',
      'arrow-left',
      'arrow-right',
      'external-link',
    ],
  },
  {
    en: 'Actions',
    fr: 'Actions',
    glyphs: [
      'search',
      'edit',
      'copy',
      'trash',
      'download',
      'upload',
      'settings',
      'plus',
      'minus',
      'close',
    ],
  },
  {
    en: 'Feedback',
    fr: 'Retour',
    glyphs: ['info', 'success', 'warning', 'error', 'loader', 'check'],
  },
  {
    en: 'Display',
    fr: 'Affichage',
    glyphs: ['eye', 'eye-off', 'sun', 'moon'],
  },
  {
    en: 'Content',
    fr: 'Contenu',
    glyphs: ['calendar', 'user', 'globe', 'bell', 'heart', 'star'],
  },
];

/** Case-insensitive substring filter over the glyph names; empty/blank query returns all 33. */
export function filterGlyphs(query: string): IconGlyph[] {
  const q = query.trim().toLowerCase();
  return q ? ICON_GLYPHS.filter((glyph) => glyph.includes(q)) : [...ICON_GLYPHS];
}

/**
 * Docs-only searchable catalogue: the 33 glyphs grouped by category, each cell showing both the
 * `regular` and `solid` style plus the name a consumer passes to `glyph`. Not public API.
 */
export function IconCatalog() {
  const [query, setQuery] = useState('');
  const locale = useLocale();
  const matched = new Set(filterGlyphs(query));
  const visible = ICON_CATEGORIES.map((category) => ({
    label: locale === 'fr' ? category.fr : category.en,
    glyphs: category.glyphs.filter((glyph) => matched.has(glyph)),
  })).filter((category) => category.glyphs.length > 0);
  const label = locale === 'fr' ? 'Filtrer les icônes par nom' : 'Filter icons by name';

  return (
    <div className={styles.root}>
      <Input
        className={styles.search}
        aria-label={label}
        placeholder={label}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        startAdornment={<Icon glyph="search" />}
      />
      {visible.length > 0 ? (
        visible.map((category) => (
          <section key={category.label} className={styles.category}>
            <h3 className={styles.heading}>{category.label}</h3>
            <ul className={styles.grid}>
              {category.glyphs.map((glyph) => (
                <li key={glyph} className={styles.cell}>
                  <span className={styles.glyphs}>
                    <Icon glyph={glyph} variantStyle="regular" variantSize="md" />
                    <Icon glyph={glyph} variantStyle="solid" variantSize="md" />
                  </span>
                  <code className={styles.name}>{glyph}</code>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className={styles.empty}>
          {locale === 'fr' ? 'Aucune icône' : 'No icons'} “{query}”
        </p>
      )}
    </div>
  );
}
