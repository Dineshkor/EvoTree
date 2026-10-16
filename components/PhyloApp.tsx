'use client';

import { DynamicCanvas } from './DynamicCanvas';
import { ColdOpen } from './ui/ColdOpen';
import { TopBar } from './ui/TopBar';
import { MashupCalculator } from './ui/MashupCalculator';
import { CreatureDrawer } from './ui/CreatureDrawer';
import { ProgressMeter } from './ui/ProgressMeter';
import { SpeciesSearch } from './ui/SpeciesSearch';
import { TracePanel } from './ui/TracePanel';
import { useTraceRunner } from './ui/useTraceRunner';

export function PhyloApp() {
  const { traceSuggestion } = useTraceRunner();

  return (
    <div className="phylo-app relative h-[100dvh] w-full overflow-hidden">
      <DynamicCanvas />
      <TopBar />
      <ProgressMeter />
      <SpeciesSearch onSelect={traceSuggestion} />
      <TracePanel />
      <MashupCalculator />
      <CreatureDrawer />
      <div className="phylo-grain" aria-hidden="true" />
      <ColdOpen />
    </div>
  );
}
