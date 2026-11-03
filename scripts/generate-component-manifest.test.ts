import { describe, expect, test } from 'vitest';
import {
  buildManifest,
  discoverComponents,
  DEFAULT_ROOT,
} from './generate-component-manifest.mjs';

describe('component manifest generator', () => {
  const manifest = buildManifest();

  test('has an entry for every component exported from src/index.ts', () => {
    const exported = discoverComponents(DEFAULT_ROOT).map((c) => c.name);
    expect(manifest.components.map((c) => c.name)).toEqual(exported);
    expect(exported).toContain('Button');
  });

  test('extracts Button props with types, defaults and options', () => {
    const button = manifest.components.find((c) => c.name === 'Button');
    const intent = button?.props.find((p) => p.name === 'intent');
    expect(intent).toMatchObject({
      type: 'ButtonIntent',
      required: false,
      default: "'primary'",
    });
    expect(intent?.options).toContain('danger');
    expect(button?.props.find((p) => p.name === 'variantSize')?.default).toBe("'md'");
    expect(button?.props.find((p) => p.name === 'children')?.required).toBe(true);
    expect(button?.variantAxes).toEqual(['intent', 'variantSize']);
  });

  test('reads a compound molecule through its Root function', () => {
    const list = manifest.components.find((c) => c.name === 'List');
    expect(list?.source).toBe('src/components/molecules/List/List.tsx');
    expect(list?.description).toMatch(/List\.Item/);
    expect(list?.props.find((p) => p.name === 'as')?.default).toBe("'ul'");
  });

  test('every component resolves to a non-empty, well-formed entry', () => {
    for (const c of manifest.components) {
      expect(c.props.length).toBeGreaterThan(0);
      expect(c.stories.length).toBeGreaterThan(0);
      for (const p of c.props) {
        expect(typeof p.name).toBe('string');
        expect(typeof p.type).toBe('string');
        expect(typeof p.required).toBe('boolean');
      }
      for (const axis of c.variantAxes) {
        expect(c.props.find((p) => p.name === axis)?.options).toBeDefined();
      }
    }
  });

  test('re-running the generator is deterministic', () => {
    expect(JSON.stringify(buildManifest())).toBe(JSON.stringify(manifest));
  });
});
