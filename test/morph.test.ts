import { describe, it, expect } from 'vitest';
import { morphAt, WHALE_MORPH } from '../lib/morph';

describe('morph interpolation', () => {
  it('starts at the first stage and ends at the last', () => {
    expect(morphAt(WHALE_MORPH, 0).nearId).toBe('pakicetus');
    expect(morphAt(WHALE_MORPH, 1).nearId).toBe('blue-whale');
  });

  it('clamps out-of-range progress', () => {
    expect(morphAt(WHALE_MORPH, -5)).toEqual(morphAt(WHALE_MORPH, 0));
    expect(morphAt(WHALE_MORPH, 9)).toEqual(morphAt(WHALE_MORPH, 1));
  });

  it('increases scale monotonically across the chain', () => {
    const a = morphAt(WHALE_MORPH, 0).scaleMeters;
    const b = morphAt(WHALE_MORPH, 0.5).scaleMeters;
    const c = morphAt(WHALE_MORPH, 1).scaleMeters;
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it('reports a segment with an interpolation factor', () => {
    const mid = morphAt(WHALE_MORPH, 0.5);
    expect(mid.t).toBeGreaterThanOrEqual(0);
    expect(mid.t).toBeLessThanOrEqual(1);
    expect(mid.fromId).not.toBe(mid.toId);
  });
});
