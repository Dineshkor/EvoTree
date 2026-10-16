'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SPECIES } from '@/lib/data/species';
import { usePhyloStore } from '@/store/usePhyloStore';

const TOTAL = SPECIES.length;

interface Spark {
  id: number;
  x: number;
  y: number;
  hue: number;
}

export function ProgressMeter() {
  const discovered = usePhyloStore((s) => s.discovered);
  const count = discovered.size;
  const pct = Math.round((count / TOTAL) * 100);

  const prev = useRef(count);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    if (count > prev.current) {
      const base = Date.now();
      const burst: Spark[] = Array.from({ length: 18 }, (_, i) => ({
        id: base + i,
        x: (Math.random() - 0.5) * 160,
        y: -40 - Math.random() * 120,
        hue: 180 + Math.random() * 120,
      }));
      setSparks((s) => [...s, ...burst]);
      const t = setTimeout(() => setSparks((s) => s.slice(burst.length)), 1400);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <div className="phylo-progress">
      <div className="phylo-progress-ring" style={{ ['--pct' as string]: pct }}>
        <span className="phylo-progress-count">{count}</span>
        <span className="phylo-progress-total">/{TOTAL}</span>
      </div>
      <span className="phylo-progress-label">discovered</span>

      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="phylo-spark"
          style={{ background: `hsl(${s.hue} 90% 65%)` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.3 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
