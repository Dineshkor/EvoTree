import { describe, it, expect } from 'vitest';
import { highlightedIds, dimmedIds, neighborIds } from '../lib/selectors';

describe('selectors', () => {
  it('highlights every species in an active lineage', () => {
    const hl = highlightedIds('whales');
    for (const id of ['pakicetus', 'maiacetus', 'dorudon', 'blue-whale']) {
      expect(hl.has(id)).toBe(true);
    }
    expect(hl.has('luca')).toBe(false);
  });

  it('returns empty sets in the no-filter state', () => {
    expect(highlightedIds(null).size).toBe(0);
    expect(dimmedIds(null, 'luca').size).toBe(0);
  });

  it('dims everything except the active lineage and the selection', () => {
    const dim = dimmedIds('whales', 'luca');
    expect(dim.has('blue-whale')).toBe(false);
    expect(dim.has('luca')).toBe(false);
    expect(dim.has('cyanobacteria')).toBe(true);
  });

  it('finds a node plus its parent and children, safely', () => {
    const n = neighborIds('luca');
    expect(n.has('luca')).toBe(true);
    expect(n.has('cyanobacteria')).toBe(true);
    expect(neighborIds(null).size).toBe(0);
  });
});
