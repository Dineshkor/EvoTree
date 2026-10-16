'use client';

import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { LineageFlowEdge } from './types';

export function LineageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<LineageFlowEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const active = data?.active ?? false;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className="phylo-edge"
        style={{ stroke: 'rgba(150,190,255,0.28)', strokeWidth: 2 }}
      />
      {active && (
        <path
          d={edgePath}
          className="phylo-edge-laser"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </>
  );
}
