import { expect, test } from 'vitest';
import { gateProbe } from './gate-probe';

test('gateProbe returns pos for positive input', () => {
  expect(gateProbe(1)).toBe('pos');
});

test('gateProbe returns nonpos for zero and negative input', () => {
  expect(gateProbe(0)).toBe('nonpos');
  expect(gateProbe(-1)).toBe('nonpos');
});
