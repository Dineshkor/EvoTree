import type { SpriteProps } from './types';

export function HaikouichthysSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M14 58c12-16 40-22 62-14 8 3 14 8 14 8s-6 5-14 8c-22 8-50 2-62-14Z"
        fill="var(--accent)"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M20 58c10-2 20-1 28 3M20 58c10 2 20 1 28-3M48 52c8-4 20-4 28 2M48 62c8 4 20 4 28-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle cx="78" cy="52" r="3.5" fill="currentColor" />
      <path d="M90 44l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function TiktaalikSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M10 54c14-12 46-16 70-6 8 4 12 6 12 6s-4 2-12 6c-24 10-56 6-70-6Z"
        fill="var(--accent)"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M22 62c-2 8-8 12-8 12M34 66c-2 8-8 12-8 12M60 62c6 6 8 12 8 12M72 58c6 6 8 12 8 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="80" cy="50" r="3.5" fill="currentColor" />
      <path d="M78 40c4 0 6 3 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function SynapsidSprite({ className }: SpriteProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M28 66c-10 0-16-8-16-16 0-12 10-20 24-20 6-8 16-10 24-6 8 3 12 10 12 16 8 2 12 8 12 14 0 8-8 12-16 12Z"
        fill="var(--accent)"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle cx="30" cy="46" r="3" fill="currentColor" />
      <path d="M18 58l-10 2M86 62l10-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M34 70v12M48 70v12M62 70v12M76 70v12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
