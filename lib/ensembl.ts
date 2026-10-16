export interface LineageRank {
  id: string;
  name: string;
  label: string;
  mya: number | null;
  anchoredTo?: string;
}

export const RANK_ANCHORS: Record<string, string> = {
  Mammalia: 'synapsids',
  Vertebrata: 'haikouichthys',
  Craniata: 'haikouichthys',
  Chordata: 'haikouichthys',
  Metazoa: 'arthropods',
  Opisthokonta: 'eukaryotes',
  Eukaryota: 'eukaryotes',
};

function first(value: unknown): string | null {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  if (typeof value === 'string') return value;
  return null;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

const LABEL_KEYS = [
  'common_name',
  'genbank_common_name',
  'ensembl_alias_name',
  'blast_name',
];

const KNOWN_MYA: Record<string, number> = {
  Eukaryota: 1900,
  'cellular organisms': 3500,
};

export function pickLabel(
  tags: Record<string, unknown> | undefined,
  fallback: string,
): string {
  const t = tags ?? {};
  for (const key of LABEL_KEYS) {
    const v = first(t[key]);
    if (v) return v;
  }
  return titleCase(fallback);
}

interface RawTaxon {
  id?: string;
  name?: string;
  scientific_name?: string;
  tags?: Record<string, unknown>;
}

function toRank(entry: RawTaxon): LineageRank {
  const name = entry.scientific_name ?? entry.name ?? 'Unknown';
  const tags = entry.tags ?? {};
  const myaRaw = first(tags.ensembl_timetree_mya);
  const parsed = myaRaw ? Number.parseFloat(myaRaw) : null;
  const mya = parsed !== null && Number.isFinite(parsed) ? parsed : KNOWN_MYA[name] ?? null;
  return {
    id: String(entry.id ?? name),
    name,
    label: pickLabel(tags, name),
    mya: mya !== null && Number.isFinite(mya) ? mya : null,
    anchoredTo: RANK_ANCHORS[name],
  };
}

function sparseMya(ranks: LineageRank[]): number | null {
  const known = ranks.map((r) => r.mya).filter((m): m is number => m !== null);
  if (known.length === 0) return null;
  return Math.max(...known);
}

export function fillMissingMya(ranks: LineageRank[]): LineageRank[] {
  const n = ranks.length;
  if (n === 0) return [];

  const knownIdx = ranks
    .map((r, i) => (r.mya !== null ? i : -1))
    .filter((i) => i >= 0);

  if (knownIdx.length === 0) {
    const top = 4000;
    const bottom = 50;
    return ranks.map((r, i) => ({
      ...r,
      mya: n === 1 ? top : top - (i * (top - bottom)) / (n - 1),
    }));
  }

  return ranks.map((r, i) => {
    if (r.mya !== null) return r;
    const prev = [...knownIdx].reverse().find((j) => j < i);
    const next = knownIdx.find((j) => j > i);
    if (prev !== undefined && next !== undefined) {
      const pv = ranks[prev].mya as number;
      const nv = ranks[next].mya as number;
      const t = (i - prev) / (next - prev);
      return { ...r, mya: pv + (nv - pv) * t };
    }
    if (prev !== undefined) return { ...r, mya: ranks[prev].mya };
    if (next !== undefined) return { ...r, mya: ranks[next].mya };
    return { ...r, mya: sparseMya(ranks) ?? 4000 };
  });
}

export function normalizeClassification(raw: unknown): LineageRank[] {
  const entries: RawTaxon[] = Array.isArray(raw) ? (raw as RawTaxon[]) : [];
  const ranks = entries.map(toRank);

  const reachesRoot = ranks.some(
    (r) => r.name === 'Eukaryota' || r.name === 'cellular organisms',
  );
  const withLuca: LineageRank[] = reachesRoot
    ? [
        ...ranks,
        { id: 'luca', name: 'LUCA', label: 'Cell Zero', mya: 4000 },
      ]
    : ranks;

  const filled = fillMissingMya(withLuca);
  return filled.sort((a, b) => (b.mya ?? 0) - (a.mya ?? 0));
}

export interface SpeciesSuggestion {
  id: string;
  name: string;
  commonName: string;
  displayName: string;
}

type FetchInit = RequestInit & { next?: { revalidate: number } };
const CACHE_INIT: FetchInit = { next: { revalidate: 86400 } };

const ENSEMBL = 'https://rest.ensembl.org';

export async function fetchLineage(
  name: string,
  fetchImpl: typeof fetch = fetch,
): Promise<LineageRank[]> {
  const url = `${ENSEMBL}/taxonomy/classification/${encodeURIComponent(
    name,
  )}?content-type=application/json`;
  const res = await fetchImpl(url, CACHE_INIT);
  if (res.status === 404) throw new Error('not-found');
  if (res.status === 429) throw new Error('busy');
  if (!res.ok) throw new Error('upstream');
  const ranks = normalizeClassification(await res.json());
  if (ranks.length === 0) throw new Error('not-found');
  return ranks;
}

export async function fetchSpecies(
  q: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SpeciesSuggestion[]> {
  const query = q.trim();
  if (!query) return [];
  const url = `${ENSEMBL}/taxonomy/name/${encodeURIComponent(
    query,
  )}?content-type=application/json`;
  const res = await fetchImpl(url, CACHE_INIT);
  if (!res.ok) return [];
  const json: unknown = await res.json();
  const arr = Array.isArray(json) ? (json as RawTaxon[]) : [];
  return arr.slice(0, 12).map((e) => {
    const name = e.scientific_name ?? e.name ?? '';
    return {
      id: String(e.id ?? name),
      name,
      commonName: pickLabel(e.tags, name),
      displayName: name.replace(/_/g, ' '),
    };
  });
}
