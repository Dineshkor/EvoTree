import type { SpriteProps } from './types';

export function PakicetusSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M6 52h58c10 0 16 4 22 4l10-6-6 12-4 2H20c-8 0-14-4-14-12Z"
        fill="var(--accent)"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M8 48 2 42l2 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="14" cy="48" r="3" fill="currentColor" />
      <path
        d="M24 62v14M44 62v14M60 62v14M74 62v14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M64 40c4-6 10-6 12 0" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function MaiacetusSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M6 54c22-10 52-12 74-4 6 2 10 4 10 4s-8 8-22 8H20C10 62 6 60 6 54Z"
        fill="var(--accent)"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M10 50 2 44l3 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <g fill="var(--accent)" stroke="currentColor" strokeWidth="2.5">
        <path d="M30 62c0 8-6 12-12 12 4-6 6-12 12-12Z" />
        <path d="M58 64c2 8 8 12 14 10-4-4-8-8-14-10Z" />
      </g>
      <circle cx="16" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

export function DorudonSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M8 56c26-14 56-16 78-6 6 3 8 6 8 6l-10 4c-18 4-52 4-76-4Z"
        fill="var(--accent)"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M10 52C6 40 4 30 10 22c2 12 8 22 14 26Z" fill="currentColor" opacity="0.7" />
      <path d="M6 50l-6 4 6 4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M50 64c-2 6-6 8-6 8M56 64c2 6 6 8 6 8" />
      </g>
      <circle cx="16" cy="52" r="3" fill="currentColor" />
      <path d="M22 34c2-6 6-8 10-6" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function BlueWhaleSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M4 58c30-20 68-22 88-8 4 3 6 6 6 6s-6 3-16 4c-24 3-58 0-78-8Z"
        fill="var(--accent)"
        opacity="0.18"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M8 52C2 36 2 20 8 8c4 16 12 28 20 34Z" fill="currentColor" opacity="0.75" />
      <path d="M4 50l-4 6 4 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M16 60c4 4 10 4 14 0M26 62c4 4 10 4 14 0M36 63c4 3 10 3 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle cx="16" cy="52" r="3" fill="currentColor" />
    </svg>
  );
}
