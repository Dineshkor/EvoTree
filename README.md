# PHYLO · The Game of Life

An interactive, mobile-first map of **4 billion years of evolution**, built as a gamified
RPG "tech tree" for everyday people — not scientists. Every organism leads with a punchy
plain-English nickname (e.g. *"The Wolf-Sized Land Whale"*); the Latin name is tucked away
as tiny muted subtext.

Built with Next.js (App Router) + TypeScript, Tailwind CSS, [`@xyflow/react`](https://reactflow.dev),
`zustand`, `framer-motion`, and `lucide-react`.

## Features

- **Circular creature medallions** — custom React Flow nodes with animated inline-SVG
  sprites, rarity-colored glow rings, nickname badges, and "Unlocked Upgrade" pills.
- **Living era backdrop** — the atmosphere transitions through Earth's eras as you scroll
  the timeline, with an era-specific particle field (ember, bioluminescent mote, mist, ash,
  bubble).
- **Extinction fault lines** — glowing red barriers at *252 MYA (The Great Dying)* and
  *66 MYA (The Asteroid)*, with extinct branches terminating in fossil nodes.
- **"How are we related?" lineage pills** — tap Whales / Chickens→T-Rex / Crabs / Humans to
  trace the full path with animated laser edges and a guided camera fly-through.
- **Mashup calculator** — pick any two organisms and watch two beams collide at their exact
  common ancestor, then read a punchy verdict.
- **RPG character sheet** — a glassmorphic bottom drawer with a "standing next to a human"
  scale graphic and three build badges (➕ Added Upgrade, ➖ Lost Trait, ⚡ The Plot Twist).
- **Morph slider** — scrub the whale lineage from *Pakicetus* (four-legged wolf) to the
  *Blue Whale* and watch traits and scale evolve live.
- **Progress meter** with confetti as you discover all 13 organisms.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Best viewed on a phone-sized viewport
(use your browser devtools' mobile emulation).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run the Vitest unit suite (pure `lib/` logic) |

## Architecture

Pure, unit-tested logic lives in `lib/`:

- `lib/data/*` — the seed dataset (`species.ts`), era palettes, lineage pills, mashup guests.
- `lib/layout.ts` — log-compressed timeline positioning (`timeToY` / `yToTime`).
- `lib/era.ts` — age → era palette mapping.
- `lib/ancestors.ts` — parent-chain walking + common-ancestor finder.
- `lib/morph.ts` — morph-chain interpolation.
- `lib/selectors.ts` — derived highlight/dim/neighbor sets.

The UI is a thin layer over a single `zustand` store (`store/usePhyloStore.ts`). The React
Flow canvas (`components/canvas/PhyloCanvas.tsx`) is client-only, loaded via
`next/dynamic` with `ssr: false`.

Design and implementation docs live under `docs/superpowers/`.
