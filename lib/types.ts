export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type EraId = 'origin' | 'cambrian' | 'land' | 'extinction' | 'present';

export type LineageId = 'trunk' | 'whales' | 'chickens' | 'crabs' | 'humans';

export type ParticleKind = 'ember' | 'mote' | 'mist' | 'ash' | 'bubble';

export interface Species {
  id: string;
  nickname: string;
  latin: string;
  mya: number;
  era: EraId;
  lineage: LineageId;
  rarity: Rarity;
  upgrade: string;
  lost: string;
  twist: string;
  scaleLabel: string;
  scaleMeters: number;
  svgKey: string;
  parent: string | null;
  extinct?: boolean;
}

export interface ExtinctionEvent {
  id: string;
  mya: number;
  title: string;
  subtitle: string;
}

export interface EraPalette {
  id: EraId;
  name: string;
  from: string;
  to: string;
  accent: string;
  particle: ParticleKind;
}

export interface LineagePill {
  id: LineageId;
  label: string;
  emoji: string;
  terminal: string;
}
