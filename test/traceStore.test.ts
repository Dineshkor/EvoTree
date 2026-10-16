import { describe, it, expect, beforeEach } from 'vitest';
import { usePhyloStore, initialPhyloState } from '../store/usePhyloStore';

beforeEach(() => {
  usePhyloStore.setState(initialPhyloState());
});

describe('trace state', () => {
  it('starts a trace in loading state', () => {
    usePhyloStore.getState().startTrace({ id: '9685', label: 'cat', commonName: 'Domestic Cat' });
    const s = usePhyloStore.getState();
    expect(s.traceOrigin).toEqual({ id: '9685', label: 'cat', commonName: 'Domestic Cat' });
    expect(s.traceLoading).toBe(true);
    expect(s.traceRanks).toBeNull();
    expect(s.traceError).toBeNull();
  });

  it('stores ranks and clears loading', () => {
    usePhyloStore.getState().startTrace({ id: '1', label: 'x', commonName: 'X' });
    usePhyloStore.getState().setTraceData([]);
    expect(usePhyloStore.getState().traceLoading).toBe(false);
    expect(usePhyloStore.getState().traceRanks).toEqual([]);
  });

  it('records an error and clears loading', () => {
    usePhyloStore.getState().startTrace({ id: '1', label: 'x', commonName: 'X' });
    usePhyloStore.getState().setTraceError('busy');
    expect(usePhyloStore.getState().traceLoading).toBe(false);
    expect(usePhyloStore.getState().traceError).toBe('busy');
  });

  it('clears the trace', () => {
    usePhyloStore.getState().startTrace({ id: '1', label: 'x', commonName: 'X' });
    usePhyloStore.getState().clearTrace();
    const s = usePhyloStore.getState();
    expect(s.traceOrigin).toBeNull();
    expect(s.traceRanks).toBeNull();
    expect(s.traceLoading).toBe(false);
    expect(s.traceError).toBeNull();
  });
});

describe('tour state', () => {
  it('advances and clamps at the last step', () => {
    for (let i = 0; i < 10; i++) usePhyloStore.getState().nextTourStep(4);
    expect(usePhyloStore.getState().tourStep).toBe(4);
  });

  it('goes back but never below zero', () => {
    usePhyloStore.getState().nextTourStep(4);
    usePhyloStore.getState().prevTourStep();
    usePhyloStore.getState().prevTourStep();
    expect(usePhyloStore.getState().tourStep).toBe(0);
  });

  it('finishing resets the step and marks done; reopening restarts', () => {
    usePhyloStore.getState().nextTourStep(4);
    usePhyloStore.getState().finishTour();
    expect(usePhyloStore.getState().tourDone).toBe(true);
    expect(usePhyloStore.getState().tourStep).toBe(0);
    usePhyloStore.getState().reopenTour();
    expect(usePhyloStore.getState().tourDone).toBe(false);
    expect(usePhyloStore.getState().tourStep).toBe(0);
  });
});
