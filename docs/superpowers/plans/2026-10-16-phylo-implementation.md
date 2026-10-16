# PHYLO: The Game of Life — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, gamified "Tech Tree" of 4 billion years of evolution: a React Flow canvas of circular creature medallions over living era backdrops with extinction fault lines, plus lineage tracing, a common-ancestor mashup calculator, an RPG creature drawer, and a morph slider.

**Architecture:** A pure-logic core (`lib/`) owns the dataset, layout math, era mapping, ancestor walking, morph interpolation, and derived selectors — all unit-tested. The UI is a thin, mostly-visual layer over a single `zustand` store. The React Flow canvas is isolated in a `'use client'` component loaded via `next/dynamic({ ssr: false })`.

**Tech Stack:** Next.js (App Router) + TypeScript, Tailwind CSS, `@xyflow/react`, `zustand`, `lucide-react`, `framer-motion`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-16-phylo-design.md`

## Global Constraints

- Project root: `D:\nextjs\phylo` (its own git repo). App Router, TypeScript strict.
- Canvas MUST be a `'use client'` component mounted with `next/dynamic` and `{ ssr: false }`.
- React Flow: vertical `TB` layout, `nodesDraggable={false}`, smooth pinch-zoom, `fitView`/`setCenter` on node select.
- Mobile-first. Fixed HUD must never cover the majority of the canvas.
- Copy rule: plain-English nickname leads; Latin name ONLY as tiny muted subtext inside the drawer; never a wall of text.
- Seed dataset: exactly the 14 nodes below, with extinction barriers at **252 MYA** and **66 MYA**.
- Backdrop updates are rAF-throttled and driven by viewport center, never per-node.
- No code comments unless the spec's copy is being embedded as a string.
- Verification for every UI task: `npx tsc --noEmit` passes. Verification for logic tasks: Vitest green.

## Review Focus

Inputs/conditions the spec implies but does not test; each is pinned by a test in the named task.

1. Root node (`parent === null`, Cell Zero) selected — lineage trace, camera pan, and mashup must not crash. (Task 5, Task 13)
2. Mashup of identical organisms, or of an extinct node — `commonAncestor` returns the pair's own ancestor or `null` gracefully. (Task 5, Task 15)
3. Initial/empty state before any interaction — drawer, beams, backdrop era default all render without selection. (Task 12, Task 16)
4. Narrow viewport (≤360px) — top HUD pills wrap/scroll without covering the canvas center. (Task 14)
5. Fast/repeated morph scrubbing — progress clamped to `[0,1]`, no stale intermediate state. (Task 6, Task 16)

---

## File Structure

```
phylo/
  app/layout.tsx, app/page.tsx, app/globals.css
  components/PhyloApp.tsx
  components/canvas/PhyloCanvas.tsx
  components/canvas/CreatureNode.tsx
  components/canvas/FossilNode.tsx
  components/canvas/ExtinctionBarrier.tsx
  components/canvas/LineageEdge.tsx
  components/canvas/MashupBeams.tsx
  components/creatures/CreatureSprite.tsx
  components/creatures/sprites/*.tsx        # one per svgKey
  components/ui/TopBar.tsx
  components/ui/MashupCalculator.tsx
  components/ui/CreatureDrawer.tsx
  components/ui/MorphSlider.tsx
  components/ui/ScaleGraphic.tsx
  components/ui/EraBackdrop.tsx
  components/ui/ColdOpen.tsx
  components/ui/ProgressMeter.tsx
  lib/types.ts
  lib/layout.ts
  lib/era.ts
  lib/ancestors.ts
  lib/morph.ts
  lib/selectors.ts
  lib/data/species.ts
  lib/data/eras.ts
  lib/data/lineages.ts
  lib/data/mashup.ts
  store/usePhyloStore.ts
  test/*.test.ts (colocated specs)
```

---

## Task 1: Scaffold Next.js project + tooling

**Files:**
- Create: full Next.js scaffold (`package.json`, `app/`, `tsconfig.json`, `tailwind`/postcss config, `next.config.ts`)
- Create: `vitest.config.ts`
- Modify: `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: nothing.
- Produces: a running dev server, installed deps, `npm run test` running Vitest, path alias `@/*`.

- [ ] **Step 1: Scaffold in place.** The folder already contains `docs/`. Run:

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --import-alias "@/*" --use-npm --no-turbopack --yes
```
If it refuses because the directory is non-empty, move `docs/` to `../phylo-docs-tmp`, scaffold, then move it back.

- [ ] **Step 2: Install runtime deps.**

```bash
npm i @xyflow/react zustand lucide-react framer-motion
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add Vitest config** (`vitest.config.ts`) with `environment: 'jsdom'`, `globals: true`, `@` alias to the root, and `setupFiles` pointing at a `test/setup.ts` that imports `@testing-library/jest-dom`.

- [ ] **Step 4: Add scripts** to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.

- [ ] **Step 5: Smoke-test the scaffold.**
Run: `npm run build`
Expected: build succeeds with the default page.

- [ ] **Step 6: Write a trivial passing test** `test/smoke.test.ts` asserting `1 + 1 === 2`.
Run: `npm run test`
Expected: 1 passed.

- [ ] **Step 7: Commit.**

```bash
git add -A && git commit -m "chore: scaffold Next.js + tailwind + vitest"
```

---

## Task 2: Domain types + seed dataset

**Files:**
- Create: `lib/types.ts`, `lib/data/species.ts`, `lib/data/eras.ts`, `lib/data/lineages.ts`, `lib/data/mashup.ts`
- Test: `test/data.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Rarity = 'common'|'rare'|'epic'|'legendary'|'mythic'`
  - `type EraId = 'origin'|'cambrian'|'land'|'extinction'|'present'`
  - `type LineageId = 'trunk'|'whales'|'chickens'|'crabs'|'humans'`
  - `interface Species { id; nickname; latin; mya; era: EraId; lineage: LineageId; rarity: Rarity; upgrade; lost; twist; scaleLabel; scaleMeters: number; svgKey; parent: string|null; extinct?: boolean }`
  - `interface ExtinctionEvent { id; mya; title; subtitle }`
  - `interface EraPalette { id: EraId; name; from; to; accent; particle: 'ember'|'mote'|'mist'|'ash'|'bubble' }`
  - `interface LineagePill { id; label; emoji; path: string[] }`
  - `const SPECIES: Species[]` (14), `const EXTINCTIONS: ExtinctionEvent[]` (2), `const ERAS: EraPalette[]` (5), `const LINEAGE_PILLS: LineagePill[]` (4), `const MASHUP_PAIRS: Record<string, { verdict: string }>` keyed `"a|b"` sorted.
  - `function getSpecies(id: string): Species | undefined`
  - `function childrenOf(id: string): Species[]`

- [ ] **Step 1: Write failing tests** `test/data.test.ts`:
  - `SPECIES` has exactly 14 entries with unique ids.
  - every `species.parent` is either `null` or a valid id, and no cycles (walk-up terminates).
  - every `svgKey` non-empty; every `era`/`lineage`/`rarity` in its union.
  - `EXTINCTIONS` mya values are exactly `[252, 66]`.
  - `getSpecies('luca')?.nickname === 'Cell Zero'`.

- [ ] **Step 2: Run tests, verify they fail** (`Cannot find module '../lib/data/species'`).

- [ ] **Step 3: Implement `lib/types.ts` and the four data modules.** Transcribe the 14 nodes verbatim from spec §11 with these ids:
  `luca` (4000), `cyanobacteria` (2400), `eukaryotes` (1800), `opabinia` (508, extinct), `arthropods` (520), `carcinization` (200), `haikouichthys` (518), `tiktaalik` (375), `synapsids` (200), `pakicetus` (50), `maiacetus` (47), `dorudon` (38), `blue-whale` (0). Assign `parent` pointers: `luca`→null; `cyanobacteria`,`eukaryotes`,`arthropods`→`luca`; `haikouichthys`→`luca`; `opabinia`→`arthropods`; `tiktaalik`→`haikouichthys`; `synapsids`→`tiktaalik`; `carcinization`→`arthropods`; `pakicetus`→`synapsids`; `maiacetus`→`pakicetus`; `dorudon`→`maiacetus`; `blue-whale`→`dorudon`. `lineage`: whale chain → `whales`; `tiktaalik`/`haikouichthys`/`synapsids` → `chickens`; `carcinization`/`arthropods`/`opabinia` → `crabs`; `luca`/`cyanobacteria`/`eukaryotes` → `trunk`. `MASHUP_PAIRS` includes at least `"human|mushroom"` and `"blue-whale|land-wolf"` verdicts from spec §7.1.

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add domain types and seed dataset`.

---

## Task 3: Layout engine

**Files:**
- Create: `lib/layout.ts`
- Test: `test/layout.test.ts`

**Interfaces:**
- Consumes: `Species` from Task 2.
- Produces:
  - `const TRUNK_X = 0; const LANE_SPACING = 280; const SPINE_HEIGHT = 6000;`
  - `function timeToY(mya: number): number` — `SPINE_HEIGHT * (Math.log1p(mya) / Math.log1p(4000))`; Present (0) → 0 (top), 4000 MYA → `SPINE_HEIGHT` (bottom).
  - `function laneFor(lineage: LineageId): number` — trunk→0, whales→+1, crabs→-1, chickens→+2, humans→-2.
  - `function assignPositions(species: Species[]): Record<string, { x: number; y: number }>` — `x = TRUNK_X + laneFor(lineage) * LANE_SPACING + jitter(id)`, `y = timeToY(mya)`.
  - `function jitter(id: string): number` — deterministic ±24 from a string hash.

- [ ] **Step 1: Write failing tests** `test/layout.test.ts`:
  - `timeToY(0) === 0` and `timeToY(4000) === SPINE_HEIGHT`.
  - `timeToY` is strictly increasing in `mya` (spot-check 0 < 50 < 375 < 4000).
  - `assignPositions(SPECIES)` returns an entry for every id and all `y` values in `[0, SPINE_HEIGHT]`.
  - two nodes of different lineages at the same `mya` get different `x`.

- [ ] **Step 2: Run tests, verify fail.**

- [ ] **Step 3: Implement `lib/layout.ts`** per the formulas above.

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add log-compressed timeline layout engine`.

---

## Task 4: Era mapping

**Files:**
- Create: `lib/era.ts`
- Test: `test/era.test.ts`

**Interfaces:**
- Consumes: `EraPalette`, `ERAS`, `EraId` from Task 2; `EXTINCTIONS` from Task 2.
- Produces:
  - `function eraForTime(mya: number): EraPalette` — if `|mya-252|<=30` or `|mya-66|<=15` → `extinction`; else `mya>900`→`origin`, `mya>440`→`cambrian`, `mya>150`→`land`, else `present`.
  - `function paletteById(id: EraId): EraPalette`.

- [ ] **Step 1: Write failing tests** `test/era.test.ts`: assert `eraForTime` returns `origin` for 4000, `cambrian` for 508, `land` for 375, `extinction` for 252 and 66, `present` for 0; and that every returned palette has non-empty `from`/`to`/`accent`.

- [ ] **Step 2: Run tests, verify fail.**

- [ ] **Step 3: Implement `lib/era.ts`.**

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add era palette mapping`.

---

## Task 5: Ancestor walker + common ancestor

**Files:**
- Create: `lib/ancestors.ts`
- Test: `test/ancestors.test.ts`

**Interfaces:**
- Consumes: `getSpecies` from Task 2; `MASHUP_PAIRS` from Task 2.
- Produces:
  - `function pathToRoot(id: string): string[]` — `[id, parent, ...]`, ends at root; `[]` for unknown id.
  - `function lineagePath(id: string): string[]` — same list reversed (root → id) for laser tracing.
  - `function commonAncestor(a: string, b: string): string | null` — first id in `a`'s ancestor set that appears in `b`'s chain; `null` if either unknown.
  - `function ancestorVerdict(a: string, b: string): string | null` — looks up `MASHUP_PAIRS` by sorted `"a|b"`; falls back to a generated string naming the common ancestor's nickname.

- [ ] **Step 1: Write failing tests** `test/ancestors.test.ts`:
  - `commonAncestor('pakicetus','blue-whale') === 'pakicetus'`.
  - `commonAncestor('luca','luca') === 'luca'` (self-pair, Review Focus 2).
  - `commonAncestor('luca','nope') === null`.
  - `lineagePath('blue-whale')` starts with `'luca'` and ends with `'blue-whale'`.
  - `pathToRoot('luca')` has length 1 (root, Review Focus 1).

- [ ] **Step 2: Run tests, verify fail.**

- [ ] **Step 3: Implement `lib/ancestors.ts`.**

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add ancestor walker and common-ancestor finder`.

---

## Task 6: Morph interpolation

**Files:**
- Create: `lib/morph.ts`
- Test: `test/morph.test.ts`

**Interfaces:**
- Consumes: `getSpecies` from Task 2.
- Produces:
  - `interface MorphChain { id: string; label: string; stageIds: string[] }`
  - `const WHALE_MORPH: MorphChain` = `['pakicetus','maiacetus','dorudon','blue-whale']`.
  - `interface MorphState { fromId: string; toId: string; t: number; nearId: string; upgrade: string; lost: string; scaleLabel: string; scaleMeters: number }`
  - `function morphAt(chain: MorphChain, progress: number): MorphState` — clamps `progress` to `[0,1]` (Review Focus 5), maps to a segment between adjacent stages, linearly interpolates `scaleMeters`, and takes `upgrade`/`lost`/`scaleLabel` from the nearer stage.

- [ ] **Step 1: Write failing tests** `test/morph.test.ts`:
  - `morphAt(WHALE_MORPH, 0).nearId === 'pakicetus'`.
  - `morphAt(WHALE_MORPH, 1).nearId === 'blue-whale'`.
  - `morphAt(WHALE_MORPH, -5)` equals `morphAt(WHALE_MORPH, 0)`; `morphAt(WHALE_MORPH, 9)` equals `morphAt(WHALE_MORPH, 1)`.
  - `scaleMeters` is strictly increasing across `progress` 0 → 1.

- [ ] **Step 2: Run tests, verify fail.**

- [ ] **Step 3: Implement `lib/morph.ts`.**

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add morph chain interpolation`.

---

## Task 7: Derived selectors (pure)

**Files:**
- Create: `lib/selectors.ts`
- Test: `test/selectors.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 5.
- Produces:
  - `function highlightedIds(activeLineage: LineageId | null): Set<string>` — all species ids whose `lineage` matches (empty set when null).
  - `function dimmedIds(activeLineage: LineageId | null, selectedId: string | null): Set<string>` — every id not highlighted and not selected, when a filter is active; empty set otherwise.
  - `function neighborIds(selectedId: string | null): Set<string>` — selected + its parent + its direct children (for the drawer's "related" pulses).

- [ ] **Step 1: Write failing tests** `test/selectors.test.ts`:
  - `highlightedIds('whales')` contains `pakicetus`,`maiacetus`,`dorudon`,`blue-whale` and not `luca`.
  - `highlightedIds(null)` is empty; `dimmedIds(null, 'luca')` is empty (empty state, Review Focus 3).
  - `neighborIds('luca')` contains `luca` and its children, and does not throw on `null` (Review Focus 1).

- [ ] **Step 2: Run tests, verify fail.**

- [ ] **Step 3: Implement `lib/selectors.ts`.**

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add pure UI selectors`.

---

## Task 8: Zustand store

**Files:**
- Create: `store/usePhyloStore.ts`
- Test: `test/store.test.ts`

**Interfaces:**
- Consumes: all previous tasks.
- Produces: `usePhyloStore` with state `{ selectedId: string|null; activeLineage: LineageId|null; mashupPair: [string,string]|null; morphProgress: number; discovered: Set<string>; reverse: boolean; coldOpenDone: boolean }` and actions `select(id: string|null)`, `setLineage(LineageId|null)`, `addMashupPick(id: string)`, `clearMashup()`, `setMorph(n: number)`, `discover(id: string)`, `toggleReverse()`, `finishColdOpen()`.

- [ ] **Step 1: Write failing tests** `test/store.test.ts` (call actions via `usePhyloStore.getState()`):
  - `select('luca')` sets `selectedId` and adds `luca` to `discovered`.
  - `addMashupPick` once stores a 1-item pending, twice sets the pair, a third pick resets to a new pending.
  - `setMorph(2)` clamps to `1`; `setMorph(-1)` clamps to `0`.
  - `finishColdOpen()` sets `coldOpenDone: true`.

- [ ] **Step 2: Run tests, verify fail.**

- [ ] **Step 3: Implement the store** with `create<...>()`. `mashupPair` starts as the user's pending picks; expose `mashupPick: string[]` internally to allow the 1→2→reset flow.

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add zustand store`.

---

## Task 9: Creature SVG sprites + dispatcher

**Files:**
- Create: `components/creatures/CreatureSprite.tsx`, `components/creatures/sprites/*.tsx` (one per `svgKey`)
- Test: `test/sprites.test.tsx`

**Interfaces:**
- Consumes: `SPECIES` from Task 2.
- Produces: `function CreatureSprite({ svgKey, className }: { svgKey: string; className?: string })` returning an animated inline `<svg>`. One component per distinct `svgKey` in `SPECIES`; hero creatures (whale chain, crab, tiktaalik, opabinia, luca) get detailed multi-path drawings; others get a stylized emblem. Unknown key → a neutral glowing cell fallback.

- [ ] **Step 1: Write failing test** `test/sprites.test.tsx`: iterate `SPECIES`, `render(<CreatureSprite svgKey={s.svgKey} />)`, assert an `<svg>` is present; and that an unknown key renders the fallback rather than throwing.

- [ ] **Step 2: Run test, verify fail.**

- [ ] **Step 3: Implement the sprites + dispatcher.** Use `currentColor` and CSS classes so the medallion ring can tint them. Keep each sprite self-contained.

- [ ] **Step 4: Run test, verify pass.**

- [ ] **Step 5: Commit** `feat: add animated creature sprites`.

---

## Task 10: Custom React Flow nodes

**Files:**
- Create: `components/canvas/CreatureNode.tsx`, `components/canvas/FossilNode.tsx`, `components/canvas/ExtinctionBarrier.tsx`, `components/canvas/LineageEdge.tsx`

**Interfaces:**
- Consumes: Tasks 2, 7, 8, 9; React Flow `NodeProps`, `EdgeProps`.
- Produces:
  - `CreatureNode`: circular medallion — `CreatureSprite` center, rarity-colored glow ring (CSS var `--rarity`), title badge under, "Unlocked Upgrade" pill. Reads `highlightedIds`/`dimmedIds`/`neighborIds` from selectors to set `data-state` (`active`|`dim`|`pulse`|`idle`).
  - `FossilNode`: cracked-stone medallion with `💀 Extinct`.
  - `ExtinctionBarrier`: full-width red fault line with a `framer-motion` shatter/ember overlay and label.
  - `LineageEdge`: `BezierEdge` with an animated dashed stroke that only animates for edges in `highlightedIds`.

- [ ] **Step 1: Implement the four components.** Mark `'use client'`. No unit test (visual); verification is typecheck + build.
Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Commit** `feat: add custom canvas nodes and edges`.

---

## Task 11: Era backdrop + particle layer

**Files:**
- Create: `components/ui/EraBackdrop.tsx`

**Interfaces:**
- Consumes: Task 4 (`eraForTime`), Task 8 (viewport time via store or prop).
- Produces: `<EraBackdrop era={EraPalette} />` — full-screen absolutely-positioned layers: a gradient using `from`/`to`/`accent` CSS variables (crossfaded via `framer-motion`), plus a `<canvas>` particle layer whose particle type switches with `era.particle` (`ember`|`mote`|`mist`|`ash`|`bubble`). Particle loop runs in one `requestAnimationFrame`, capped particle count, cleans up on unmount.

- [ ] **Step 1: Implement `EraBackdrop`.** Accept the palette as a prop so it stays pure; the canvas parent throttles updates.

- [ ] **Step 2: Typecheck.**
Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 3: Commit** `feat: add living era backdrop with particles`.

---

## Task 12: Canvas assembly + app shell

**Files:**
- Create: `components/canvas/PhyloCanvas.tsx`, `components/PhyloApp.tsx`, `components/DynamicCanvas.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: Tasks 2–11.
- Produces:
  - `PhyloCanvas` (`'use client'`): builds nodes/edges from `SPECIES` + `assignPositions`, registers `nodeTypes` (`creature`,`fossil`,`barrier`) and `edgeTypes` (`lineage`), sets `layout direction`, `nodesDraggable={false}`, `fitView`, `onNodeClick` → `select`. Adds `ExtinctionBarrier` nodes and the `EraBackdrop` behind via a custom `Background` or an absolutely-positioned sibling. `onViewportChange` computes center time via inverse of `timeToY` and updates a local `era` state throttled by rAF.
  - `DynamicCanvas`: `dynamic(() => import('./canvas/PhyloCanvas'), { ssr: false })`.
  - `PhyloApp`: composes `EraBackdrop` + `DynamicCanvas` + (top bar / drawer placeholders for now) inside a full-height `relative` container; renders `ColdOpen` later. Empty state (no selection) works (Review Focus 3).

- [ ] **Step 1: Implement the assembly.** Inverse time map: `yToTime(y) = Math.expm1((y / SPINE_HEIGHT) * Math.log1p(4000))`; add it as `function yToTime` in `lib/layout.ts` and a matching test in `test/layout.test.ts` (`yToTime(timeToY(375)) ≈ 375`).

- [ ] **Step 2: Run tests + typecheck + build.**
Run: `npm run test && npx tsc --noEmit && npm run build` — Expected: all pass; dev page renders the canvas.
Also run `npm run dev` and confirm medallions appear over the origin backdrop.

- [ ] **Step 3: Commit** `feat: assemble React Flow canvas and app shell`.

---

## Task 13: Cinematic cold-open

**Files:**
- Create: `components/ui/ColdOpen.tsx`
- Modify: `components/PhyloApp.tsx`

**Interfaces:**
- Consumes: Task 8 (`coldOpenDone`, `finishColdOpen`), Task 12.
- Produces: `<ColdOpen onDone={() => finishColdOpen()} />` — full-screen `framer-motion` overlay: title "PHYLO" assembling, subtitle "The Game of Life", tagline "4 billion years. One tiny cell. Sixty minutes to feel like a genius." A "Begin the journey" button; auto-dismiss after ~6s. Only rendered while `!coldOpenDone`.

- [ ] **Step 1: Implement `ColdOpen`; gate it in `PhyloApp` on `coldOpenDone`.**

- [ ] **Step 2: Typecheck + build.**
Run: `npx tsc --noEmit && npm run build` — Expected: pass.

- [ ] **Step 3: Commit** `feat: add cinematic cold-open`.

---

## Task 14: Top sticky bar (lineage pills + reverse mode)

**Files:**
- Create: `components/ui/TopBar.tsx`
- Modify: `components/PhyloApp.tsx`, `components/canvas/PhyloCanvas.tsx`

**Interfaces:**
- Consumes: Tasks 2 (`LINEAGE_PILLS`), 5 (`lineagePath`), 8 (`activeLineage`, `setLineage`, `reverse`, `toggleReverse`), 12.
- Produces:
  - `<TopBar />`: horizontally scrollable row of lineage pills (emoji + label). Tapping sets `activeLineage`; tapping again clears it. A "Reverse Mode" toggle flips `reverse` and shows a `Reverse` badge.
  - Camera panning: when `activeLineage` changes, `PhyloCanvas` walks `lineagePath` for the lineage's terminal node and steps `setCenter` along each id with a short delay (`framer-motion`-free, `setTimeout` chain, cleared on change).
  - HUD is `pointer-events-none` wrapper with `pointer-events-auto` pills; pills `flex-wrap`/scroll so a 360px viewport is not covered (Review Focus 4).

- [ ] **Step 1: Implement `TopBar` and the camera-pan effect.**

- [ ] **Step 2: Typecheck + build.**
Run: `npx tsc --noEmit && npm run build` — Expected: pass.

- [ ] **Step 3: Commit** `feat: add lineage pills and reverse-mode bar`.

---

## Task 15: Mashup calculator + beams

**Files:**
- Create: `components/ui/MashupCalculator.tsx`, `components/canvas/MashupBeams.tsx`
- Modify: `components/PhyloApp.tsx`, `components/canvas/PhyloCanvas.tsx`

**Interfaces:**
- Consumes: Tasks 2, 5, 8.
- Produces:
  - `<MashupCalculator />`: a bottom HUD button opening a picker of modern organisms (Present + a few icons). Two selections call `addMashupPick`. Once a pair exists, it shows the verdict banner from `ancestorVerdict(a,b)` inside a `framer-motion` animated banner with the common ancestor's nickname.
  - `<MashupBeams pair={[a,b]} ancestor={id} />`: two animated beams traveling from each organism up to `ancestor`, ending in a collision burst at the ancestor node. Rendered inside the React Flow canvas layer. Handles identical pair and `null` ancestor without crashing (Review Focus 2).

- [ ] **Step 1: Implement the calculator and beams.**

- [ ] **Step 2: Typecheck + build.**
Run: `npx tsc --noEmit && npm run build` — Expected: pass.

- [ ] **Step 3: Commit** `feat: add common-ancestor mashup calculator`.

---

## Task 16: RPG drawer + scale graphic + morph slider

**Files:**
- Create: `components/ui/CreatureDrawer.tsx`, `components/ui/ScaleGraphic.tsx`, `components/ui/MorphSlider.tsx`
- Modify: `components/PhyloApp.tsx`, `components/canvas/PhyloCanvas.tsx`

**Interfaces:**
- Consumes: Tasks 2, 6 (`WHALE_MORPH`, `morphAt`), 8 (`selectedId`, `select`, `morphProgress`, `setMorph`), 9.
- Produces:
  - `<CreatureDrawer />`: glassmorphic bottom sheet (lower ~50%), `framer-motion` slide-up, backdrop tap closes (`select(null)`). Not rendered when `selectedId === null` (empty state, Review Focus 3). Header: nickname + era line (`{mya} Million Years Ago` + "N years after the dinosaurs died") + muted Latin. Three badges: `➕ Added Upgrade` / `➖ Lost Trait` / `⚡ The Plot Twist`. When the selected node is in `WHALE_MORPH`, render `<MorphSlider />`; while morphing, the header/preview reflects `morphAt(WHALE_MORPH, morphProgress)`.
  - `<ScaleGraphic meters={number} label={string} />`: a human silhouette fixed at 1.8m next to a proportionally-scaled creature bar, with the relatable label.
  - `<MorphSlider progress onChange />`: labeled range 0–100; calls `setMorph` (clamped) (Review Focus 5). Shows stage ticks (Pakicetus/Maiacetus/Dorudon/Blue Whale).
  - Preview sprite in the drawer at the top half center uses `CreatureSprite` with the current stage's `svgKey`.

- [ ] **Step 1: Implement the drawer, scale graphic, and morph slider.**

- [ ] **Step 2: Typecheck + build.**
Run: `npx tsc --noEmit && npm run build` — Expected: pass. Confirm selecting a whale-chain node shows the slider and scrubbing updates scale label + sprite.

- [ ] **Step 3: Commit** `feat: add RPG drawer, scale graphic, and morph slider`.

---

## Task 17: Progress meter + confetti + polish pass

**Files:**
- Create: `components/ui/ProgressMeter.tsx`
- Modify: `components/PhyloApp.tsx`, `app/globals.css`, `README.md`

**Interfaces:**
- Consumes: Task 8 (`discovered`).
- Produces: `<ProgressMeter />` showing `discovered.size / 14` with micro-confetti burst when a new id is discovered. Add global CSS for grain/scanline overlay and rarity glow variables. README with run/build/test instructions and a feature overview.

- [ ] **Step 1: Implement `ProgressMeter` + global polish CSS + README.**

- [ ] **Step 2: Full verification.**
Run: `npm run test && npx tsc --noEmit && npm run lint && npm run build`
Expected: all green.
Then `npm run dev`, manually verify mobile viewport (devtools 390px): cold-open → tap a medallion → drawer slides → morph slider scrubs → lineage pill traces → mashup Human+Mushroom pops verdict.

- [ ] **Step 3: Commit** `feat: add progress meter, polish, and docs`.

---

## Self-Review Notes

- **Spec coverage:** §3 architecture → Tasks 1,12; §4 layout → Task 3; §5 nodes → Tasks 9,10; §6 backdrop → Tasks 4,11; §7 top bar + mashup → Tasks 14,15; §8 drawer → Task 16; §9 store → Task 8; §10 wow → Tasks 13,17; §11 dataset → Task 2; §12 slicing → Task order; §13 verification → every task.
- **Type consistency:** `LineageId`, `EraId`, `Rarity`, `Species`, `EraPalette`, `MorphChain`/`MorphState`, and store action names are defined once in Tasks 2/6/8 and reused verbatim.
- **Open decisions locked:** layout = log-compressed spine; sprites = hand-crafted inline SVG with emoji accent; delivery = vertical slice first.
