/**
 * Cache key patterns for consistent naming across the application
 * 
 * Key naming conventions:
 * - Use colons (:) to separate namespaces
 * - Use descriptive prefixes (listings, users, etc.)
 * - Include relevant identifiers (id, page number, etc.)
 * - Keep keys readable and predictable
 */

export const CacheKeys = {
  /**
   * List of all listings with pagination
   * Pattern: listings:all:page:{pageNumber}
   * TTL: 15 minutes (900 seconds)
   */
  listingsPage: (page: number) => `listings:all:page:${page}`,

  /**
   * Individual listing details
   * Pattern: listings:detail:{listingId}
   * TTL: 1 hour (3600 seconds)
   */
  listingDetail: (id: string) => `listings:detail:${id}`,

  /**
   * Listings search results with filters
   * Pattern: listings:search:{hash}
   * TTL: 15 minutes (900 seconds)
   */
  listingsSearch: (searchHash: string) => `listings:search:${searchHash}`,

  /**
   * Cache hit rate metrics
   * Pattern: cache:metrics:hits
   * Pattern: cache:metrics:misses
   */
  cacheHits: () => 'cache:metrics:hits',
  cacheMisses: () => 'cache:metrics:misses',
} as const

/**
 * TTL (Time To Live) values in seconds
 */
export const CacheTTL = {
  /** Active listings list - 15 minutes */
  LISTINGS_PAGE: 900,
  
  /** Individual listing details - 1 hour */
  LISTING_DETAIL: 3600,
  
  /** Search results - 15 minutes */
  LISTINGS_SEARCH: 900,
} as const

/**
 * Cache invalidation patterns
 * Used with Redis SCAN or pattern matching for bulk invalidation
 */
export const CachePatterns = {
  /** All listings-related cache keys */
  ALL_LISTINGS: 'listings:*',
  
  /** All paginated listing pages */
  ALL_LISTING_PAGES: 'listings:all:page:*',
  
  /** All search results */
  ALL_SEARCHES: 'listings:search:*',
} as const
