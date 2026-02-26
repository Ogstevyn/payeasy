import { getRedisClient } from './client'
import { CacheKeys, CacheTTL } from './cache-keys'
import type { ListingSearchResult } from '@/lib/db/types'

/**
 * Cache service for listings data
 * Provides high-level caching operations with automatic TTL management
 */

/**
 * Get cached listings page
 */
export async function getCachedListingsPage(
  page: number
): Promise<ListingSearchResult | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    await incrementCacheMetric('misses') // Will be decremented if hit
    const key = CacheKeys.listingsPage(page)
    const cached = await redis.get<ListingSearchResult>(key)
    
    if (cached) {
      await incrementCacheMetric('hits')
      await decrementCacheMetric('misses')
    }
    
    return cached
  } catch (error) {
    console.error('Error getting cached listings page:', error)
    return null
  }
}

/**
 * Set cached listings page with TTL
 */
export async function setCachedListingsPage(
  page: number,
  data: ListingSearchResult
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const key = CacheKeys.listingsPage(page)
    await redis.setex(key, CacheTTL.LISTINGS_PAGE, JSON.stringify(data))
  } catch (error) {
    console.error('Error setting cached listings page:', error)
  }
}

/**
 * Get cached listing detail
 */
export async function getCachedListingDetail(id: string): Promise<any | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    await incrementCacheMetric('misses')
    const key = CacheKeys.listingDetail(id)
    const cached = await redis.get(key)
    
    if (cached) {
      await incrementCacheMetric('hits')
      await decrementCacheMetric('misses')
    }
    
    return cached
  } catch (error) {
    console.error('Error getting cached listing detail:', error)
    return null
  }
}

/**
 * Set cached listing detail with TTL
 */
export async function setCachedListingDetail(
  id: string,
  data: any
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const key = CacheKeys.listingDetail(id)
    await redis.setex(key, CacheTTL.LISTING_DETAIL, JSON.stringify(data))
  } catch (error) {
    console.error('Error setting cached listing detail:', error)
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearch(
  searchHash: string
): Promise<ListingSearchResult | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    await incrementCacheMetric('misses')
    const key = CacheKeys.listingsSearch(searchHash)
    const cached = await redis.get<ListingSearchResult>(key)
    
    if (cached) {
      await incrementCacheMetric('hits')
      await decrementCacheMetric('misses')
    }
    
    return cached
  } catch (error) {
    console.error('Error getting cached search:', error)
    return null
  }
}

/**
 * Set cached search results with TTL
 */
export async function setCachedSearch(
  searchHash: string,
  data: ListingSearchResult
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const key = CacheKeys.listingsSearch(searchHash)
    await redis.setex(key, CacheTTL.LISTINGS_SEARCH, JSON.stringify(data))
  } catch (error) {
    console.error('Error setting cached search:', error)
  }
}

/**
 * Invalidate all listings cache
 * Called on create, update, or delete operations
 */
export async function invalidateListingsCache(): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    // Delete all listing-related keys using pattern matching
    // Note: Upstash Redis supports SCAN for pattern-based deletion
    const patterns = [
      'listings:all:page:*',
      'listings:search:*',
    ]

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    }

    console.log('Listings cache invalidated')
  } catch (error) {
    console.error('Error invalidating listings cache:', error)
  }
}

/**
 * Invalidate specific listing detail cache
 */
export async function invalidateListingDetail(id: string): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const key = CacheKeys.listingDetail(id)
    await redis.del(key)
    console.log(`Listing detail cache invalidated for ID: ${id}`)
  } catch (error) {
    console.error('Error invalidating listing detail:', error)
  }
}

/**
 * Increment cache metric counter
 */
async function incrementCacheMetric(metric: 'hits' | 'misses'): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const key = metric === 'hits' ? CacheKeys.cacheHits() : CacheKeys.cacheMisses()
    await redis.incr(key)
  } catch (error) {
    console.error(`Error incrementing cache ${metric}:`, error)
  }
}

/**
 * Decrement cache metric counter
 */
async function decrementCacheMetric(metric: 'hits' | 'misses'): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const key = metric === 'hits' ? CacheKeys.cacheHits() : CacheKeys.cacheMisses()
    await redis.decr(key)
  } catch (error) {
    console.error(`Error decrementing cache ${metric}:`, error)
  }
}

/**
 * Get cache hit rate metrics
 */
export async function getCacheMetrics(): Promise<{
  hits: number
  misses: number
  hitRate: number
} | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const [hits, misses] = await Promise.all([
      redis.get<number>(CacheKeys.cacheHits()) || 0,
      redis.get<number>(CacheKeys.cacheMisses()) || 0,
    ])

    const total = (hits as number) + (misses as number)
    const hitRate = total > 0 ? ((hits as number) / total) * 100 : 0

    return {
      hits: hits as number,
      misses: misses as number,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  } catch (error) {
    console.error('Error getting cache metrics:', error)
    return null
  }
}

/**
 * Get Redis info for monitoring
 */
export async function getRedisInfo(): Promise<Record<string, any> | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    // Upstash Redis doesn't support INFO command directly
    // Instead, we'll return our custom metrics
    const metrics = await getCacheMetrics()
    
    return {
      status: 'connected',
      metrics,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error getting Redis info:', error)
    return null
  }
}

/**
 * Create a hash for search parameters to use as cache key
 */
export function createSearchHash(params: Record<string, any>): string {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(params).sort()
  const normalized = sortedKeys
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&')
  
  // Simple hash function (for production, consider using a proper hash library)
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}
