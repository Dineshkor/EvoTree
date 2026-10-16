'use client';

import { Repeat } from 'lucide-react';
import { LINEAGE_PILLS } from '@/lib/data/lineages';
import { usePhyloStore } from '@/store/usePhyloStore';

export function TopBar() {
  const activeLineage = usePhyloStore((s) => s.activeLineage);
  const setLineage = usePhyloStore((s) => s.setLineage);
  const reverse = usePhyloStore((s) => s.reverse);
  const toggleReverse = usePhyloStore((s) => s.toggleReverse);

  return (
    <div className="phylo-topbar">
      <div className="phylo-topbar-inner">
        <span className="phylo-topbar-label">How are we related?</span>
        <div className="phylo-chips">
          {LINEAGE_PILLS.map((p) => {
            const active = activeLineage === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className="phylo-chip"
                data-active={active}
                aria-pressed={active}
                onClick={() => setLineage(active ? null : p.id)}
              >
                <span className="phylo-chip-emoji">{p.emoji}</span>
                {p.label}
              </button>
            );
          })}
          <button
            type="button"
            className="phylo-chip phylo-chip-reverse"
            data-active={reverse}
            aria-pressed={reverse}
            onClick={toggleReverse}
          >
            <Repeat size={13} />
            Reverse Mode
          </button>
        </div>
      </div>
    </div>
  );
}
