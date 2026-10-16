'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useReactFlow,
  useOnViewportChange,
  type Node,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';

import { SPECIES, EXTINCTIONS } from '@/lib/data/species';
import { assignPositions, timeToY, yToTime } from '@/lib/layout';
import { eraForTime } from '@/lib/era';
import { dimmedIds, neighborIds } from '@/lib/selectors';
import { usePhyloStore } from '@/store/usePhyloStore';
import type {
  CreatureFlowNode,
  FossilFlowNode,
  LineageFlowEdge,
  CreatureNodeState,
} from './types';
import { CreatureNode } from './CreatureNode';
import { FossilNode } from './FossilNode';
import { ExtinctionBarrier } from './ExtinctionBarrier';
import { LineageEdge } from './LineageEdge';
import { EraBackdrop } from '@/components/ui/EraBackdrop';

const nodeTypes: NodeTypes = {
  creature: CreatureNode,
  fossil: FossilNode,
  barrier: ExtinctionBarrier,
};

const edgeTypes: EdgeTypes = {
  lineage: LineageEdge,
};

const NODE_W = 168;

function EraTracker({ onTime }: { onTime: (mya: number) => void }) {
  const { screenToFlowPosition } = useReactFlow();
  const pending = useRef(false);

  useOnViewportChange({
    onChange: () => {
      if (pending.current) return;
      pending.current = true;
      requestAnimationFrame(() => {
        pending.current = false;
        const center = screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
        onTime(yToTime(center.y));
      });
    },
  });

  return null;
}

function FocusController({
  positions,
  selectedId,
}: {
  positions: Record<string, { x: number; y: number }>;
  selectedId: string | null;
}) {
  const { setCenter } = useReactFlow();
  useEffect(() => {
    if (!selectedId) return;
    const p = positions[selectedId];
    if (!p) return;
    setCenter(p.x, p.y, { zoom: 1, duration: 700 });
  }, [selectedId, positions, setCenter]);
  return null;
}

function CanvasInner() {
  const selectedId = usePhyloStore((s) => s.selectedId);
  const activeLineage = usePhyloStore((s) => s.activeLineage);
  const select = usePhyloStore((s) => s.select);

  const [mya, setMya] = useState(1200);

  const positions = useMemo(() => assignPositions(SPECIES), []);
  const era = useMemo(() => eraForTime(mya), [mya]);

  const nodes = useMemo<Node[]>(() => {
    const dim = dimmedIds(activeLineage, selectedId);
    const neighbors = neighborIds(selectedId);

    const creatureNodes: Node[] = SPECIES.map((s) => {
      const p = positions[s.id];
      const position = { x: p.x - NODE_W / 2, y: p.y };

      if (s.extinct) {
        const fossil: FossilFlowNode = {
          id: s.id,
          type: 'fossil',
          position,
          data: { species: s },
          draggable: false,
          selectable: true,
        };
        return fossil;
      }

      let state: CreatureNodeState = 'idle';
      if (activeLineage) {
        state = dim.has(s.id) ? 'dim' : 'active';
      } else if (selectedId) {
        state =
          s.id === selectedId
            ? 'active'
            : neighbors.has(s.id)
              ? 'pulse'
              : 'idle';
      }

      const creature: CreatureFlowNode = {
        id: s.id,
        type: 'creature',
        position,
        data: { species: s, state },
        draggable: false,
        selectable: true,
      };
      return creature;
    });

    const barriers: Node[] = EXTINCTIONS.map((x) => ({
      id: `barrier-${x.mya}`,
      type: 'barrier',
      position: { x: -1300, y: timeToY(x.mya) },
      data: { mya: x.mya, title: x.title, subtitle: x.subtitle },
      draggable: false,
      selectable: false,
      zIndex: -1,
    }));

    return [...barriers, ...creatureNodes];
  }, [positions, selectedId, activeLineage]);

  const edges = useMemo<LineageFlowEdge[]>(() => {
    return SPECIES.filter((s) => s.parent).map((s) => {
      const source = s.parent as string;
      let active = false;
      if (activeLineage) active = s.lineage === activeLineage;
      else if (selectedId) active = source === selectedId || s.id === selectedId;
      return {
        id: `e-${source}-${s.id}`,
        source,
        target: s.id,
        type: 'lineage',
        data: { active },
      };
    });
  }, [activeLineage, selectedId]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'barrier') return;
      select(node.id);
    },
    [select],
  );

  const onPaneClick = useCallback(() => select(null), [select]);

  return (
    <div className="relative h-full w-full">
      <EraBackdrop era={era} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.04}
        maxZoom={2.2}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        className="phylo-flow"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={48}
          size={1}
          color="rgba(150,180,255,0.10)"
        />
        <EraTracker onTime={setMya} />
        <FocusController positions={positions} selectedId={selectedId} />
      </ReactFlow>
    </div>
  );
}

export function PhyloCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
