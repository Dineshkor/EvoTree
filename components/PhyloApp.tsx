'use client';

import { DynamicCanvas } from './DynamicCanvas';

export function PhyloApp() {
  return (
    <div className="phylo-app relative h-[100dvh] w-full overflow-hidden">
      <DynamicCanvas />
    </div>
  );
}
