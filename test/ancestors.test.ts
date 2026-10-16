import { describe, it, expect } from 'vitest';
import {
  pathToRoot,
  lineagePath,
  commonAncestor,
  ancestorVerdict,
} from '../lib/ancestors';

describe('ancestors', () => {
  it('walks a chain from a node to its root', () => {
    expect(pathToRoot('luca')).toEqual(['luca']);
    expect(pathToRoot('blue-whale')[0]).toBe('blue-whale');
    expect(pathToRoot('blue-whale').at(-1)).toBe('luca');
  });

  it('returns the lineage path root-first', () => {
    const path = lineagePath('blue-whale');
    expect(path[0]).toBe('luca');
    expect(path.at(-1)).toBe('blue-whale');
  });

  it('finds the common ancestor of two related species', () => {
    expect(commonAncestor('pakicetus', 'blue-whale')).toBe('pakicetus');
    expect(commonAncestor('luca', 'luca')).toBe('luca');
    expect(commonAncestor('human', 'mushroom')).toBe('luca');
  });

  it('returns null when a species is unknown', () => {
    expect(commonAncestor('luca', 'nope')).toBeNull();
    expect(pathToRoot('nope')).toEqual([]);
  });

  it('produces a verdict for a known mashup pair and a fallback otherwise', () => {
    expect(ancestorVerdict('human', 'mushroom')).toContain('1.5 billion');
    expect(ancestorVerdict('cyanobacteria', 'blue-whale')).toBeTruthy();
    expect(ancestorVerdict('luca', 'nope')).toBeNull();
  });
});
