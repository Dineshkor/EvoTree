'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CreatureSprite } from '@/components/creatures/CreatureSprite';
import type { CreatureFlowNode } from './types';

export function CreatureNode({ data }: NodeProps<CreatureFlowNode>) {
  const { species, state } = data;
  return (
    <div
      className="phylo-node"
      data-state={state}
      data-rarity={species.rarity}
      data-tour="creature"
    >
      <Handle type="target" position={Position.Bottom} className="phylo-handle" />
      <div className="phylo-medallion">
        <div className="phylo-orb">
          <CreatureSprite svgKey={species.svgKey} className="phylo-sprite" />
        </div>
      </div>
      <div className="phylo-badge">{species.nickname}</div>
      <div className="phylo-pill">🔓 {species.upgrade}</div>
      <Handle type="source" position={Position.Top} className="phylo-handle" />
    </div>
  );
}
