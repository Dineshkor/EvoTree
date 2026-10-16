import { getSpecies } from './data/species';
import { MASHUP_ORGANISMS, MASHUP_PAIRS, mashupKey } from './data/mashup';

interface Resolved {
  id: string;
  parent: string | null;
}

export function resolveNode(id: string): Resolved | null {
  const s = getSpecies(id);
  if (s) return { id: s.id, parent: s.parent };
  const g = MASHUP_ORGANISMS.find((o) => o.id === id);
  if (g) return { id: g.id, parent: g.parent };
  return null;
}

export function displayName(id: string): string {
  const s = getSpecies(id);
  if (s) return s.nickname;
  const g = MASHUP_ORGANISMS.find((o) => o.id === id);
  if (g) return g.label;
  return id;
}

export function pathToRoot(id: string): string[] {
  const out: string[] = [];
  let cur = resolveNode(id);
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    out.push(cur.id);
    guard.add(cur.id);
    cur = cur.parent ? resolveNode(cur.parent) : null;
  }
  return out;
}

export function lineagePath(id: string): string[] {
  return pathToRoot(id).reverse();
}

export function commonAncestor(a: string, b: string): string | null {
  const aSet = new Set(pathToRoot(a));
  if (aSet.size === 0) return null;
  for (const id of pathToRoot(b)) {
    if (aSet.has(id)) return id;
  }
  return null;
}

export function ancestorVerdict(a: string, b: string): string | null {
  const ancestor = commonAncestor(a, b);
  if (ancestor === null) return null;
  const known = MASHUP_PAIRS[mashupKey(a, b)];
  if (known) return known.verdict;
  return `${displayName(a)} and ${displayName(b)} meet back at ${displayName(ancestor)} — that is their last shared ancestor.`;
}
