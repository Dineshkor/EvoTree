'use client';

import { HelpCircle } from 'lucide-react';
import { usePhyloStore } from '@/store/usePhyloStore';

export function HelpButton() {
  const reopenTour = usePhyloStore((s) => s.reopenTour);
  return (
    <button
      type="button"
      className="phylo-help"
      data-tour="help"
      aria-label="How to play"
      onClick={reopenTour}
    >
      <HelpCircle size={15} />
      How to play
    </button>
  );
}
