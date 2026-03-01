import { CacheKeys, CacheTTL, CachePatterns } from '@/lib/redis/cache-keys'

describe('Cache Keys', () => {
  describe('CacheKeys', () => {
    it('should generate correct listings page key', () => {
      expect(CacheKeys.listingsPage(1)).toBe('listings:all:page:1')
      expect(CacheKeys.listingsPage(5)).toBe('listings:all:page:5')
      expect(CacheKeys.listingsPage(100)).toBe('listings:all:page:100')
    })

    it('should generate correct listing detail key', () => {
      expect(CacheKeys.listingDetail('abc123')).toBe('listings:detail:abc123')
      expect(CacheKeys.listingDetail('xyz-789')).toBe('listings:detail:xyz-789')
    })

    it('should generate correct listings search key', () => {
      expect(CacheKeys.listingsSearch('hash123')).toBe('listings:search:hash123')
      expect(CacheKeys.listingsSearch('a7f3c2')).toBe('listings:search:a7f3c2')
    })

    it('should generate correct cache metrics keys', () => {
      expect(CacheKeys.cacheHits()).toBe('cache:metrics:hits')
      expect(CacheKeys.cacheMisses()).toBe('cache:metrics:misses')
    })
  })

  describe('CacheTTL', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.LISTINGS_PAGE).toBe(900) // 15 minutes
      expect(CacheTTL.LISTING_DETAIL).toBe(3600) // 1 hour
      expect(CacheTTL.LISTINGS_SEARCH).toBe(900) // 15 minutes
    })
  })

  describe('CachePatterns', () => {
    it('should have correct wildcard patterns', () => {
      expect(CachePatterns.ALL_LISTINGS).toBe('listings:*')
      expect(CachePatterns.ALL_LISTING_PAGES).toBe('listings:all:page:*')
      expect(CachePatterns.ALL_SEARCHES).toBe('listings:search:*')
    })
  })
})
