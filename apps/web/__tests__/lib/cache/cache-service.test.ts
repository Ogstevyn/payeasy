// Mock @upstash/redis before importing
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(),
}))

// Mock the Redis client
jest.mock('@/lib/redis/client')

import {
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
} from '@/lib/redis/cache-service'
import { getRedisClient } from '@/lib/redis/client'
import type { ListingSearchResult } from '@/lib/db/types'

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  incr: jest.fn(),
  decr: jest.fn(),
}

describe('Cache Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getRedisClient as jest.Mock).mockReturnValue(mockRedisClient)
  })

  describe('getCachedListingsPage', () => {
    it('should return null when Redis is not available', async () => {
      ;(getRedisClient as jest.Mock).mockReturnValue(null)

      const result = await getCachedListingsPage(1)
      expect(result).toBeNull()
    })

    it('should return cached data on cache hit', async () => {
      const mockData: ListingSearchResult = {
        listings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }

      mockRedisClient.get.mockResolvedValue(mockData)

      const result = await getCachedListingsPage(1)
      expect(result).toEqual(mockData)
      expect(mockRedisClient.get).toHaveBeenCalledWith('listings:all:page:1')
    })

    it('should return null on cache miss', async () => {
      mockRedisClient.get.mockResolvedValue(null)

      const result = await getCachedListingsPage(1)
      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'))

      const result = await getCachedListingsPage(1)
      expect(result).toBeNull()
    })
  })

  describe('setCachedListingsPage', () => {
    it('should not throw when Redis is not available', async () => {
      ;(getRedisClient as jest.Mock).mockReturnValue(null)

      await expect(
        setCachedListingsPage(1, {
          listings: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        })
      ).resolves.not.toThrow()
    })

    it('should set cache with correct TTL', async () => {
      const mockData: ListingSearchResult = {
        listings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }

      await setCachedListingsPage(1, mockData)

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'listings:all:page:1',
        900, // 15 minutes TTL
        JSON.stringify(mockData)
      )
    })

    it('should handle errors gracefully', async () => {
      mockRedisClient.setex.mockRejectedValue(new Error('Redis error'))

      await expect(
        setCachedListingsPage(1, {
          listings: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        })
      ).resolves.not.toThrow()
    })
  })

  describe('getCachedListingDetail', () => {
    it('should return cached listing detail', async () => {
      const mockListing = { id: 'abc123', title: 'Test Listing' }
      mockRedisClient.get.mockResolvedValue(mockListing)

      const result = await getCachedListingDetail('abc123')
      expect(result).toEqual(mockListing)
      expect(mockRedisClient.get).toHaveBeenCalledWith('listings:detail:abc123')
    })

    it('should return null on cache miss', async () => {
      mockRedisClient.get.mockResolvedValue(null)

      const result = await getCachedListingDetail('abc123')
      expect(result).toBeNull()
    })
  })

  describe('setCachedListingDetail', () => {
    it('should set listing detail with correct TTL', async () => {
      const mockListing = { id: 'abc123', title: 'Test Listing' }

      await setCachedListingDetail('abc123', mockListing)

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'listings:detail:abc123',
        3600, // 1 hour TTL
        JSON.stringify(mockListing)
      )
    })
  })

  describe('getCachedSearch', () => {
    it('should return cached search results', async () => {
      const mockResults: ListingSearchResult = {
        listings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
      mockRedisClient.get.mockResolvedValue(mockResults)

      const result = await getCachedSearch('hash123')
      expect(result).toEqual(mockResults)
      expect(mockRedisClient.get).toHaveBeenCalledWith('listings:search:hash123')
    })
  })

  describe('setCachedSearch', () => {
    it('should set search results with correct TTL', async () => {
      const mockResults: ListingSearchResult = {
        listings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }

      await setCachedSearch('hash123', mockResults)

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'listings:search:hash123',
        900, // 15 minutes TTL
        JSON.stringify(mockResults)
      )
    })
  })

  describe('invalidateListingsCache', () => {
    it('should delete all listing-related keys', async () => {
      mockRedisClient.keys
        .mockResolvedValueOnce(['listings:all:page:1', 'listings:all:page:2'])
        .mockResolvedValueOnce(['listings:search:abc', 'listings:search:xyz'])

      await invalidateListingsCache()

      expect(mockRedisClient.keys).toHaveBeenCalledWith('listings:all:page:*')
      expect(mockRedisClient.keys).toHaveBeenCalledWith('listings:search:*')
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        'listings:all:page:1',
        'listings:all:page:2'
      )
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        'listings:search:abc',
        'listings:search:xyz'
      )
    })

    it('should handle empty key sets', async () => {
      mockRedisClient.keys.mockResolvedValue([])

      await invalidateListingsCache()

      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis error'))

      await expect(invalidateListingsCache()).resolves.not.toThrow()
    })
  })

  describe('invalidateListingDetail', () => {
    it('should delete specific listing detail', async () => {
      await invalidateListingDetail('abc123')

      expect(mockRedisClient.del).toHaveBeenCalledWith('listings:detail:abc123')
    })

    it('should handle errors gracefully', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Redis error'))

      await expect(invalidateListingDetail('abc123')).resolves.not.toThrow()
    })
  })

  describe('getCacheMetrics', () => {
    it('should return cache metrics with hit rate', async () => {
      mockRedisClient.get
        .mockResolvedValueOnce(850) // hits
        .mockResolvedValueOnce(150) // misses

      const metrics = await getCacheMetrics()

      expect(metrics).toEqual({
        hits: 850,
        misses: 150,
        hitRate: 85,
      })
    })

    it('should handle zero total requests', async () => {
      mockRedisClient.get
        .mockResolvedValueOnce(0) // hits
        .mockResolvedValueOnce(0) // misses

      const metrics = await getCacheMetrics()

      expect(metrics).toEqual({
        hits: 0,
        misses: 0,
        hitRate: 0,
      })
    })

    it('should return null when Redis is not available', async () => {
      ;(getRedisClient as jest.Mock).mockReturnValue(null)

      const metrics = await getCacheMetrics()
      expect(metrics).toBeNull()
    })
  })

  describe('getRedisInfo', () => {
    it('should return Redis info with metrics', async () => {
      mockRedisClient.get
        .mockResolvedValueOnce(100) // hits
        .mockResolvedValueOnce(20) // misses

      const info = await getRedisInfo()

      expect(info).toHaveProperty('status', 'connected')
      expect(info).toHaveProperty('metrics')
      expect(info).toHaveProperty('timestamp')
      expect(info?.metrics).toEqual({
        hits: 100,
        misses: 20,
        hitRate: 83.33,
      })
    })

    it('should return null when Redis is not available', async () => {
      ;(getRedisClient as jest.Mock).mockReturnValue(null)

      const info = await getRedisInfo()
      expect(info).toBeNull()
    })
  })

  describe('createSearchHash', () => {
    it('should create consistent hash for same parameters', () => {
      const params1 = { page: 1, limit: 20, search: 'test' }
      const params2 = { page: 1, limit: 20, search: 'test' }

      const hash1 = createSearchHash(params1)
      const hash2 = createSearchHash(params2)

      expect(hash1).toBe(hash2)
    })

    it('should create different hash for different parameters', () => {
      const params1 = { page: 1, limit: 20, search: 'test' }
      const params2 = { page: 2, limit: 20, search: 'test' }

      const hash1 = createSearchHash(params1)
      const hash2 = createSearchHash(params2)

      expect(hash1).not.toBe(hash2)
    })

    it('should create same hash regardless of parameter order', () => {
      const params1 = { page: 1, limit: 20, search: 'test' }
      const params2 = { search: 'test', limit: 20, page: 1 }

      const hash1 = createSearchHash(params1)
      const hash2 = createSearchHash(params2)

      expect(hash1).toBe(hash2)
    })

    it('should handle empty parameters', () => {
      const hash = createSearchHash({})
      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
    })

    it('should handle complex nested parameters', () => {
      const params = {
        page: 1,
        filters: { bedrooms: 2, bathrooms: 1 },
        amenities: ['wifi', 'parking'],
      }

      const hash = createSearchHash(params)
      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
    })
  })

  describe('Edge Cases', () => {
    it('should handle simultaneous cache invalidation and read', async () => {
      // Simulate race condition
      const readPromise = getCachedListingsPage(1)
      const invalidatePromise = invalidateListingsCache()

      await Promise.all([readPromise, invalidatePromise])

      // Should not throw errors
      expect(true).toBe(true)
    })

    it('should handle malformed cache keys', async () => {
      mockRedisClient.get.mockResolvedValue(null)

      const result = await getCachedListingDetail('')
      expect(result).toBeNull()
    })

    it('should handle cold start (empty cache)', async () => {
      mockRedisClient.get.mockResolvedValue(null)
      mockRedisClient.keys.mockResolvedValue([])

      const result = await getCachedListingsPage(1)
      expect(result).toBeNull()

      await invalidateListingsCache()
      expect(mockRedisClient.del).not.toHaveBeenCalled()
    })
  })
})
