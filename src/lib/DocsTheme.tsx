import type { ReactNode } from 'react';
import { useGlobal } from './Localized';
import { OmniaThemeProvider, skins, type Skin } from './OmniaThemeProvider';

/**
 * Apply the live `theme`/`skin`/`locale` toolbar globals from a story-less Docs/MDX page, where the
 * story decorator never runs. Routes through OmniaThemeProvider so docs and stories share one mechanism.
 */
export function ThemeSync(): ReactNode {
  const theme = useGlobal('theme');
  const skin = useGlobal('skin');
  const locale = useGlobal('locale');
  return (
    <OmniaThemeProvider
      theme={theme === 'dark' ? 'dark' : 'light'}
      skin={
        (skins as readonly string[]).includes(skin as string) ? (skin as Skin) : 'default'
      }
      locale={locale === 'fr' ? 'fr' : 'en'}
    />
  );
}
