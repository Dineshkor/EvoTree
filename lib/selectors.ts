import type { LineageId } from './types';
import { SPECIES, childrenOf, getSpecies } from './data/species';

export function highlightedIds(activeLineage: LineageId | null): Set<string> {
  if (!activeLineage) return new Set();
  return new Set(
    SPECIES.filter((s) => s.lineage === activeLineage).map((s) => s.id),
  );
}

export function dimmedIds(
  activeLineage: LineageId | null,
  selectedId: string | null,
): Set<string> {
  if (!activeLineage) return new Set();
  const highlight = highlightedIds(activeLineage);
  const out = new Set<string>();
  for (const s of SPECIES) {
    if (!highlight.has(s.id) && s.id !== selectedId) out.add(s.id);
  }
  return out;
}

export function neighborIds(selectedId: string | null): Set<string> {
  if (!selectedId) return new Set();
  const out = new Set<string>([selectedId]);
  const self = getSpecies(selectedId);
  if (self?.parent) out.add(self.parent);
  for (const child of childrenOf(selectedId)) out.add(child.id);
  return out;
}
