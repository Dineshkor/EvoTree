'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FossilFlowNode } from './types';

export function FossilNode({ data }: NodeProps<FossilFlowNode>) {
  return (
    <div className="phylo-node phylo-fossil">
      <Handle type="target" position={Position.Bottom} className="phylo-handle" />
      <div className="phylo-medallion">
        <div className="phylo-orb phylo-orb-fossil">💀</div>
      </div>
      <div className="phylo-badge phylo-badge-fossil">Extinct</div>
      <div className="phylo-pill">{data.species.nickname}</div>
    </div>
  );
}
