import { describe, it, expect } from 'vitest';
import { SPECIES, EXTINCTIONS, getSpecies, childrenOf } from '../lib/data/species';
import type { EraId, LineageId, Rarity } from '../lib/types';

const ERAS: EraId[] = ['origin', 'cambrian', 'land', 'extinction', 'present'];
const LINEAGES: LineageId[] = ['trunk', 'whales', 'chickens', 'crabs', 'humans'];
const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

describe('seed dataset', () => {
  it('has exactly 13 unique species (14th seed node is the extinction barrier)', () => {
    expect(SPECIES).toHaveLength(13);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(13);
  });

  it('gives every species a valid parent or null, with no cycles', () => {
    const ids = new Set(SPECIES.map((s) => s.id));
    for (const s of SPECIES) {
      if (s.parent !== null) expect(ids.has(s.parent)).toBe(true);
      const seen = new Set<string>([s.id]);
      let cur = s.parent;
      while (cur) {
        expect(seen.has(cur)).toBe(false);
        seen.add(cur);
        cur = getSpecies(cur)?.parent ?? null;
      }
    }
  });

  it('has non-empty svgKey and in-union era/lineage/rarity for all', () => {
    for (const s of SPECIES) {
      expect(s.svgKey.length).toBeGreaterThan(0);
      expect(ERAS).toContain(s.era);
      expect(LINEAGES).toContain(s.lineage);
      expect(RARITIES).toContain(s.rarity);
    }
  });

  it('places extinction barriers at exactly 252 and 66 MYA', () => {
    expect(EXTINCTIONS.map((e) => e.mya).sort((a, b) => a - b)).toEqual([66, 252]);
  });

  it('looks up species by id and finds children', () => {
    expect(getSpecies('luca')?.nickname).toBe('Cell Zero');
    expect(getSpecies('nope')).toBeUndefined();
    expect(childrenOf('luca').map((s) => s.id).sort()).toContain('cyanobacteria');
  });
});
