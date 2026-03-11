import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacakomikChapter,
  fetchKomikstationChapter,
  fetchMaidChapter,
  fetchKomikindoChapter,
  fetchBacamanChapter,
  fetchSoftkomikChapter,
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
        data = await fetchBacakomikChapter(slug);
        break;
      case 'komikstation':
        data = await fetchKomikstationChapter(slug);
        break;
      case 'maid':
        data = await fetchMaidChapter(slug);
        break;
      case 'komikindo':
        data = await fetchKomikindoChapter(slug);
        break;
      case 'bacaman':
        data = await fetchBacamanChapter(slug);
        break;
      case 'softkomik':
        data = await fetchSoftkomikChapter(slug);
        break;
      default:
        return NextResponse.json({ error: 'Unknown source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chapter data:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter data' }, { status: 500 });
  }
}
