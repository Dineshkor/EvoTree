import { describe, it, expect } from 'vitest';
import {
  timeToY,
  assignPositions,
  laneFor,
  SPINE_HEIGHT,
  TRUNK_X,
  LANE_SPACING,
} from '../lib/layout';
import { SPECIES } from '../lib/data/species';

describe('layout', () => {
  it('anchors Present at the top and 4000 MYA at the bottom', () => {
    expect(timeToY(0)).toBe(0);
    expect(timeToY(4000)).toBe(SPINE_HEIGHT);
  });

  it('is strictly increasing with age', () => {
    expect(timeToY(0)).toBeLessThan(timeToY(50));
    expect(timeToY(50)).toBeLessThan(timeToY(375));
    expect(timeToY(375)).toBeLessThan(timeToY(4000));
  });

  it('assigns an in-range position to every species', () => {
    const pos = assignPositions(SPECIES);
    for (const s of SPECIES) {
      expect(pos[s.id]).toBeDefined();
      expect(pos[s.id].y).toBeGreaterThanOrEqual(0);
      expect(pos[s.id].y).toBeLessThanOrEqual(SPINE_HEIGHT);
    }
  });

  it('separates different lineages horizontally', () => {
    expect(laneFor('whales')).not.toBe(laneFor('trunk'));
    expect(laneFor('crabs')).not.toBe(laneFor('whales'));
    expect(laneFor('trunk')).toBe(0);
  });

  it('places same-lineage lanes at the expected offset', () => {
    const pos = assignPositions(SPECIES);
    expect(Math.abs(pos['blue-whale'].x - TRUNK_X)).toBeLessThan(
      Math.abs(laneFor('whales') * LANE_SPACING) + 40,
    );
  });
});
