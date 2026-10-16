'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dna, X } from 'lucide-react';
import { usePhyloStore } from '@/store/usePhyloStore';
import { MASHUP_ORGANISMS } from '@/lib/data/mashup';
import { ancestorVerdict, commonAncestor, displayName } from '@/lib/ancestors';

const EXTRA_PICKS = [
  { id: 'blue-whale', emoji: '🐋', label: 'Blue Whale' },
  { id: 'carcinization', emoji: '🦀', label: 'Crab' },
];

const PICKS = [...MASHUP_ORGANISMS, ...EXTRA_PICKS];

export function MashupCalculator() {
  const [open, setOpen] = useState(false);
  const pair = usePhyloStore((s) => s.mashupPair);
  const picks = usePhyloStore((s) => s.mashupPick);
  const addMashupPick = usePhyloStore((s) => s.addMashupPick);
  const clearMashup = usePhyloStore((s) => s.clearMashup);

  const verdict = pair ? ancestorVerdict(pair[0], pair[1]) : null;
  const ancestor = pair ? commonAncestor(pair[0], pair[1]) : null;

  return (
    <>
      <div className="phylo-mashup-hud">
        <button
          type="button"
          className="phylo-mashup-btn"
          data-active={open || !!pair}
          onClick={() => setOpen((o) => !o)}
        >
          <Dna size={16} />
          {pair ? 'Mashup running' : 'Related to…?'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="phylo-mashup-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="phylo-mashup-head">
              <span>Pick any two — I&apos;ll find your common ancestor</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="phylo-mashup-grid">
              {PICKS.map((p) => {
                const chosen = picks.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="phylo-mashup-pick"
                    data-chosen={chosen}
                    onClick={() => addMashupPick(p.id)}
                  >
                    <span className="phylo-mashup-pick-emoji">{p.emoji}</span>
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="phylo-mashup-status">
              {pair ? (
                <>
                  <span>
                    🧬 {displayName(pair[0])} × {displayName(pair[1])} meet at{' '}
                    <strong>{ancestor ? displayName(ancestor) : '—'}</strong>
                  </span>
                  <button type="button" className="phylo-mashup-reset" onClick={clearMashup}>
                    Reset
                  </button>
                </>
              ) : (
                <span>
                  {picks.length === 0
                    ? 'Choose your first organism.'
                    : 'Choose a second organism…'}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pair && verdict && !open && (
          <motion.div
            className="phylo-verdict"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <span className="phylo-verdict-tag">Common Ancestor Found</span>
            <p>{verdict}</p>
            <button type="button" onClick={clearMashup}>
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
