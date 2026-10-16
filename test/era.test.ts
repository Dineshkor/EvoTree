import { describe, it, expect } from 'vitest';
import { eraForTime, paletteById } from '../lib/era';

describe('era mapping', () => {
  it('maps ages to the correct era', () => {
    expect(eraForTime(4000).id).toBe('origin');
    expect(eraForTime(508).id).toBe('cambrian');
    expect(eraForTime(375).id).toBe('land');
    expect(eraForTime(252).id).toBe('extinction');
    expect(eraForTime(66).id).toBe('extinction');
    expect(eraForTime(0).id).toBe('present');
  });

  it('always returns a palette with usable colors', () => {
    for (const mya of [4000, 508, 375, 252, 66, 0]) {
      const p = eraForTime(mya);
      expect(p.from.length).toBeGreaterThan(0);
      expect(p.to.length).toBeGreaterThan(0);
      expect(p.accent.length).toBeGreaterThan(0);
    }
  });

  it('resolves a palette by id', () => {
    expect(paletteById('extinction').particle).toBe('ash');
  });
});
