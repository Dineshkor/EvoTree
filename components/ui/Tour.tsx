'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePhyloStore } from '@/store/usePhyloStore';

const TOUR_STEPS = [
  {
    target: '[data-tour="canvas"]',
    title: 'Welcome to the tree of life',
    body: 'Four billion years run bottom → top. Drag to pan and pinch to zoom. Start at the glowing bottom.',
  },
  {
    target: '[data-tour="creature"]',
    title: 'Open any creature',
    body: 'Tap a glowing medallion to read its story, its size next to you, and its one mind-blowing plot twist.',
  },
  {
    target: '[data-tour="pills"]',
    title: 'Trace a family line',
    body: 'Tap a pill — Whales, Crabs, Humans — to light up a whole branch and fly along it.',
  },
  {
    target: '[data-tour="trace"]',
    title: 'Trace ANY organism',
    body: 'Type any animal — even your cat — and watch its real lineage march back to Cell Zero, powered by Ensembl.',
  },
  {
    target: '[data-tour="mashup"]',
    title: 'How are we related?',
    body: 'Pick two creatures and find the exact ancestor where their family lines meet.',
  },
];

export function Tour() {
  const tourDone = usePhyloStore((s) => s.tourDone);
  const coldOpenDone = usePhyloStore((s) => s.coldOpenDone);
  const tourStep = usePhyloStore((s) => s.tourStep);
  const nextTourStep = usePhyloStore((s) => s.nextTourStep);
  const prevTourStep = usePhyloStore((s) => s.prevTourStep);
  const finishTour = usePhyloStore((s) => s.finishTour);

  const [rect, setRect] = useState<DOMRect | null>(null);

  const active = coldOpenDone && !tourDone;
  const step = TOUR_STEPS[Math.min(tourStep, TOUR_STEPS.length - 1)];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem('phyloTourDone')) finishTour();
  }, [finishTour]);

  const measure = useCallback(() => {
    const el = document.querySelector(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step.target]);

  useEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', measure);
    };
  }, [active, measure]);

  const done = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('phyloTourDone', '1');
    }
    finishTour();
  }, [finishTour]);

  const next = useCallback(() => {
    if (tourStep >= TOUR_STEPS.length - 1) done();
    else nextTourStep(TOUR_STEPS.length - 1);
  }, [tourStep, nextTourStep, done]);

  if (!active) return null;

  return (
    <div className="phylo-tour" role="dialog" aria-label="Guided tour">
      {rect && (
        <div
          className="phylo-tour-spot"
          style={{
            left: Math.max(rect.left - 8, 4),
            top: Math.max(rect.top - 8, 4),
            width: Math.min(rect.width + 16, window.innerWidth - 8),
            height: rect.height + 16,
          }}
        />
      )}

      <div className="phylo-tour-card">
        <span className="phylo-tour-step">
          Step {tourStep + 1} of {TOUR_STEPS.length}
        </span>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
        <div className="phylo-tour-actions">
          <button type="button" className="phylo-tour-skip" onClick={done}>
            Skip
          </button>
          <div className="phylo-tour-nav">
            <button
              type="button"
              className="phylo-tour-back"
              disabled={tourStep === 0}
              onClick={prevTourStep}
            >
              Back
            </button>
            <button type="button" className="phylo-tour-next" onClick={next}>
              {tourStep >= TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
