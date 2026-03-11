import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikHome,
  fetchKomikstationHome,
  fetchMaidLatest,
  fetchKomikindoLatest,
  fetchBacamanHome,
  fetchMeganeiHome,
  fetchSoftkomikHome,
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
        data = await fetchBacakomikHome();
        break;
      case 'komikstation':
        data = await fetchKomikstationHome();
        break;
      case 'maid':
        data = await fetchMaidLatest(parseInt(page));
        break;
      case 'komikindo':
        data = await fetchKomikindoLatest(parseInt(page));
        break;
      case 'bacaman':
        data = await fetchBacamanHome();
        break;
      case 'meganei':
        data = await fetchMeganeiHome(parseInt(page));
        break;
      case 'softkomik':
        data = await fetchSoftkomikHome();
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching home data:', error);
    return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 });
  }
}
