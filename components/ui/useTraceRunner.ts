'use client';

import { useCallback } from 'react';
import { usePhyloStore, type TraceOrigin } from '@/store/usePhyloStore';
import type { SpeciesSuggestion } from '@/lib/ensembl';

function messageFor(status: number, label: string): string {
  if (status === 429) return 'Ensembl is busy — try again in a moment.';
  if (status === 404) return `No lineage found for "${label}".`;
  return 'Could not reach Ensembl. Try again.';
}

export function useTraceRunner() {
  const startTrace = usePhyloStore((s) => s.startTrace);
  const setTraceData = usePhyloStore((s) => s.setTraceData);
  const setTraceError = usePhyloStore((s) => s.setTraceError);

  const run = useCallback(
    async (query: string, org: TraceOrigin) => {
      startTrace(org);
      try {
        const res = await fetch(`/api/lineage?${query}`);
        if (!res.ok) {
          setTraceError(messageFor(res.status, org.commonName));
          return;
        }
        const ranks = await res.json();
        setTraceData(Array.isArray(ranks) ? ranks : []);
      } catch {
        setTraceError('Could not reach Ensembl. Check your connection and try again.');
      }
    },
    [startTrace, setTraceData, setTraceError],
  );

  const traceSuggestion = useCallback(
    (s: SpeciesSuggestion) =>
      run(`name=${encodeURIComponent(s.name)}`, {
        id: s.id,
        label: s.displayName || s.commonName,
        commonName: s.commonName,
      }),
    [run],
  );

  const retry = useCallback(
    (org: TraceOrigin) => run(`taxon=${encodeURIComponent(org.id)}`, org),
    [run],
  );

  return { traceSuggestion, retry };
}
