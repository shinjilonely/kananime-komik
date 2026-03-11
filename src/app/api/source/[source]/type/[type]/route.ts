import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBacamanType,
  fetchSoftkomikType,
  fetchKomikstationList,
  ComicSource
} from '@/lib/api/comic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string; type: string }> }
) {
  try {
    const { source, type } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    if (!['manga', 'manhwa', 'manhua'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Use manga, manhwa, or manhua' }, { status: 400 });
    }

    let data;
    switch (source as ComicSource) {
      case 'bacaman':
        data = await fetchBacamanType(type as 'manga' | 'manhwa' | 'manhua');
        break;
      case 'softkomik':
        data = await fetchSoftkomikType(type as 'manga' | 'manhwa' | 'manhua', parseInt(page));
        break;
      case 'komikstation':
        data = await fetchKomikstationList(parseInt(page), type);
        break;
      default:
        return NextResponse.json({ error: 'Type filtering not available for this source' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching type data:', error);
    return NextResponse.json({ error: 'Failed to fetch type data' }, { status: 500 });
  }
}
