'use client';

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { getSpecies } from '@/lib/data/species';
import { WHALE_MORPH, morphAt } from '@/lib/morph';
import { usePhyloStore } from '@/store/usePhyloStore';
import { CreatureSprite } from '@/components/creatures/CreatureSprite';
import { ScaleGraphic } from './ScaleGraphic';
import { MorphSlider } from './MorphSlider';

function eraLine(mya: number): string {
  if (mya === 0) return 'Present Day · 0 years ago';
  if (mya === 66) return '66 Million Years Ago · The asteroid hits';
  if (mya < 66) {
    return `${mya} Million Years Ago · ${66 - mya}M years after the dinosaurs died`;
  }
  return `${mya} Million Years Ago`;
}

export function CreatureDrawer() {
  const selectedId = usePhyloStore((s) => s.selectedId);
  const select = usePhyloStore((s) => s.select);
  const morphProgress = usePhyloStore((s) => s.morphProgress);

  const species = selectedId ? getSpecies(selectedId) : undefined;
  const isWhale = species ? WHALE_MORPH.stageIds.includes(species.id) : false;
  const dragControls = useDragControls();

  const morph = isWhale && species ? morphAt(WHALE_MORPH, morphProgress) : null;
  const preview = morph ? getSpecies(morph.nearId) ?? species : species;

  const upgrade = morph ? morph.upgrade : species?.upgrade;
  const lost = morph ? morph.lost : species?.lost;
  const twist = preview?.twist;
  const scaleMeters = morph ? morph.scaleMeters : species?.scaleMeters ?? 0;

  return (
    <AnimatePresence>
      {species && (
        <motion.aside
          key="drawer"
          className="phylo-drawer"
          data-rarity={species.rarity}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120) select(null);
          }}
        >
          <div
            className="phylo-drawer-grab"
            onPointerDown={(e) => dragControls.start(e)}
          />

          <button
            type="button"
            className="phylo-drawer-close"
            aria-label="Close"
            onClick={() => select(null)}
          >
            <X size={18} />
          </button>

          <header className="phylo-drawer-head">
            <div className="phylo-drawer-preview">
              <CreatureSprite
                svgKey={preview?.svgKey ?? species.svgKey}
                className="phylo-sprite"
              />
            </div>
            <div className="phylo-drawer-titles">
              <h2>{species.nickname}</h2>
              <p className="phylo-drawer-era">{eraLine(species.mya)}</p>
              <p className="phylo-drawer-latin">{species.latin}</p>
            </div>
          </header>

          <ScaleGraphic
            meters={scaleMeters}
            label={morph ? morph.scaleLabel : species.scaleLabel}
          />

          <div className="phylo-badges">
            <div className="phylo-badge-card phylo-badge-add">
              <span className="phylo-badge-k">➕ Added Upgrade</span>
              <span className="phylo-badge-v">{upgrade}</span>
            </div>
            <div className="phylo-badge-card phylo-badge-lost">
              <span className="phylo-badge-k">➖ Lost Trait</span>
              <span className="phylo-badge-v">{lost}</span>
            </div>
            <div className="phylo-badge-card phylo-badge-twist">
              <span className="phylo-badge-k">⚡ The Plot Twist</span>
              <span className="phylo-badge-v">{twist}</span>
            </div>
          </div>

          {isWhale && <MorphSlider />}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
