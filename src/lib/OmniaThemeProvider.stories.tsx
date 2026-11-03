import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/atoms/Button';
import { OmniaThemeProvider, getThemeInitScript, useTheme } from './OmniaThemeProvider';

function Demo(): ReactElement {
  const { theme, skin, locale, toggleTheme, setSkin, setLocale } = useTheme();
  return (
    <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem', maxWidth: '32rem' }}>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '0.25rem 1rem',
          margin: 0,
        }}
      >
        <dt>Theme</dt>
        <dd style={{ margin: 0 }}>{theme}</dd>
        <dt>Skin</dt>
        <dd style={{ margin: 0 }}>{skin}</dd>
        <dt>Locale</dt>
        <dd style={{ margin: 0 }}>{locale}</dd>
      </dl>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button onClick={toggleTheme}>Toggle theme</Button>
        <Button onClick={() => setSkin(skin === 'pixel' ? 'default' : 'pixel')}>
          Toggle skin
        </Button>
        <Button onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}>
          Toggle locale
        </Button>
      </div>
      <p style={{ margin: 0 }}>
        Uncontrolled: choices persist to{' '}
        <code>localStorage[&quot;omnia-theme&quot;]</code>. Reload the preview — the last
        theme, skin and locale come back.
      </p>
      <p style={{ margin: 0 }}>
        No-flash: inject <code>getThemeInitScript()</code> as an inline{' '}
        <code>&lt;head&gt;</code> script so the root attributes are set before first
        paint.
      </p>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          padding: '0.75rem',
          margin: 0,
        }}
      >
        <code>{getThemeInitScript()}</code>
      </pre>
    </div>
  );
}

const meta: Meta = {
  title: 'Foundations/Theme provider',
  parameters: {
    selfThemed: true,
    layout: 'fullscreen',
  },
};

export default meta;

export const Stateful: StoryObj = {
  render: () => (
    <OmniaThemeProvider>
      <Demo />
    </OmniaThemeProvider>
  ),
};
