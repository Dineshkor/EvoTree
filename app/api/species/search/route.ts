import type { NextRequest } from 'next/server';
import { searchCached } from '@/lib/ensemblCache';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  try {
    const results = await searchCached(q);
    return Response.json(results);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upstream';
    const status = msg === 'busy' ? 429 : 502;
    return Response.json({ error: msg }, { status });
  }
}
