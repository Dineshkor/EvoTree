# PHYLO — Ensembl Lineage Tracing + Guided Tour — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a visitor search any organism and trace its real Ensembl lineage back to the first life, overlaid on the existing story tree, plus a guided on-ramp tour.

**Architecture:** Thin Next Route Handlers proxy Ensembl (cached, no key, no CORS); pure `lib/ensembl.ts` normalizes the raw taxonomy into labelled, dated ranks; a `TraceRail` SVG overlay draws the path; zustand holds trace + tour state; a `Tour` component renders spotlight coach-marks.

**Tech Stack:** Next.js 16 Route Handlers, TypeScript, React Flow, zustand, framer-motion, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-16-phylo-ensembl-lineage-design.md`

## Global Constraints

- No new npm dependencies. No Ensembl API key.
- All Ensembl access goes through server Route Handlers with Next fetch cache (`revalidate: 86400`). Never call Ensembl from a client component directly.
- Pure parsing/fetch logic lives in `lib/ensembl.ts` and takes an injectable `fetch` so it is unit-testable without network.
- The featured story tree must remain fully usable with no network.
- Every fix/task keeps `npm run test` + `npx tsc --noEmit` + `npm run lint` + `npm run build` green.
- No code comments.

## Review Focus

Edge cases the tasks must not break; each is pinned by a test in the named task.

1. Unknown/absent organism → friendly "no lineage" message, no crash. (Task 2, Task 5)
2. Lineage with **zero** MYA values → `fillMissingMya` still yields a valid monotonic rail. (Task 1)
3. Trace active while a featured node is selected → both coexist, no crash. (Task 4)
4. Ensembl 429 / network error → retry UI, featured tree unaffected. (Task 2, Task 5)
5. Tour target element missing → that step centers without blocking interaction. (Task 6)

---

## File Structure

```
lib/ensembl.ts                         # pure normalizer + injectable fetchers (+ RANK_ANCHORS)
app/api/lineage/route.ts               # GET ?name=  -> LineageRank[]
app/api/species/search/route.ts        # GET ?q=    -> SpeciesSuggestion[]
store/usePhyloStore.ts                 # + trace + tour state
components/canvas/TraceRail.tsx        # SVG rail + chips + origin medallion
components/ui/SpeciesSearch.tsx        # search pill + results + startTrace orchestration
components/ui/TracePanel.tsx           # active-trace header/list/loading/error
components/ui/Tour.tsx                 # spotlight coach-marks
components/ui/HelpButton.tsx           # reopens the tour
test/ensembl.test.ts, test/traceStore.test.ts
```

---

## Task 1: Pure Ensembl normalizer

**Files:**
- Create: `lib/ensembl.ts`
- Test: `test/ensembl.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface LineageRank { id: string; name: string; label: string; mya: number | null; anchoredTo?: string }`
  - `function pickLabel(tags: Record<string, unknown> | undefined, fallback: string): string`
  - `function normalizeClassification(raw: unknown): LineageRank[]`
  - `function fillMissingMya(ranks: LineageRank[]): LineageRank[]`
  - `const RANK_ANCHORS: Record<string, string>`

- [ ] **Step 1: Write failing tests** `test/ensembl.test.ts`:
  - `pickLabel({ common_name: ['cat','cats'] }, 'Felis catus') === 'cat'`.
  - `pickLabel({ ensembl_alias_name: 'Placental mammals' }, 'Boreoeutheria') === 'Placental mammals'` (string, not array, handled).
  - `pickLabel(undefined, 'cellular organisms') === 'Cellular Organisms'`.
  - On a `CAT_FIXTURE` (the captured classification array from the spec §2): `normalizeClassification` returns oldest-first (strictly descending `mya`), every rank has non-null `mya`, the first rank is `luca` labelled `Cell Zero`, and `Mammalia`/`Vertebrata`/`Eukaryota` carry `anchoredTo` values.
  - `fillMissingMya` on a hand-built list with all-null mya returns non-null, descending values.

- [ ] **Step 2: Run tests, verify they fail.**

- [ ] **Step 3: Implement `lib/ensembl.ts`.** `pickLabel`: read `common_name`, `genbank_common_name`, `ensembl_alias_name`, `blast_name` in order, accept string or `string[]`, fall back to title-casing `fallback`. `normalizeClassification`: map each entry to a rank (`name` = `scientific_name ?? name`, `label` = `pickLabel(tags, name)`, `mya` = `parseFloat(tags.ensembl_timetree_mya)` or null, `anchoredTo` = `RANK_ANCHORS[name]`); append synthetic `{id:'luca', name:'LUCA', label:'Cell Zero', mya:4000, anchoredTo:undefined}` when the array's top name is `Eukaryota` or `cellular organisms`; then `fillMissingMya`; then sort descending by `mya`. `fillMissingMya`: linear index interpolation between nearest known decades; copy a boundary value when only one side is known; when nothing is known, spread evenly from `4000` (first) to `50` (last). `RANK_ANCHORS = { Mammalia:'synapsids', Vertebrata:'haikouichthys', Craniata:'haikouichthys', Chordata:'haikouichthys', Metazoa:'arthropods', Opisthokonta:'eukaryotes', Eukaryota:'eukaryotes' }`.

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add pure Ensembl lineage normalizer`.

---

## Task 2: Ensembl fetchers + Route Handlers

**Files:**
- Modify: `lib/ensembl.ts` (add fetchers)
- Create: `app/api/lineage/route.ts`, `app/api/species/search/route.ts`
- Test: `test/ensembl.test.ts` (extend)

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `interface SpeciesSuggestion { id: string; name: string; commonName: string; displayName: string }`
  - `async function fetchLineage(name: string, fetchImpl = fetch): Promise<LineageRank[]>` — throws `Error('not-found')` on 404, `Error('busy')` on 429, `Error('upstream')` otherwise.
  - `async function fetchSpecies(q: string, fetchImpl = fetch): Promise<SpeciesSuggestion[]>`

- [ ] **Step 1: Write failing tests**:
  - `fetchLineage('Felis_catus', fakeFetchOk)` with a fake `fetch` returning `{ ok:true, json: async ()=>CAT_FIXTURE }` resolves to the normalized ranks.
  - `fetchLineage('x', fakeFetch404)` where the fake returns `{ ok:false, status:404 }` rejects with `'not-found'`.
  - `fetchspecies('cat', fake)` maps `[{id,name,scientific_name,tags:{common_name:[...]}}]` to `{id,name,commonName,displayName}`.
  - `fetchSpecies('', ...)` resolves to `[]`.

- [ ] **Step 2: Run tests, verify they fail.**

- [ ] **Step 3: Implement** the two fetchers (build the Ensembl URLs, check `res.ok`/`res.status`, normalize, slice search to 12). Then the Route Handlers as thin wrappers: `lineage/route.ts` reads `name`, calls `fetchLineage`, maps thrown errors to `Response.json({ error }, { status })` (404→404, busy→429, else→502); `species/search/route.ts` reads `q`, calls `fetchSpecies`, returns `[]` for a blank query.

- [ ] **Step 4: Run tests, verify pass.** Then `npx tsc --noEmit`.

- [ ] **Step 5: Commit** `feat: add Ensembl proxy route handlers`.

---

## Task 3: Trace + tour store state

**Files:**
- Modify: `store/usePhyloStore.ts`, `test/store.test.ts`
- Test: `test/traceStore.test.ts` (new, or extend `store.test.ts`)

**Interfaces:**
- Consumes: Task 1 (`LineageRank`).
- Produces: state `traceOrigin: { id: string; label: string; commonName: string } | null`, `traceRanks: LineageRank[] | null`, `traceLoading: boolean`, `traceError: string | null`, `tourStep: number`, `tourDone: boolean`; actions `startTrace(org)`, `setTraceData(ranks)`, `setTraceError(msg)`, `clearTrace()`, `nextTourStep(max: number)`, `prevTourStep()`, `finishTour()`, `reopenTour()`.

- [ ] **Step 1: Write failing tests**: `startTrace({id:'9685',label:'cat',commonName:'Domestic Cat'})` sets `traceOrigin`, `traceLoading:true`, clears `traceRanks`/`traceError`; `setTraceData([])` sets `traceLoading:false`; `clearTrace()` nulls all trace fields; `nextTourStep(4)` clamps at `4`; `finishTour()` sets `tourDone:true`, `tourStep:0`; `reopenTour()` sets `tourDone:false`, `tourStep:0`.

- [ ] **Step 2: Run tests, verify they fail.**

- [ ] **Step 3: Implement** the state + actions in the existing `create<...>()` store; add the fields to `initialPhyloState()`.

- [ ] **Step 4: Run tests, verify pass.**

- [ ] **Step 5: Commit** `feat: add trace and tour store state`.

---

## Task 4: Trace rail overlay

**Files:**
- Create: `components/canvas/TraceRail.tsx`
- Modify: `components/canvas/PhyloCanvas.tsx` (render `<TraceRail positions={positions} />` next to `<MashupBeams/>`)
- Modify: `app/globals.css` (rail/chip/origin styles)

**Interfaces:**
- Consumes: Tasks 1, 3; `positions` from `assignPositions`.
- Produces: `<TraceRail positions={Record<string,{x:number;y:number}>} />` — returns `null` when no `traceOrigin`/`traceRanks`. Otherwise an absolutely-positioned layer (same `useViewport()` screen-mapping as `MashupBeams`) drawing: an **origin medallion** ("🧍 You are here · {label}") pinned near the top of the trunk; a glowing polyline through each rank at `(flowX, timeToY(rank.mya))`; a labelled chip per rank; and, for ranks with `anchoredTo`, a connector to that featured node's position plus a pulse on it. A final "beyond Ensembl · prokaryotes" tag hangs off the LUCA chip.

- [ ] **Step 1: Implement `TraceRail`** using `useViewport` + `timeToY` (coords: `screen = flow*zoom + viewport`). Trunk x = `TRUNK_X`; anchored ranks take their anchor node's x. Chips are HTML (readable text), the rail/connectors are one `<svg>`.
- [ ] **Step 2: Wire into `PhyloCanvas`** as a sibling of `MashupBeams`; add `data-tour` attributes where Task 6 needs them later.
- [ ] **Step 3: Verify.** `npx tsc --noEmit` then `npm run build` — both pass. Manually: with `traceOrigin`+`traceRanks` set via the store, the rail renders (verified in Task 5's manual pass).
- [ ] **Step 4: Commit** `feat: add trace rail overlay`.

---

## Task 5: Organism search + trace panel

**Files:**
- Create: `components/ui/SpeciesSearch.tsx`, `components/ui/TracePanel.tsx`
- Modify: `components/PhyloApp.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: Tasks 2, 3.
- Produces:
  - `<SpeciesSearch />` — a `🔎 Trace any organism` pill (`data-tour="trace"`) that expands to an input; debounced (250ms) `GET /api/species/search?q=`; a results list; selecting a result calls `startTrace(org)` then `GET /api/lineage?name=` and `setTraceData`/`setTraceError`. Empty query clears results; no results → "No organism found for '*x*'".
  - `<TracePanel />` — when `traceOrigin` is set: header ("Tracing *{commonName}* back N million years", N = origin's first rank `mya` rounded), the scrollable rank list with MYA badges, a loading spinner, an error card with a Retry button, and a Clear button.

- [ ] **Step 1: Implement `SpeciesSearch`** (client, debounce, abortable fetch, error-aware).
- [ ] **Step 2: Implement `TracePanel`** (loading/error/list/clear; handles Review Focus 1 & 4).
- [ ] **Step 3: Wire both into `PhyloApp`** (search pill in the HUD; panel as a left/top floating card that doesn't cover the drawer).
- [ ] **Step 4: Verify.** `npm run test && npx tsc --noEmit && npm run lint && npm run build`, then `npm run dev`: search "cat" → selection → rail draws to Cell Zero; search gibberish → friendly empty message; kill network → retry card, story tree still usable.
- [ ] **Step 5: Commit** `feat: add organism search and trace panel`.

---

## Task 6: Guided tour

**Files:**
- Create: `components/ui/Tour.tsx`, `components/ui/HelpButton.tsx`
- Modify: `components/PhyloApp.tsx`, `components/ui/TopBar.tsx` (add `data-tour="pills"`), `components/canvas/CreatureNode.tsx` (`data-tour="creature"`), `components/ui/SpeciesSearch.tsx` (already `data-tour="trace"`), `components/ui/MashupCalculator.tsx` (`data-tour="mashup"`), `app/globals.css`
- Modify: `store/usePhyloStore.ts` only if a persistence helper is needed (localStorage read/write lives in `Tour`)

**Interfaces:**
- Consumes: Task 3 (`tourStep`, `tourDone`, `nextTourStep`, `prevTourStep`, `finishTour`, `reopenTour`), cold-open state.
- Produces:
  - `const TOUR_STEPS: { target: string; title: string; body: string }[]` — 5 steps targeting `[data-tour="canvas"|"creature"|"pills"|"trace"|"mashup"]`.
  - `<Tour />` — when `!tourDone`: overlay with a spotlight (`box-shadow: 0 0 0 9999px rgba(0,0,0,.72)` on a rect matching the target's `getBoundingClientRect()`), a control card with title/body + Back/Next/Skip, and per-step target lookup that falls back to a centered card when the target is missing (Review Focus 5). Writes `localStorage.setItem('phyloTourDone','1')` on finish. Auto-starts once after the cold open.
  - `<HelpButton />` — a `?` button (`data-tour="help"`) that calls `reopenTour()`.

- [ ] **Step 1: Implement `Tour` + `HelpButton`**; add `data-tour` attributes to the four targets and a `data-tour="canvas"` wrapper in `PhyloCanvas`.
- [ ] **Step 2: Auto-start logic** — in `Tour`, on mount read `localStorage.phyloTourDone`; if unset and `coldOpenDone`, `reopenTour()`. On `finishTour`, persist.
- [ ] **Step 3: Wire `Tour` + `HelpButton` into `PhyloApp`.**
- [ ] **Step 4: Verify.** `npm run test && npx tsc --noEmit && npm run lint && npm run build`, then `npm run dev`: first load shows cold-open → tour spotlights each control → Skip/Finish; reload does not re-show; `?` reopens.
- [ ] **Step 5: Commit** `feat: add guided tour and help button`.

---

## Self-Review Notes

- **Spec coverage:** §2 rows → Tasks 1–2; §3.2 → Task 1; §3.3 → Task 4; §3.4 → Tasks 5–6; §3.5 → Task 3; §4 → Task 6; §5 → Tasks 2,4,5,6; §6 → Tasks 1–3; §8 slices → A=T1-2, B=T3-5, C=T6.
- **Type consistency:** `LineageRank`, `SpeciesSuggestion`, and the store action names are defined once (Tasks 1, 3) and reused verbatim.
- **Decisions locked:** server-proxy (never client Ensembl), injectable `fetch` for testability, oldest-first rail sorted by MYA, synthetic LUCA hand-off.
