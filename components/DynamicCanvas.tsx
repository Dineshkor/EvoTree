'use client';

import dynamic from 'next/dynamic';

export const DynamicCanvas = dynamic(
  () => import('./canvas/PhyloCanvas').then((m) => m.PhyloCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center">
        <div className="phylo-loader" />
      </div>
    ),
  },
);
