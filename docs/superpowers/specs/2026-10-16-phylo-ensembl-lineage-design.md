# PHYLO — Live Lineage Tracing (Ensembl) + Guided Tour — Design Spec

**Date:** 2026-10-16
**Status:** Proposed
**Project:** `D:\nextjs\phylo`
**Builds on:** `docs/superpowers/specs/2026-10-16-phylo-design.md`

---

## 1. Problem

A first-time visitor lands on the PHYLO tree with no idea what to do, and the tree only
contains 13 hand-authored organisms. We fix both:

1. **Any organism, real data.** A visitor types *cat* and the app traces the cat's real
   evolutionary lineage all the way back to the first life, powered live by the Ensembl
   taxonomy API.
2. **Guided tour.** A short, skippable coach-mark tour teaches the core interactions on
   first visit, reopenable anytime.

Chosen architecture: **two layers** — the curated story tree stays, and a new live
"Trace any organism" engine overlays real Ensembl lineages onto it.

## 2. Ensembl integration — verified facts

- Base: `https://rest.ensembl.org` (release 116). No API key. `Access-Control-Allow-Origin: *`
  (browser-callable), but we proxy through a Next route for caching and a stable surface.
- **Lineage:** `GET /taxonomy/classification/{name}` → ordered ancestor array (immediate
  parent → root). Each entry: `id`, `name`, `scientific_name`, `tags` possibly containing
  `ensembl_timetree_mya`, `common_name`, `genbank_common_name`, `ensembl_alias_name`,
  `blast_name`, `synonym`.
  - Verified example (cat): `Felis catus → Felinae 11.2 → Felidae 11.9 → Carnivora 55 →
    Laurasiatheria 74 → Boreoeutheria 94 → Eutheria 99 → Mammalia 180 → Amniota 319 →
    Sarcopterygii 415 → Euteleostomi 429 → Gnathostomata 462 → Vertebrata 563 →
    Chordata 588 → Opisthokonta 1275 → Eukaryota → cellular organisms`.
- **Search:** `GET /taxonomy/name/{q}` → matching taxa (`id`, `name`, `tags.common_name`).
  `GET /info/species` → 356 hosted species (`taxon_id`, `name`, `display_name`,
  `common_name`, `division`).
- **Hard limits (must be handled honestly):** Ensembl is eukaryote-focused — the trace stops
  at **Eukaryota / "cellular organisms"**; there is no bacterial/archaeal LUCA. We append the
  existing **Cell Zero (LUCA)** featured node symbolically as the final step, clearly a
  hand-off. MYA is present on many but not all ranks.

## 3. Architecture

### 3.1 New server routes (App Router Route Handlers)

- `app/api/species/search/route.ts` — `GET ?q=` → normalized species suggestions. Serves a
  cached `/info/species` list (Next `fetch` cache, `revalidate: 86400`) filtered client-side,
  falling back to live `/taxonomy/name/{q}` when needed. Returns
  `{ id, name, commonName, displayName }[]`, capped at 12.
- `app/api/lineage/route.ts` — `GET ?name=Felis_catus` (or `?taxon=9685`) → normalized
  `LineageRank[]` (see §3.2). 24h cache. On upstream failure returns `{ error }` with the
  upstream status; 429 surfaces a "busy, retry" message.

### 3.2 Pure normalization (`lib/ensembl.ts`, unit-tested)

```ts
export interface LineageRank {
  id: string;
  name: string;          // scientific name
  label: string;         // punchy label (see pickLabel)
  mya: number | null;    // millions of years ago, if known
  anchoredTo?: string;   // featured species id this rank snaps to
}

export function pickLabel(tags: Record<string, unknown>, fallback: string): string;
// priority: common_name[0] → genbank_common_name[0] → ensembl_alias_name[0]
//           → blast_name[0] → name → fallback; Title-Case the raw scientific fallback.

export function normalizeClassification(raw: unknown): LineageRank[];
// parse ancestor array; reverse to root→leaf; map each to LineageRank;
// mya = parseFloat(tags.ensembl_timetree_mya?.[0]) or null.
// Append synthetic { id:'luca', name:'LUCA', label:'Cell Zero', mya:4000 } when the
// top of the lineage reaches 'cellular organisms' or 'Eukaryota'.

export function fillMissingMya(ranks: LineageRank[]): LineageRank[];
// monotonic kicker: fill null mya by linear interpolation between the nearest known ranks;
// if no known time at all, distribute evenly across [minKnown, 4000] or [50, 4000].

export const RANK_ANCHORS: Record<string, string>;
// maps a taxon name → featured species id so the rail visually snaps to the story tree:
// { Mammalia:'synapsids', Vertebrata:'haikouichthys', Craniata:'haikouichthys',
//   Chordata:'haikouichthys', Opisthokonta:'eukaryotes', Eukaryota:'eukaryotes',
//   Metazoa:'arthropods' }
```

Ranks get `anchoredTo` set in the normalizer via `RANK_ANCHORS`.

### 3.3 Trace rendering (canvas overlay)

- `components/canvas/TraceRail.tsx` — an SVG overlay (same viewport-mapping approach as
  `MashupBeams`) drawing a glowing polyline along the trunk from `timeToY(4000)` (Cell Zero)
  up to the organism, with a labelled chip per rank at `timeToY(rank.mya)`. Ranks with an
  `anchoredTo` draw a connector to that featured medallion, which pulses.
- The organism itself renders as a prominent **"You are here"** medallion (`TraceOriginNode`)
  at the top of the rail.
- Node/edge visual states reuse existing `data-state` CSS.

### 3.4 UI components

- `components/ui/SpeciesSearch.tsx` — a pill button (`🔎 Trace any organism`) that expands
  into a debounced search box with a results list (emoji + common name + scientific name).
  Selecting one calls `startTrace`.
- `components/ui/TracePanel.tsx` — while a trace is active: a compact header ("Tracing
  *Domestic Cat* back through **180 million years**"), a scrollable rank list with MYA
  badges, a loading state, an error/retry state, and a Clear button.
- `components/ui/Tour.tsx` + `components/ui/HelpButton.tsx` — the guided tour and its
  reopen control.

### 3.5 Zustand additions (`store/usePhyloStore.ts`)

New state: `traceOrigin: { id; label; commonName } | null`, `traceRanks: LineageRank[] | null`,
`traceLoading: boolean`, `traceError: string | null`, `tourStep: number`, `tourDone: boolean`.
New actions: `startTrace(org)`, `setTraceData(ranks)`, `setTraceError(msg)`, `clearTrace()`,
`nextTourStep()`, `prevTourStep()`, `finishTour()`, `reopenTour()`.
`tourDone` persists to `localStorage` (hydrate on mount, write on finish).

## 4. Guided Tour

Five coach-mark steps, each dimming the UI with a spotlight cut-out over a target element:

1. **canvas** — "This is the tree of life — 4 billion years, bottom to top. Drag to pan,
   pinch to zoom."
2. **a featured medallion** — "Tap any glowing creature to open its story."
3. **lineage pills** — "Tap a pill to light up a whole family line."
4. **trace button** — "Type any animal — even your cat — and trace it back to the first life."
5. **mashup button** — "…or pick two creatures and find your common ancestor."

Each step: `Next` / `Back` / `Skip`. No target found → the step shows centered (never blocks).
Tour auto-opens after the cold-open finishes on first run; `?` button reopens it.

Implementation: `Tour` positions a spotlight via `getBoundingClientRect()` of the target
(selected by `data-tour="…"` attribute); overlay is `pointer-events-none` except the control
card, so the highlighted control stays tappable.

## 5. Error, empty, and offline behavior

- Search returns nothing → "No organism found for '*x*'."
- Lineage fetch fails → trace panel shows a retry button; the story tree stays fully usable.
- Upstream 429 → "Ensembl is busy — try again in a moment."
- Ranks without MYA → `fillMissingMya` guarantees a monotonic, non-overlapping rail.
- Trace active while a featured node is selected → both coexist; the trace rail is drawn
  under the drawer.

## 6. Testing

Vitest for all pure logic:

- `normalizeClassification` on the captured cat fixture → correct order (root→leaf), the
  synthetic LUCA appended, `anchoredTo` set for Mammalia/Vertebrata/Eukaryota.
- `pickLabel` priority chain.
- `fillMissingMya` produces strictly non-decreasing ages and fills every null.
- `app/api/lineage` handler logic via a mocked `fetch` (normalizer integration), including a
  network-error path returning `{ error }`.

Verification gate: `npm run test` + `tsc --noEmit` + `npm run lint` + `npm run build`.

## 7. Data / network constraints

- Server proxying + Next fetch cache (24h) keeps Ensembl load tiny and avoids CORS entirely.
- No API key; rate-limit friendly.
- App remains fully usable with no network (featured tree unchanged).

## 8. Delivery slices

1. **Slice A — Ensembl engine** (`lib/ensembl.ts`, both route handlers, tests) ship and pass.
2. **Slice B — Trace UI** (`TraceRail`, `TraceOriginNode`, `SpeciesSearch`, `TracePanel`).
3. **Slice C — Guided tour** (`Tour`, `HelpButton`, store persistence).

## 9. Out of scope

- Bacteria/archaea/true LUCA data (Ensembl main is eukaryotes; would need Ensembl Genomes).
- Gene-level / Compara gene trees.
- Persisting or sharing traces.
