import { getSpecies } from './data/species';

export interface MorphChain {
  id: string;
  label: string;
  stageIds: string[];
}

export const WHALE_MORPH: MorphChain = {
  id: 'whales',
  label: 'Wolf → Ocean Giant',
  stageIds: ['pakicetus', 'maiacetus', 'dorudon', 'blue-whale'],
};

export interface MorphState {
  fromId: string;
  toId: string;
  t: number;
  nearId: string;
  upgrade: string;
  lost: string;
  scaleLabel: string;
  scaleMeters: number;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function morphAt(chain: MorphChain, progress: number): MorphState {
  const p = clamp(progress, 0, 1);
  const last = chain.stageIds.length - 1;
  const scaled = p * last;
  const i = Math.min(Math.floor(scaled), last - 1);
  const t = scaled - i;

  const fromId = chain.stageIds[i];
  const toId = chain.stageIds[i + 1];
  const from = getSpecies(fromId);
  const to = getSpecies(toId);

  if (!from || !to) {
    throw new Error(`morph chain references unknown species: ${fromId}/${toId}`);
  }

  const near = t < 0.5 ? from : to;
  const scaleMeters = from.scaleMeters + (to.scaleMeters - from.scaleMeters) * t;

  return {
    fromId,
    toId,
    t,
    nearId: near.id,
    upgrade: near.upgrade,
    lost: near.lost,
    scaleLabel: near.scaleLabel,
    scaleMeters,
  };
}
