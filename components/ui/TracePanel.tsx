'use client';

import { Loader2, X } from 'lucide-react';
import { usePhyloStore } from '@/store/usePhyloStore';
import { useTraceRunner } from './useTraceRunner';

export function TracePanel() {
  const origin = usePhyloStore((s) => s.traceOrigin);
  const ranks = usePhyloStore((s) => s.traceRanks);
  const loading = usePhyloStore((s) => s.traceLoading);
  const error = usePhyloStore((s) => s.traceError);
  const clearTrace = usePhyloStore((s) => s.clearTrace);
  const { retry } = useTraceRunner();

  if (!origin) return null;

  const span = ranks && ranks.length > 0 ? Math.round(ranks[0].mya ?? 0) : null;

  return (
    <div className="phylo-tracepanel">
      <div className="phylo-tracepanel-head">
        <div>
          <span className="phylo-tracepanel-kicker">Tracing back</span>
          <h3>{origin.commonName}</h3>
          <span className="phylo-tracepanel-sub">{origin.label}</span>
        </div>
        <button type="button" aria-label="Clear trace" onClick={clearTrace}>
          <X size={16} />
        </button>
      </div>

      {loading && (
        <div className="phylo-tracepanel-state">
          <Loader2 size={18} className="phylo-spin" />
          Reaching Ensembl…
        </div>
      )}

      {error && !loading && (
        <div className="phylo-tracepanel-exterror">
          <p>{error}</p>
          <button type="button" onClick={() => retry(origin)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && ranks && (
        <>
          {span !== null && (
            <p className="phylo-tracepanel-span">
              🧬 {ranks.length} ancestors across ~{span.toLocaleString()} million years
            </p>
          )}
          <ul className="phylo-tracepanel-list">
            {ranks.map((r) => (
              <li key={r.id} data-anchored={Boolean(r.anchoredTo)}>
                <span className="phylo-tracepanel-label">{r.label}</span>
                <span className="phylo-tracepanel-mya">
                  {Math.round(r.mya ?? 0)}
                  <em>MYA</em>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
