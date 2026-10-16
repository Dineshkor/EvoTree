import type { SpriteProps } from './types';

export function LucaSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="30" fill="var(--accent)" opacity="0.14" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M50 32c10 0 14 8 8 13s-18 1-18 10 10 13 20 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M50 20v-9M50 80v9M20 50h-9M80 50h9M29 29l-6-6M71 29l6-6M29 71l-6 6M71 71l6 6" />
      </g>
    </svg>
  );
}

export function CyanobacteriaSprite({ className }: SpriteProps) {
  const cells = [14, 32, 50, 68, 86];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {cells.map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy={50}
          rx={9}
          ry={15}
          fill="var(--accent)"
          opacity="0.16"
          stroke="currentColor"
          strokeWidth="3"
        />
      ))}
      <path
        d="M6 50c10-18 84-18 94 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
    </svg>
  );
}

export function EukaryoteSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill="var(--accent)" opacity="0.12" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="44" cy="46" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M58 60c10-8 22-3 22 6s-14 14-22 6"
        fill="currentColor"
        opacity="0.7"
      />
      <circle cx="44" cy="46" r="3.5" fill="currentColor" />
    </svg>
  );
}
