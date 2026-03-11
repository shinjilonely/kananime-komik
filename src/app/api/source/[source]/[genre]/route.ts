import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikGenre,
  fetchKomikstationGenre,
  fetchMaidGenre,
  fetchBacamanGenre,
  fetchSoftkomikGenre,
  ComicSource
} from '@/lib/api/comic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string; genre: string }> }
) {
  try {
    const { source, genre } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    let data;
    switch (source as ComicSource) {
      case 'bacakomik':
        data = await fetchBacakomikGenre(genre, parseInt(page));
        break;
      case 'komikstation':
        data = await fetchKomikstationGenre(genre, parseInt(page));
        break;
      case 'maid':
        data = await fetchMaidGenre(genre, parseInt(page));
        break;
      case 'bacaman':
        data = await fetchBacamanGenre(genre, parseInt(page));
        break;
      case 'softkomik':
        data = await fetchSoftkomikGenre(genre, parseInt(page));
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching genre data:', error);
    return NextResponse.json({ error: 'Failed to fetch genre data' }, { status: 500 });
  }
                                         }
