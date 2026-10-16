'use client';

import { DynamicCanvas } from './DynamicCanvas';
import { ColdOpen } from './ui/ColdOpen';
import { TopBar } from './ui/TopBar';
import { MashupCalculator } from './ui/MashupCalculator';

export function PhyloApp() {
  return (
    <div className="phylo-app relative h-[100dvh] w-full overflow-hidden">
      <DynamicCanvas />
      <TopBar />
      <MashupCalculator />
      <ColdOpen />
    </div>
  );
}
