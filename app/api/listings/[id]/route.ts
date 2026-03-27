import { NextResponse } from 'next/server';
import { getListingDetail } from '@/lib/listings';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const detail = await getListingDetail(id, async (listingId) => {
      console.log(`[Source Fetch] Looking up listing ${listingId} in data source...`);
      return null;
    });

    if (!detail) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(detail, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch listing detail' }, { status: 500 });
  }
}
