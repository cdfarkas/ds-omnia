import { describe, expect, it } from 'vitest';
import { assertNoIncomplete, type Report } from './axe-incomplete';

const report = (incomplete: unknown[]) =>
  ({
    type: 'a11y',
    status: 'passed',
    result: { violations: [], passes: [], incomplete },
  }) as unknown as Report;

const contrast = {
  id: 'color-contrast',
  help: 'Elements must meet minimum color contrast',
  nodes: [{ target: ['#x'], failureSummary: 'needs review' }],
};

describe('assertNoIncomplete', () => {
  it('throws when axe returns an incomplete result', () => {
    expect(() =>
      assertNoIncomplete([report([contrast])], 'theme=dark skin=pixel'),
    ).toThrow(/incomplete/);
  });

  it('does not throw when incomplete is empty', () => {
    expect(() =>
      assertNoIncomplete([report([])], 'theme=light skin=default'),
    ).not.toThrow();
  });

  it('does not throw without reports', () => {
    expect(() => assertNoIncomplete(undefined, 'theme=light skin=default')).not.toThrow();
  });
});
