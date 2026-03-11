import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikPopular,
  fetchKomikstationPopular,
  fetchBacamanPopular,
  ComicSource
} from '@/lib/api/comic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  try {
    const { source } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    let data;
    switch (source as ComicSource) {
      case 'bacakomik':
        data = await fetchBacakomikPopular();
        break;
      case 'komikstation':
        data = await fetchKomikstationPopular(parseInt(page));
        break;
      case 'bacaman':
        data = await fetchBacamanPopular();
        break;
      default:
        return NextResponse.json({ error: 'Popular not available for this source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching popular data:', error);
    return NextResponse.json({ error: 'Failed to fetch popular data' }, { status: 500 });
  }
}
