'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePhyloStore } from '@/store/usePhyloStore';

const letters = 'PHYLO'.split('');

export function ColdOpen() {
  const coldOpenDone = usePhyloStore((s) => s.coldOpenDone);
  const finish = usePhyloStore((s) => s.finishColdOpen);

  useEffect(() => {
    if (coldOpenDone) return;
    const t = setTimeout(finish, 9000);
    return () => clearTimeout(t);
  }, [coldOpenDone, finish]);

  return (
    <AnimatePresence>
      {!coldOpenDone && (
        <motion.div
          className="phylo-coldopen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <motion.p
            className="phylo-coldopen-kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            4,000,000,000 years in the making
          </motion.p>

          <h1 className="phylo-coldopen-title" aria-label="PHYLO">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.35 + i * 0.12, duration: 0.6, ease: 'easeOut' }}
              >
                {l}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="phylo-coldopen-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            The Game of Life
          </motion.p>

          <motion.p
            className="phylo-coldopen-tag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            One tiny cell. Every living thing. Scroll the family tree that
            connects you to a mushroom and a whale.
          </motion.p>

          <motion.button
            className="phylo-coldopen-btn"
            onClick={finish}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            whileTap={{ scale: 0.96 }}
          >
            Begin the journey →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
