'use client';

import { DynamicCanvas } from './DynamicCanvas';
import { ColdOpen } from './ui/ColdOpen';
import { TopBar } from './ui/TopBar';
import { MashupCalculator } from './ui/MashupCalculator';
import { CreatureDrawer } from './ui/CreatureDrawer';
import { ProgressMeter } from './ui/ProgressMeter';

export function PhyloApp() {
  return (
    <div className="phylo-app relative h-[100dvh] w-full overflow-hidden">
      <DynamicCanvas />
      <TopBar />
      <ProgressMeter />
      <MashupCalculator />
      <CreatureDrawer />
      <div className="phylo-grain" aria-hidden="true" />
      <ColdOpen />
    </div>
  );
}
