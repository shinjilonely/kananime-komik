import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikDetail,
  fetchKomikstationManga,
  fetchMaidManga,
  fetchKomikindoDetail,
  fetchBacamanDetail,
  fetchMeganeiInfo,
  fetchSoftkomikDetail,
  ComicSource
} from '@/lib/api/comic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string; slug: string }> }
) {
  try {
    const { source, slug } = await params;

    let data;
    switch (source as ComicSource) {
      case 'bacakomik':
        data = await fetchBacakomikDetail(slug);
        break;
      case 'komikstation':
        data = await fetchKomikstationManga(slug);
        break;
      case 'maid':
        data = await fetchMaidManga(slug);
        break;
      case 'komikindo':
        data = await fetchKomikindoDetail(slug);
        break;
      case 'bacaman':
        data = await fetchBacamanDetail(slug);
        break;
      case 'meganei':
        data = await fetchMeganeiInfo(slug);
        break;
      case 'softkomik':
        data = await fetchSoftkomikDetail(slug);
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching detail data:', error);
    return NextResponse.json({ error: 'Failed to fetch detail data' }, { status: 500 });
  }
}
