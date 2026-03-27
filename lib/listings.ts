import redis from './redis';
import { Listing } from './types';

export async function getListings(
  page: number = 1,
  fetchSource: () => Promise<Listing[]>
): Promise<Listing[]> {
  const cacheKey = `listings:all:page:${page}`;

  try {
    const cachedData = await redis.get<Listing[]>(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Listings - Page ${page}`);
      return cachedData;
    }
  } catch (error) {
    console.warn(`[Cache Error] Failed to fetch from Redis: ${error}`);
  }

  const listings = await fetchSource();

  try {
    await redis.set(cacheKey, JSON.stringify(listings), { ex: 900 });
    console.log(`[Cache Miss] Listings - Page ${page} cached.`);
  } catch (error) {
    console.warn(`[Cache Error] Failed to store in Redis: ${error}`);
  }

  return listings;
}

export async function getListingDetail(
  id: string,
  fetchSource: (id: string) => Promise<Listing | null>
): Promise<Listing | null> {
  const cacheKey = `listings:detail:${id}`;

  try {
    const cachedDetail = await redis.get<Listing>(cacheKey);
    if (cachedDetail) {
      console.log(`[Cache Hit] Listing Details - ID ${id}`);
      return cachedDetail;
    }
  } catch (error) {
    console.warn(`[Cache Error] Failed to fetch from Redis: ${error}`);
  }

  const detail = await fetchSource(id);

  if (detail) {
    try {
      await redis.set(cacheKey, JSON.stringify(detail), { ex: 3600 });
      console.log(`[Cache Miss] Listing Details - ID ${id} cached.`);
    } catch (error) {
      console.warn(`[Cache Error] Failed to store in Redis: ${error}`);
    }
  }

  return detail;
}

export async function invalidateListingsCache() {
  try {
    await redis.del('listings:all:page:1');
    console.log('[Cache Invalidation] Cleared Listings list cache.');
  } catch (error) {
    console.error(`[Cache Error] Invalidation failed: ${error}`);
  }
}
