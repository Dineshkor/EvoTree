'use client';

import { motion } from 'framer-motion';
import { useViewport } from '@xyflow/react';
import { usePhyloStore } from '@/store/usePhyloStore';
import { commonAncestor, curatedSplit } from '@/lib/ancestors';
import { MASHUP_ORGANISMS } from '@/lib/data/mashup';
import { TRUNK_X, timeToY } from '@/lib/layout';

function resolvePosition(
  id: string,
  positions: Record<string, { x: number; y: number }>,
): { x: number; y: number } | null {
  if (positions[id]) return positions[id];
  const guest = MASHUP_ORGANISMS.find((o) => o.id === id);
  if (!guest) return null;
  const base = resolvePosition(guest.parent, positions);
  if (!base) return null;
  return { x: base.x + 170, y: base.y + 70 };
}

export function MashupBeams({
  positions,
}: {
  positions: Record<string, { x: number; y: number }>;
}) {
  const pair = usePhyloStore((s) => s.mashupPair);
  const { x: vx, y: vy, zoom } = useViewport();

  if (!pair) return null;
  const ancestor = commonAncestor(pair[0], pair[1]);
  if (!ancestor) return null;

  const toScreen = (id: string) => {
    const p = resolvePosition(id, positions);
    if (!p) return null;
    return { x: p.x * zoom + vx, y: p.y * zoom + vy };
  };

  const a = toScreen(pair[0]);
  const b = toScreen(pair[1]);

  const split = curatedSplit(pair[0], pair[1]);
  const trunkPoint = split !== null ? { x: TRUNK_X, y: timeToY(split) } : null;
  const target = trunkPoint
    ? { x: trunkPoint.x * zoom + vx, y: trunkPoint.y * zoom + vy }
    : toScreen(ancestor);
  if (!a || !b || !target) return null;

  const path = (from: { x: number; y: number }) => {
    const midX = (from.x + target.x) / 2;
    const midY = (from.y + target.y) / 2 - 70;
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${target.x} ${target.y}`;
  };

  return (
    <svg className="phylo-beams" key={pair.join('-')} aria-hidden="true">
      <motion.path
        d={path(a)}
        className="phylo-beam phylo-beam-a"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
      <motion.path
        d={path(b)}
        className="phylo-beam phylo-beam-b"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
      <motion.circle
        cx={target.x}
        cy={target.y}
        r={12}
        className="phylo-beam-burst"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3.2, 0], opacity: [0, 0.95, 0] }}
        transition={{ delay: 1.05, duration: 0.95, ease: 'easeOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
