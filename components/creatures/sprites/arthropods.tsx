import type { SpriteProps } from './types';

export function ArthropodSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="50" rx="26" ry="34" fill="var(--accent)" opacity="0.14" />
      <path
        d="M50 18c16 0 24 14 24 32s-8 32-24 32-24-14-24-32 8-32 24-32Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M26 38h48M24 50h52M26 62h48" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M28 40 14 32M28 50 12 50M28 60 14 68M72 40l14-8M72 50h16M72 60l14 8" />
        <path d="M44 18 38 6M56 18l6-12" />
      </g>
    </svg>
  );
}

export function OpabiniaSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="46" cy="62" rx="24" ry="14" fill="var(--accent)" opacity="0.16" />
      <path
        d="M22 62c4-12 40-12 48 0-8 12-44 12-48 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <g fill="currentColor">
        <path d="M62 60c10-2 26 2 34 8-8 3-24 4-34-1Z" />
      </g>
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M40 50V34M46 48V26M52 48V28M58 50V34M34 52V40" />
      </g>
      <g fill="currentColor">
        <circle cx="40" cy="31" r="4" />
        <circle cx="46" cy="23" r="4" />
        <circle cx="52" cy="25" r="4" />
        <circle cx="58" cy="31" r="4" />
        <circle cx="34" cy="37" r="4" />
      </g>
    </svg>
  );
}

export function CrabSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="54" rx="30" ry="20" fill="var(--accent)" opacity="0.16" />
      <path
        d="M20 54c0-14 13-22 30-22s30 8 30 22-13 20-30 20-30-6-30-20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M24 46 12 36M28 60l-14 6M34 68l-8 14M66 68l8 14M72 60l14 6M76 46l12-10" />
      </g>
      <g fill="var(--accent)" stroke="currentColor" strokeWidth="2.5">
        <path d="M28 44c-10-6-18-4-20 4 8 4 16 2 20-4Z" />
        <path d="M72 44c10-6 18-4 20 4-8 4-16 2-20-4Z" />
      </g>
      <g fill="currentColor">
        <circle cx="43" cy="42" r="3" />
        <circle cx="57" cy="42" r="3" />
      </g>
    </svg>
  );
}
