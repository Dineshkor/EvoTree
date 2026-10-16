import { describe, it, expect, beforeEach } from 'vitest';
import { usePhyloStore, initialPhyloState } from '../store/usePhyloStore';

beforeEach(() => {
  usePhyloStore.setState(initialPhyloState());
});

describe('phylo store', () => {
  it('selects a node and records it as discovered', () => {
    usePhyloStore.getState().select('luca');
    expect(usePhyloStore.getState().selectedId).toBe('luca');
    expect(usePhyloStore.getState().discovered.has('luca')).toBe(true);
  });

  it('builds a mashup pair after two picks and resets on the third', () => {
    const s = usePhyloStore.getState();
    s.addMashupPick('human');
    expect(usePhyloStore.getState().mashupPair).toBeNull();
    usePhyloStore.getState().addMashupPick('mushroom');
    expect(usePhyloStore.getState().mashupPair).toEqual(['human', 'mushroom']);
    usePhyloStore.getState().addMashupPick('blue-whale');
    expect(usePhyloStore.getState().mashupPair).toBeNull();
    expect(usePhyloStore.getState().mashupPick).toEqual(['blue-whale']);
  });

  it('clamps morph progress', () => {
    usePhyloStore.getState().setMorph(2);
    expect(usePhyloStore.getState().morphProgress).toBe(1);
    usePhyloStore.getState().setMorph(-1);
    expect(usePhyloStore.getState().morphProgress).toBe(0);
  });

  it('toggles reverse and completes the cold open', () => {
    usePhyloStore.getState().toggleReverse();
    expect(usePhyloStore.getState().reverse).toBe(true);
    usePhyloStore.getState().finishColdOpen();
    expect(usePhyloStore.getState().coldOpenDone).toBe(true);
  });

  it('sets and clears the active lineage', () => {
    usePhyloStore.getState().setLineage('whales');
    expect(usePhyloStore.getState().activeLineage).toBe('whales');
    usePhyloStore.getState().setLineage(null);
    expect(usePhyloStore.getState().activeLineage).toBeNull();
  });
});
