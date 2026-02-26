/**
 * Redis caching module
 * 
 * Provides a complete caching layer for the PayEasy application using Upstash Redis.
 * 
 * @module redis
 */

export { getRedisClient, isRedisAvailable } from './client'
export { CacheKeys, CacheTTL, CachePatterns } from './cache-keys'
export {
  getCachedListingsPage,
  setCachedListingsPage,
  getCachedListingDetail,
  setCachedListingDetail,
  getCachedSearch,
  setCachedSearch,
  invalidateListingsCache,
  invalidateListingDetail,
  getCacheMetrics,
  getRedisInfo,
  createSearchHash,
} from './cache-service'
