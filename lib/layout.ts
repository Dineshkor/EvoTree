import type { LineageId, Species } from './types';

export const TRUNK_X = 0;
export const LANE_SPACING = 280;
export const SPINE_HEIGHT = 6000;
export const MAX_MYA = 4000;

const LOG_MAX = Math.log1p(MAX_MYA);

export function timeToY(mya: number): number {
  return (SPINE_HEIGHT * Math.log1p(mya)) / LOG_MAX;
}

const LANES: Record<LineageId, number> = {
  trunk: 0,
  whales: 1,
  crabs: -1,
  chickens: 2,
  humans: -2,
};

export function laneFor(lineage: LineageId): number {
  return LANES[lineage];
}

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 100000;
  }
  return h;
}

export function jitter(id: string): number {
  return (hash(id) % 49) - 24;
}

export interface LayoutNode {
  x: number;
  y: number;
}

export function assignPositions(species: Species[]): Record<string, LayoutNode> {
  const out: Record<string, LayoutNode> = {};
  for (const s of species) {
    out[s.id] = {
      x: TRUNK_X + laneFor(s.lineage) * LANE_SPACING + jitter(s.id),
      y: timeToY(s.mya),
    };
  }
  return out;
}
