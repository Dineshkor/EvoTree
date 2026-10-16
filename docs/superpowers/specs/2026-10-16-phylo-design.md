# PHYLO: The Game of Life — Design Spec

**Date:** 2026-10-16
**Status:** Approved
**Folder:** `D:\nextjs\phylo` (own git repository)

---

## 1. Vision

An interactive, mobile-first web app that visualizes 4 billion years of evolution as a
gamified RPG "Tech Tree" for casual, everyday users — not scientists. Every organism leads
with a punchy, plain-English nickname (e.g. "The Wolf-Sized Land Whale"); the scientific
name is tucked away as tiny muted subtext.

**Success bar:** an amateur visitor must be *flabbergasted* on first load. First-load
impression and the feel of exploring the tree take priority over breadth of features.

**Anti-goals:** no corporate flowchart rectangles, no dry Latin taxonomy, no walls of text.

---

## 2. Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- `@xyflow/react` (React Flow) for the canvas
- `zustand` for UI/canvas state
- `lucide-react` for icons
- `framer-motion` for transitions and drawer/backdrop animation
- Vitest for unit tests of pure logic

The React Flow canvas is isolated inside a `'use client'` component loaded with
`next/dynamic` and `{ ssr: false }`.

---

## 3. Architecture

### 3.1 File / Module Layout

```
phylo/
  app/
    layout.tsx
    page.tsx                 # server shell -> dynamic client root
    globals.css
  components/
    PhyloApp.tsx             # 'use client' root: TopBar + Canvas + Drawer
    canvas/
      PhyloCanvas.tsx        # <ReactFlow> + nodeTypes + custom background
      CreatureNode.tsx       # circular glowing medallion
      FossilNode.tsx         # extinct stone/skull medallion
      ExtinctionBarrier.tsx  # full-width red fault line
      LineageEdge.tsx        # animated glowing "laser" edge
      MashupBeams.tsx        # two colliding beams for the mashup calc
    creatures/
      CreatureSprite.tsx     # dispatch by species id -> animated inline SVG
      sprites/*.tsx          # one hand-crafted SVG per organism
    ui/
      TopBar.tsx             # lineage pills + reverse mode + mashup trigger
      MashupCalculator.tsx
      CreatureDrawer.tsx     # glassmorphic RPG bottom sheet
      MorphSlider.tsx
      ScaleGraphic.tsx       # "standing next to a human" silhouette bar
      EraBackdrop.tsx        # animated era atmosphere + particle layer
      ColdOpen.tsx           # cinematic intro
      ProgressMeter.tsx      # "N/14 organisms discovered"
  lib/
    types.ts
    layout.ts                # time -> y/x position engine
    era.ts                   # time -> era palette/particles
    ancestors.ts             # parent-chain walk + common ancestor finder
    morph.ts                 # morph interpolation across a chain
    data/
      species.ts             # all 14 nodes + parent pointers
      eras.ts
      lineages.ts
      mashup.ts              # ancestor map + punchy verdicts
  store/
    usePhyloStore.ts
  test/                      # vitest specs for lib/*
```

### 3.2 Data Flow

- `lib/data/species.ts` is the single source of truth: each node has `id`, `nickname`,
  `latin`, `mya`, `era`, `lineage`, `rarity`, `upgrade`, `lost`, `twist`, `scale`,
  `svgKey`, and `parent` (evolutionary parent id).
- `lib/layout.ts` converts `mya` → canvas position using log-compressed time, and assigns
  left/right branch offsets from the trunk.
- Component tree reads the `zustand` store. Fine-grained selectors keep canvas animation
  at 60fps; node styling (highlighted / dimmed / extinct) is derived, not stored widely.
- `EraBackdrop` derives the current era from the viewport center's time value, updated on
  a `requestAnimationFrame`-throttled `onViewportChange` — never per node.
- Mashup: pick two species → walk `parent` chains → find common ancestor → animate two
  beams → burst → verdict banner.
- Morph: a chain array (starting with the whale chain) drives `morphProgress` 0→1, which
  interpolates traits, scale label, and the SVG sprite.

---

## 4. Layout Engine

**Decision:** log-compressed vertical spine (option 1).

- A central glowing "trunk" runs bottom→top from 4,000 MYA → Present.
- Time is compressed non-linearly so the 3-billion-year early era gets real space and
  recent eras do not dominate.
- Branches fan out left/right from the trunk at computed x-offsets.
- React Flow configured `TB`, `nodesDraggable={false}`, smooth pinch-zoom, and
  `fitView`/`setCenter` centering when a node is selected.

---

## 5. Custom Node Types

- **`CreatureNode`** — circular glowing medallion: animated inline-SVG sprite center,
  rarity-colored glow ring, plain-English title badge beneath, "Unlocked Upgrade" pill.
- **`FossilNode`** — cracked stone / skull medallion for extinct branches.
- **`ExtinctionBarrier`** — full-width glowing red fault line with shatter/ember animation
  and a label (e.g. "252 MYA · The Great Dying — 90% of life wiped out").
- **`LineageEdge`** — custom animated "laser" edge; dormant until a lineage is active.
- **`MashupBeams`** — two glowing beams that travel up their chains and collide.

Extinction barriers are positioned at 252 MYA and 66 MYA. Side-branches terminate into
`FossilNode`s at the barrier; 1–2 "survivor" paths squeeze through and burst into new
branches above.

---

## 6. Living Era Backdrop

Full-screen layered backing driven by the viewport center's time → era palette and
particle set:

1. **4,000 MYA (Origin):** pitch-black hydrothermal vents, glowing ember particles.
2. **508 MYA (Cambrian):** bioluminescent neon-teal deep sea.
3. **375 MYA (Land Invasion):** misty emerald-green primordial swamp.
4. **252 / 66 MYA (Extinctions):** molten crimson/amber volcanic hazard zones.
5. **Present Day:** crisp modern biosphere blue/green.

Smooth CSS-variable crossfade between eras plus a particle canvas layer that swaps per era.
Throttled with rAF.

---

## 7. Top Sticky Bar

- **Lineage pills:** 🐋 Whales · 🐓 Chickens→T-Rex · 🦀 Everything Becomes a Crab ·
  🧍 Humans. Tapping highlights the full path with animated laser edges and pans the
  camera along the story via stepped `setCenter` moves.
- **Reverse Mode toggle:** flips the arrow of time and reveals reverse-evolution trivia.
- **Mashup Calculator trigger.**

### 7.1 Mashup Calculator

Pick any two modern organisms (e.g. Human + Mushroom, Blue Whale + Land Wolf). Two beams
travel backward up the tree until they collide at the exact common ancestor, then a punchy
verdict banner pops up (e.g. *"You and a mushroom split 1.5 billion years ago — fungi are
closer to you than to plants!"*).

---

## 8. RPG Drawer (Mobile-First Bottom Sheet)

Tapping a medallion opens a glassmorphic bottom sheet covering the lower ~50% of the
screen, keeping the selected node centered in the top half. Contents:

- **Header:** plain-English title + era ("50 Million Years Ago · 16M years after dinosaurs
  died") + muted Latin name.
- **Standing-Next-to-a-Human Scale Graphic:** silhouette comparison bar with a relatable
  label (e.g. "Size of a Golden Retriever 🐕").
- **RPG Build Stats (3 succinct badges):**
  - `➕ Added Upgrade`
  - `➖ Lost Trait`
  - `⚡ The Plot Twist` (1-sentence mind-blowing fact)
- **Morph Slider:** scrub 0%→100% through a major transition, dynamically updating traits,
  body stats, and the sprite. First chain: Pakicetus (4-legged wolf) → Maiacetus
  (sea-lion swimmer) → Dorudon (shrinking hind legs) → Blue Whale (blowhole & flukes).

---

## 9. State (`store/usePhyloStore.ts`)

Shape: `selectedNode`, `activeLineageFilter`, `mashupPair`, `morphProgress`,
`discoveredIds` (progress), plus derived highlight/dim sets exposed via selectors.

---

## 10. Wow Features (beyond the brief)

- Cinematic cold-open: title fly-in from 4,000 MYA.
- Collection progress meter ("9/14 organisms discovered") rewarding exploration with
  micro-confetti.
- Rarity glow tiers.
- Faint animated grain/scanlines for a futuristic feel (no audio).

---

## 11. Seed Dataset (all 14 nodes)

1. **Cell Zero** (*LUCA*, 4000 MYA) — Universal DNA Code | Microscopic (0.001mm) |
   "Every mushroom, T-Rex, and human still runs on this exact same genetic OS."
2. **The Oxygen Makers** (*Cyanobacteria*, 2400 MYA) — Photosynthesis | Microscopic |
   "Pumped out so much toxic oxygen they accidentally froze the entire planet into
   Snowball Earth."
3. **The Power-Plant Cell** (*Early Eukaryotes*, 1800 MYA) — Mitochondria Battery |
   Microscopic | "One microbe swallowed another and forgot to digest it, creating the power
   plant inside your cells."
4. **The 5-Eyed Vacuum Monster** (*Opabinia*, 508 MYA, extinct at boundary) — 5 Stalked
   Eyes & Claw Nozzle | Size of a smartphone (7 cm) | "Scientists actually laughed out
   loud when its fossil was first unveiled."
5. **Armor-Plated Sea Bugs** (*Early Arthropods*, 520 MYA) — Modular Exoskeleton | Size of
   a lobster | "Built the first external body armor, eventually conquering both oceans and
   land."
6. **The Crab Glitch** (*Carcinization*, 200 MYA–Present) — Sideways Armored Tank | Size of
   a dinner plate | "Nature loves this shape so much that 5 separate non-crab groups
   independently evolved into crabs."
7. **The Fingernail Fish** (*Haikouichthys*, 518 MYA) — First Backbone & Skull | Size of
   your fingernail (2.5 cm) | "Every dinosaur, bird, whale, and human is built on this tiny
   swimmer's spinal blueprint."
8. **The Push-Up Fish** (*Tiktaalik*, 375 MYA) — Weight-Bearing Wrists & Lungs | Size of an
   alligator (1.2m) | "Used muscular fins with real wrist bones to do push-ups out of
   shallow mudflats onto dry land."
9. **[RED EXTINCTION BARRIER: 252 MYA — The Great Dying (90% of species wiped out)]**
10. **Night-Burrowing Survivors** (*Early Synapsids/Mammals*, 200 MYA) — Warm Blood, Fur &
    Milk | Size of a shrew (10 cm) | "Survived volcanic apocalypse and outlived giant
    dinosaurs by hiding underground at night."
11. **The Wolf-Sized Land Whale** (*Pakicetus*, 50 MYA) — Underwater Ear Bone | Size of a
    Golden Retriever (1.5m) | "After 325M years of adapting to dry land, this furry
    four-legged carnivore walked right back into the sea."
12. **The Walking Sea-Lion Whale** (*Maiacetus*, 47 MYA) — Webbed Feet & Amphibious Spine |
    Size of a Sea Lion (2.5m) | "Hunted at sea, but fossilized pregnant mothers prove they
    still crawled onto beaches to give birth head-first."
13. **The Shrinking-Leg Whale** (*Dorudon*, 38 MYA) — Tail Fluke & Sliding Blowhole | Size
    of an Orca (5m) | "Its nostrils physically slid up its skull to become a blowhole while
    its back legs shrank into tiny useless stubs."
14. **The 150-Ton Ocean Giant** (*Modern Blue Whale*, Present) — Baleen Filter & Gigantism |
    3 School Buses (30m) | "Still carries tiny leftover hip and leg bones deep inside its
    body from its four-legged land ancestors."

A second extinction barrier (**66 MYA — The Asteroid**) is also rendered for the
non-avian dinosaur / chicken lineage story.

---

## 12. Delivery Strategy

Built as a **vertical slice first**, then mechanics.

- **Slice 1 (running & polished):** canvas + custom medallion nodes + era backdrop +
  extinction barriers + seed data + RPG drawer.
- **Slice 2 (mechanics):** lineage pills, mashup calculator, morph slider, cold-open,
  progress meter.

---

## 13. Verification

- **Vitest** unit tests for pure `lib/` logic: layout math, ancestor finder, era mapping,
  morph interpolation.
- Full check before completion: `next lint` + `tsc --noEmit` + `next build` + Vitest green.
