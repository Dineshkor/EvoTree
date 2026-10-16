'use client';

import { WHALE_MORPH } from '@/lib/morph';
import { getSpecies } from '@/lib/data/species';
import { usePhyloStore } from '@/store/usePhyloStore';

export function MorphSlider() {
  const progress = usePhyloStore((s) => s.morphProgress);
  const setMorph = usePhyloStore((s) => s.setMorph);

  return (
    <div className="phylo-morph">
      <div className="phylo-morph-head">
        <span>🧬 Morph Slider</span>
        <span className="phylo-morph-hint">Drag to watch it evolve</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(progress * 100)}
        onChange={(e) => setMorph(Number(e.target.value) / 100)}
        className="phylo-morph-range"
        aria-label="Morph progress"
      />
      <div className="phylo-morph-ticks">
        {WHALE_MORPH.stageIds.map((id) => {
          const s = getSpecies(id);
          return (
            <span key={id} className="phylo-morph-tick">
              {s?.nickname.replace(/^The /, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
}
