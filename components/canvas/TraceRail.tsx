'use client';

import { useViewport } from '@xyflow/react';
import { usePhyloStore } from '@/store/usePhyloStore';
import { timeToY, TRUNK_X } from '@/lib/layout';

interface Point {
  id: string;
  label: string;
  mya: number;
  x: number;
  y: number;
  anchored: boolean;
  anchorX: number | null;
  anchorY: number | null;
}

export function TraceRail({
  positions,
}: {
  positions: Record<string, { x: number; y: number }>;
}) {
  const origin = usePhyloStore((s) => s.traceOrigin);
  const ranks = usePhyloStore((s) => s.traceRanks);
  const { x: vx, y: vy, zoom } = useViewport();

  if (!origin || !ranks || ranks.length === 0) return null;

  const sx = (fx: number) => fx * zoom + vx;
  const sy = (fy: number) => fy * zoom + vy;

  const offsetX = TRUNK_X + 120;

  const points: Point[] = ranks.map((r) => {
    const anchor = r.anchoredTo ? positions[r.anchoredTo] : undefined;
    const fx = anchor ? anchor.x : offsetX;
    const fy = timeToY(r.mya ?? 0);
    return {
      id: r.id,
      label: r.label,
      mya: Math.round(r.mya ?? 0),
      x: sx(fx),
      y: sy(fy),
      anchored: Boolean(anchor),
      anchorX: anchor ? sx(anchor.x) : null,
      anchorY: anchor ? sy(anchor.y - 40) : null,
    };
  });

  const originX = sx(TRUNK_X);
  const originY = sy(timeToY(0));

  const line = [
    ...points.map((p) => ({ x: p.x, y: p.y })),
    { x: originX, y: originY },
  ];
  const d = line.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="phylo-trace" key={origin.id} aria-hidden="true">
      <svg className="phylo-trace-svg">
        <path d={d} className="phylo-trace-rail" />
        {points
          .filter((p) => p.anchorX !== null)
          .map((p) => (
            <path
              key={p.id}
              d={`M ${p.x} ${p.y} L ${p.anchorX} ${p.anchorY}`}
              className="phylo-trace-link"
            />
          ))}
      </svg>

      <div
        className="phylo-trace-origin"
        style={{ left: originX, top: originY }}
      >
        <span className="phylo-trace-origin-dot" />
        🧍 You are here · {origin.commonName}
      </div>

      {points.map((p) => (
        <div
          key={p.id}
          className="phylo-trace-chip"
          data-anchored={p.anchored}
          style={{ left: p.x, top: p.y }}
        >
          <span className="phylo-trace-chip-label">{p.label}</span>
          <span className="phylo-trace-chip-mya">{p.mya} MYA</span>
        </div>
      ))}

      <div
        className="phylo-trace-beyond"
        style={{ left: points[0].x, top: points[0].y + 30 }}
      >
        beyond Ensembl · bacteria &amp; archaea
      </div>
    </div>
  );
}
