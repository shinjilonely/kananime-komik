import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikSearch,
  fetchKomikstationSearch,
  fetchMaidSearch,
  fetchKomikindoSearch,
  fetchBacamanSearch,
  fetchMeganeiSearch,
  ComicSource
} from '@/lib/api/comic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  try {
    const { source } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const page = searchParams.get('page') || '1';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    let data;
    switch (source as ComicSource) {
      case 'bacakomik':
        data = await fetchBacakomikSearch(query);
        break;
      case 'komikstation':
        data = await fetchKomikstationSearch(query);
        break;
      case 'maid':
        data = await fetchMaidSearch(query, parseInt(page));
        break;
      case 'komikindo':
        data = await fetchKomikindoSearch(query, parseInt(page));
        break;
      case 'bacaman':
        data = await fetchBacamanSearch(query);
        break;
      case 'meganei':
        data = await fetchMeganeiSearch(query);
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
