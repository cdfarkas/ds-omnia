import { describe, expect, test } from 'vitest';
import css from './Heading.module.css?raw';

const skins = {
  default: '.heading',
  pixel: '[data-skin="pixel"] .heading',
  brutalist: '[data-skin="brutalist"] .heading',
};
const breakpoints = ['base', '30em', '48em', '64em', '80em'];
const steps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

function collect(
  rules: CSSRuleList,
  media: string,
  out: Map<string, CSSStyleDeclaration>,
) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule)
      out.set(`${rule.selectorText}|${media}`, rule.style);
    else if (rule instanceof CSSMediaRule)
      collect(rule.cssRules, /\d+em/.exec(rule.conditionText)?.[0] ?? '', out);
    else if (rule instanceof CSSLayerBlockRule) collect(rule.cssRules, media, out);
  }
  return out;
}

describe('Heading type scale (ADR 0036)', () => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css.replace(/:global\(([^)]*)\)/g, '$1'));
  const rules = collect(sheet.cssRules, 'base', new Map());

  for (const [skin, selector] of Object.entries(skins)) {
    test.each(breakpoints)(`${skin} declares every step in rem at %s`, (breakpoint) => {
      const style = rules.get(`${selector}|${breakpoint}`);
      for (const step of steps) {
        expect(style?.getPropertyValue(`--omnia-heading-size-${step}`).trim()).toMatch(
          /^\d+(\.\d+)?rem$/,
        );
      }
    });
  }

  test.each(breakpoints)('xs floors hold at %s', (breakpoint) => {
    const xs = (skin: keyof typeof skins) =>
      parseFloat(
        rules
          .get(`${skins[skin]}|${breakpoint}`)!
          .getPropertyValue('--omnia-heading-size-xs'),
      );
    expect(xs('pixel')).toBeGreaterThanOrEqual(0.75);
    expect(xs('brutalist')).toBe(1.0625);
  });
});
