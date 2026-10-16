import { describe, it, expect } from 'vitest';
import {
  pickLabel,
  normalizeClassification,
  fillMissingMya,
  fetchLineage,
  fetchSpecies,
  type LineageRank,
} from '../lib/ensembl';

const CAT_FIXTURE = [
  { id: '338152', name: 'Felinae', scientific_name: 'Felinae', tags: { name: ['Felinae'], ensembl_timetree_mya: ['11.2'] } },
  { id: '9681', name: 'Felidae', scientific_name: 'Felidae', tags: { name: ['Felidae'], ensembl_timetree_mya: ['11.9'] } },
  { id: '379583', name: 'Feliformia', scientific_name: 'Feliformia', tags: { name: ['Feliformia'], ensembl_timetree_mya: ['37'] } },
  { id: '33554', name: 'Carnivora', scientific_name: 'Carnivora', tags: { name: ['Carnivora'], common_name: ['carnivores'], ensembl_timetree_mya: ['55'] } },
  { id: '314145', name: 'Laurasiatheria', scientific_name: 'Laurasiatheria', tags: { name: ['Laurasiatheria'], ensembl_timetree_mya: ['74'] } },
  { id: '1437010', name: 'Boreoeutheria', scientific_name: 'Boreoeutheria', tags: { name: ['Boreoeutheria'], ensembl_alias_name: ['Placental mammals'], ensembl_timetree_mya: ['94'] } },
  { id: '9347', name: 'Eutheria', scientific_name: 'Eutheria', tags: { name: ['Eutheria'], common_name: ['eutherian mammals'], ensembl_timetree_mya: ['99'] } },
  { id: '40674', name: 'Mammalia', scientific_name: 'Mammalia', tags: { name: ['Mammalia'], genbank_common_name: ['mammals'], ensembl_timetree_mya: ['180'] } },
  { id: '32524', name: 'Amniota', scientific_name: 'Amniota', tags: { name: ['Amniota'], ensembl_timetree_mya: ['319'] } },
  { id: '117571', name: 'Euteleostomi', scientific_name: 'Euteleostomi', tags: { name: ['Euteleostomi'], ensembl_timetree_mya: ['429'] } },
  { id: '8287', name: 'Sarcopterygii', scientific_name: 'Sarcopterygii', tags: { name: ['Sarcopterygii'], ensembl_timetree_mya: ['415'] } },
  { id: '7742', name: 'Vertebrata', scientific_name: 'Vertebrata', tags: { name: ['Vertebrata'], genbank_common_name: ['vertebrates'], ensembl_timetree_mya: ['563'] } },
  { id: '89593', name: 'Craniata', scientific_name: 'Craniata', tags: { name: ['Craniata'] } },
  { id: '7711', name: 'Chordata', scientific_name: 'Chordata', tags: { name: ['Chordata'], ensembl_timetree_mya: ['588'] } },
  { id: '33511', name: 'Deuterostomia', scientific_name: 'Deuterostomia', tags: { name: ['Deuterostomia'] } },
  { id: '33208', name: 'Metazoa', scientific_name: 'Metazoa', tags: { name: ['Metazoa'], common_name: ['multicellular animals'] } },
  { id: '33154', name: 'Opisthokonta', scientific_name: 'Opisthokonta', tags: { name: ['Opisthokonta'], ensembl_alias_name: ['Animals and Fungi'], ensembl_timetree_mya: ['1275'] } },
  { id: '2759', name: 'Eukaryota', scientific_name: 'Eukaryota', tags: { name: ['Eukaryota'], common_name: ['eukaryotes'] } },
];

describe('pickLabel', () => {
  it('prefers common_name then alias then genbank, and title-cases the fallback', () => {
    expect(pickLabel({ common_name: ['cat', 'cats'] }, 'Felis catus')).toBe('cat');
    expect(pickLabel({ ensembl_alias_name: 'Placental mammals' }, 'Boreoeutheria')).toBe(
      'Placental mammals',
    );
    expect(pickLabel({ genbank_common_name: ['mammals'] }, 'Mammalia')).toBe('mammals');
    expect(pickLabel(undefined, 'cellular organisms')).toBe('Cellular Organisms');
  });
});

describe('normalizeClassification', () => {
  it('returns ranks oldest-first with every age filled in', () => {
    const ranks = normalizeClassification(CAT_FIXTURE);
    expect(ranks.length).toBeGreaterThan(5);
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i - 1].mya!).toBeGreaterThanOrEqual(ranks[i].mya!);
    }
    for (const r of ranks) expect(r.mya).not.toBeNull();
  });

  it('prepends a synthetic Cell Zero hand-off', () => {
    const ranks = normalizeClassification(CAT_FIXTURE);
    expect(ranks[0].id).toBe('luca');
    expect(ranks[0].label).toBe('Cell Zero');
  });

  it('anchors major ranks to the story tree', () => {
    const ranks = normalizeClassification(CAT_FIXTURE);
    const byName = (n: string) => ranks.find((r) => r.name === n);
    expect(byName('Mammalia')?.anchoredTo).toBe('synapsids');
    expect(byName('Vertebrata')?.anchoredTo).toBe('haikouichthys');
    expect(byName('Eukaryota')?.anchoredTo).toBe('eukaryotes');
  });
});

describe('fillMissingMya', () => {
  it('fills a list with no ages at all into descending values', () => {
    const ranks: LineageRank[] = [
      { id: 'a', name: 'A', label: 'A', mya: null },
      { id: 'b', name: 'B', label: 'B', mya: null },
      { id: 'c', name: 'C', label: 'C', mya: null },
    ];
    const filled = fillMissingMya(ranks);
    for (const r of filled) expect(r.mya).not.toBeNull();
    expect(filled[0].mya!).toBeGreaterThan(filled[filled.length - 1].mya!);
  });
});

function fakeFetch(status: number, body: unknown): typeof fetch {
  return (async () =>
    ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response) as typeof fetch;
}

describe('fetchLineage', () => {
  it('normalizes a successful response', async () => {
    const ranks = await fetchLineage('Felis_catus', fakeFetch(200, CAT_FIXTURE));
    expect(ranks[0].id).toBe('luca');
    expect(ranks.some((r) => r.name === 'Mammalia')).toBe(true);
  });

  it('maps 404 and 429 to distinct errors', async () => {
    await expect(fetchLineage('nope', fakeFetch(404, {}))).rejects.toThrow('not-found');
    await expect(fetchLineage('nope', fakeFetch(429, {}))).rejects.toThrow('busy');
  });
});

describe('fetchSpecies', () => {
  const TAXA = [
    {
      id: '9685',
      name: 'Felis catus',
      scientific_name: 'Felis catus',
      tags: { common_name: ['cat', 'cats'] },
    },
  ];

  it('maps taxa to suggestions', async () => {
    const out = await fetchSpecies('cat', fakeFetch(200, TAXA));
    expect(out).toEqual([
      { id: '9685', name: 'Felis catus', commonName: 'cat', displayName: 'Felis catus' },
    ]);
  });

  it('returns nothing for a blank query without calling the network', async () => {
    const neverFetch = (() => {
      throw new Error('should not fetch');
    }) as unknown as typeof fetch;
    expect(await fetchSpecies('', neverFetch)).toEqual([]);
  });
});
