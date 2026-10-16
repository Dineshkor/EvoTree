import type { NextRequest } from 'next/server';
import { lineageErrorStatus } from '@/lib/ensembl';
import { lineageCached } from '@/lib/ensemblCache';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const name = params.get('name') ?? params.get('taxon');
  if (!name) {
    return Response.json({ error: 'missing-name' }, { status: 400 });
  }
  try {
    const ranks = await lineageCached(name);
    return Response.json(ranks);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upstream';
    return Response.json({ error: msg }, { status: lineageErrorStatus(msg) });
  }
}
