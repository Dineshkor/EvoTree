'use client';

import { motion } from 'framer-motion';
import type { NodeProps } from '@xyflow/react';
import type { BarrierFlowNode } from './types';

export function ExtinctionBarrier({ data }: NodeProps<BarrierFlowNode>) {
  return (
    <div className="phylo-barrier">
      <motion.div
        className="phylo-barrier-line"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="phylo-barrier-label">
        <span className="phylo-barrier-mya">{data.mya} MYA</span>
        <span className="phylo-barrier-title">{data.title}</span>
        <span className="phylo-barrier-sub">{data.subtitle}</span>
      </div>
    </div>
  );
}
