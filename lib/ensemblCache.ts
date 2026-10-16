import { cacheLife } from 'next/cache';
import {
  fetchLineage,
  fetchSpecies,
  type LineageRank,
  type SpeciesSuggestion,
} from './ensembl';

export async function lineageCached(name: string): Promise<LineageRank[]> {
  'use cache';
  cacheLife('days');
  return fetchLineage(name);
}

export async function searchCached(q: string): Promise<SpeciesSuggestion[]> {
  'use cache';
  cacheLife('days');
  return fetchSpecies(q);
}
