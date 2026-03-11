import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikLatest,
  fetchMaidLatest,
  fetchKomikindoLatest,
  fetchBacamanLatest,
  fetchMeganeiList,
  fetchSoftkomikUpdate,
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
        data = await fetchBacakomikLatest(parseInt(page));
        break;
      case 'maid':
        data = await fetchMaidLatest(parseInt(page));
        break;
      case 'komikindo':
        data = await fetchKomikindoLatest(parseInt(page));
        break;
      case 'bacaman':
        data = await fetchBacamanLatest();
        break;
      case 'meganei':
        data = await fetchMeganeiList(parseInt(page));
        break;
      case 'softkomik':
        data = await fetchSoftkomikUpdate();
        break;
      default:
        return NextResponse.json({ error: 'Latest not available for this source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching latest data:', error);
    return NextResponse.json({ error: 'Failed to fetch latest data' }, { status: 500 });
  }
                             }
