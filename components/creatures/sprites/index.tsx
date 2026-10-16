import type { ComponentType } from 'react';
import type { SpriteProps } from './types';
import { LucaSprite, CyanobacteriaSprite, EukaryoteSprite } from './cells';
import { ArthropodSprite, OpabiniaSprite, CrabSprite } from './arthropods';
import { HaikouichthysSprite, TiktaalikSprite, SynapsidSprite } from './vertebrates';
import {
  PakicetusSprite,
  MaiacetusSprite,
  DorudonSprite,
  BlueWhaleSprite,
} from './whales';

export function FallbackSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="30" fill="var(--accent)" opacity="0.14" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export const SPRITES: Record<string, ComponentType<SpriteProps>> = {
  luca: LucaSprite,
  cyanobacteria: CyanobacteriaSprite,
  eukaryotes: EukaryoteSprite,
  arthropods: ArthropodSprite,
  opabinia: OpabiniaSprite,
  crab: CrabSprite,
  haikouichthys: HaikouichthysSprite,
  tiktaalik: TiktaalikSprite,
  synapsids: SynapsidSprite,
  pakicetus: PakicetusSprite,
  maiacetus: MaiacetusSprite,
  dorudon: DorudonSprite,
  'blue-whale': BlueWhaleSprite,
};
