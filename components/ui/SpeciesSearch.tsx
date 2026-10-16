'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { usePhyloStore } from '@/store/usePhyloStore';
import type { SpeciesSuggestion } from '@/lib/ensembl';

interface Props {
  onSelect: (s: SpeciesSuggestion) => void;
}

export function SpeciesSearch({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpeciesSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const traceLoading = usePhyloStore((s) => s.traceLoading);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/species/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) {
          setResults([]);
          setSearchError(
            res.status === 429
              ? 'Ensembl is busy — try again in a moment.'
              : 'Search is unavailable right now.',
          );
          return;
        }
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        if (!ctrl.signal.aborted) {
          setSearchError('Search is unavailable right now.');
        }
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  const choose = useCallback(
    (s: SpeciesSuggestion) => {
      setOpen(false);
      setQuery('');
      setResults([]);
      onSelect(s);
    },
    [onSelect],
  );

  return (
    <>
      <div className="phylo-search-hud">
        <button
          type="button"
          className="phylo-search-btn"
          data-tour="trace"
          data-active={open || traceLoading}
          onClick={() => setOpen((o) => !o)}
        >
          {traceLoading ? <Loader2 size={16} className="phylo-spin" /> : <Search size={16} />}
          Trace any organism
        </button>
      </div>

      {open && (
        <div className="phylo-search-panel">
          <input
            ref={inputRef}
            className="phylo-search-input"
            placeholder="Try: cat, dog, human, mushroom, rice…"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              if (!v.trim()) setResults([]);
            }}
          />
          <div className="phylo-search-results">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                className="phylo-search-item"
                onClick={() => choose(r)}
              >
                <span className="phylo-search-item-common">{r.commonName}</span>
                <span className="phylo-search-item-name">{r.displayName}</span>
              </button>
            ))}
            {searchError && <p className="phylo-search-empty">{searchError}</p>}
            {!searching && !searchError && query.trim() && results.length === 0 && (
              <p className="phylo-search-empty">No organism found for &ldquo;{query}&rdquo;.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
