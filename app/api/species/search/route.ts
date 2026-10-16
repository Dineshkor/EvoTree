import type { NextRequest } from 'next/server';
import { fetchSpecies } from '@/lib/ensembl';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const results = await fetchSpecies(q);
  return Response.json(results);
}
