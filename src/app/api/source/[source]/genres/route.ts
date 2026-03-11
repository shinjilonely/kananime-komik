import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikGenres,
  fetchKomikstationGenres,
  fetchMaidGenres,
  fetchKomikindoGenres,
  fetchBacamanGenres,
  fetchSoftkomikGenres,
  ComicSource
} from '@/lib/api/comic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  try {
    const { source } = await params;

    let data;
    switch (source as ComicSource) {
      case 'bacakomik':
        data = await fetchBacakomikGenres();
        break;
      case 'komikstation':
        data = await fetchKomikstationGenres();
        break;
      case 'maid':
        data = await fetchMaidGenres();
        break;
      case 'komikindo':
        data = await fetchKomikindoGenres();
        break;
      case 'bacaman':
        data = await fetchBacamanGenres();
        break;
      case 'softkomik':
        data = await fetchSoftkomikGenres();
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
                                                                   }
