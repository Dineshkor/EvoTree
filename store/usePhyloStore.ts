import { create } from 'zustand';
import type { LineageId } from '@/lib/types';

export interface PhyloState {
  selectedId: string | null;
  activeLineage: LineageId | null;
  mashupPick: string[];
  mashupPair: [string, string] | null;
  morphProgress: number;
  discovered: Set<string>;
  reverse: boolean;
  coldOpenDone: boolean;

  select: (id: string | null) => void;
  setLineage: (lineage: LineageId | null) => void;
  addMashupPick: (id: string) => void;
  clearMashup: () => void;
  setMorph: (n: number) => void;
  discover: (id: string) => void;
  toggleReverse: () => void;
  finishColdOpen: () => void;
}

export function initialPhyloState() {
  return {
    selectedId: null,
    activeLineage: null,
    mashupPick: [] as string[],
    mashupPair: null as [string, string] | null,
    morphProgress: 0,
    discovered: new Set<string>(),
    reverse: false,
    coldOpenDone: false,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export const usePhyloStore = create<PhyloState>((set) => ({
  ...initialPhyloState(),

  select: (id) =>
    set((state) => {
      if (id === null) return { selectedId: null };
      const discovered = new Set(state.discovered);
      discovered.add(id);
      return {
        selectedId: id,
        discovered,
        morphProgress: 0,
      };
    }),

  setLineage: (lineage) => set({ activeLineage: lineage }),

  addMashupPick: (id) =>
    set((state) => {
      if (state.mashupPair) {
        return { mashupPick: [id], mashupPair: null };
      }
      const pick = [...state.mashupPick, id];
      if (pick.length >= 2) {
        return { mashupPick: pick.slice(0, 2), mashupPair: [pick[0], pick[1]] };
      }
      return { mashupPick: pick, mashupPair: null };
    }),

  clearMashup: () => set({ mashupPick: [], mashupPair: null }),

  setMorph: (n) => set({ morphProgress: clamp(n, 0, 1) }),

  discover: (id) =>
    set((state) => {
      if (state.discovered.has(id)) return {};
      const discovered = new Set(state.discovered);
      discovered.add(id);
      return { discovered };
    }),

  toggleReverse: () => set((state) => ({ reverse: !state.reverse })),

  finishColdOpen: () => set({ coldOpenDone: true }),
}));
