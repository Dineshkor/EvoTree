import type { Node, Edge } from '@xyflow/react';
import type { Species } from '@/lib/types';

export type CreatureNodeState = 'active' | 'dim' | 'pulse' | 'idle';

export type CreatureNodeData = {
  species: Species;
  state: CreatureNodeState;
};

export type FossilNodeData = {
  species: Species;
};

export type BarrierNodeData = {
  mya: number;
  title: string;
  subtitle: string;
};

export type LineageEdgeData = {
  active: boolean;
};

export type CreatureFlowNode = Node<CreatureNodeData, 'creature'>;
export type FossilFlowNode = Node<FossilNodeData, 'fossil'>;
export type BarrierFlowNode = Node<BarrierNodeData, 'barrier'>;
export type LineageFlowEdge = Edge<LineageEdgeData, 'lineage'>;
