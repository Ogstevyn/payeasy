import { NextResponse } from 'next/server';
import { getListings, invalidateListingsCache } from '@/lib/listings';
import { Listing } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const listings = await getListings(page, async () => {
      console.log('[Source Fetch] Fetching listings from data source...');
      return [];
    });

    return NextResponse.json(listings, {
      headers: {
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Listing = await request.json();
    await invalidateListingsCache();
    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
