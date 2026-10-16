import type { EraId, EraPalette } from './types';
import { ERAS } from './data/eras';

const EXTINCTION_ZONES: { mya: number; tolerance: number }[] = [
  { mya: 252, tolerance: 30 },
  { mya: 66, tolerance: 15 },
];

export function eraForTime(mya: number): EraPalette {
  for (const zone of EXTINCTION_ZONES) {
    if (Math.abs(mya - zone.mya) <= zone.tolerance) {
      return paletteById('extinction');
    }
  }
  if (mya > 900) return paletteById('origin');
  if (mya > 440) return paletteById('cambrian');
  if (mya > 150) return paletteById('land');
  return paletteById('present');
}

export function paletteById(id: EraId): EraPalette {
  const found = ERAS.find((e) => e.id === id);
  if (!found) throw new Error(`unknown era id: ${id}`);
  return found;
}
