import type { NextRequest } from 'next/server';
import { fetchLineage } from '@/lib/ensembl';

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  if (!name) {
    return Response.json({ error: 'missing-name' }, { status: 400 });
  }
  try {
    const ranks = await fetchLineage(name);
    return Response.json(ranks);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upstream';
    const status = msg === 'not-found' ? 404 : msg === 'busy' ? 429 : 502;
    return Response.json({ error: msg }, { status });
  }
}
