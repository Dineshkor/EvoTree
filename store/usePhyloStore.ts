import { create } from 'zustand';
import type { LineageId } from '@/lib/types';
import type { LineageRank } from '@/lib/ensembl';

export interface TraceOrigin {
  id: string;
  label: string;
  commonName: string;
}

export interface PhyloState {
  selectedId: string | null;
  activeLineage: LineageId | null;
  mashupPick: string[];
  mashupPair: [string, string] | null;
  morphProgress: number;
  discovered: Set<string>;
  reverse: boolean;
  coldOpenDone: boolean;

  traceOrigin: TraceOrigin | null;
  traceRanks: LineageRank[] | null;
  traceLoading: boolean;
  traceError: string | null;
  tourStep: number;
  tourDone: boolean;

  select: (id: string | null) => void;
  setLineage: (lineage: LineageId | null) => void;
  addMashupPick: (id: string) => void;
  clearMashup: () => void;
  setMorph: (n: number) => void;
  discover: (id: string) => void;
  toggleReverse: () => void;
  finishColdOpen: () => void;
  startTrace: (org: TraceOrigin) => void;
  setTraceData: (ranks: LineageRank[]) => void;
  setTraceError: (msg: string) => void;
  clearTrace: () => void;
  nextTourStep: (max: number) => void;
  prevTourStep: () => void;
  finishTour: () => void;
  reopenTour: () => void;
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

    traceOrigin: null as TraceOrigin | null,
    traceRanks: null as LineageRank[] | null,
    traceLoading: false,
    traceError: null as string | null,
    tourStep: 0,
    tourDone: false,
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

  startTrace: (org) =>
    set({
      traceOrigin: org,
      traceRanks: null,
      traceLoading: true,
      traceError: null,
    }),

  setTraceData: (ranks) =>
    set({ traceRanks: ranks, traceLoading: false, traceError: null }),

  setTraceError: (msg) =>
    set({ traceError: msg, traceLoading: false, traceRanks: null }),

  clearTrace: () =>
    set({
      traceOrigin: null,
      traceRanks: null,
      traceLoading: false,
      traceError: null,
    }),

  nextTourStep: (max) =>
    set((state) => ({ tourStep: Math.min(state.tourStep + 1, max) })),

  prevTourStep: () =>
    set((state) => ({ tourStep: Math.max(state.tourStep - 1, 0) })),

  finishTour: () => set({ tourDone: true, tourStep: 0 }),

  reopenTour: () => set({ tourDone: false, tourStep: 0 }),
}));
