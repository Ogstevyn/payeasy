/**
 * Integration tests for listings API caching
 * Tests cache behavior across API endpoints
 */

import { GET as searchListings } from '@/app/api/listings/search/route'
import { GET as getListingDetail } from '@/app/api/listings/[id]/route'
import { POST as createListing } from '@/app/api/listings/route'
import {
  getCachedSearch,
  getCachedListingDetail,
  invalidateListingsCache,
  createSearchHash,
} from '@/lib/redis'
import { NextRequest } from 'next/server'

// Mock Redis functions
jest.mock('@/lib/redis', () => ({
  getCachedSearch: jest.fn(),
  setCachedSearch: jest.fn(),
  getCachedListingDetail: jest.fn(),
  setCachedListingDetail: jest.fn(),
  invalidateListingsCache: jest.fn(),
  invalidateListingDetail: jest.fn(),
  createSearchHash: jest.fn(),
}))

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  getServerClient: jest.fn(() => null),
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id' } },
      })),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'new-listing-id', title: 'New Listing' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

describe('Listings API Caching Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Search Listings Caching', () => {
    it('should serve from cache on cache hit', async () => {
      const mockCachedData = {
        listings: [{ id: '1', title: 'Cached Listing' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }

      ;(getCachedSearch as jest.Mock).mockResolvedValue(mockCachedData)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      const response = await searchListings(request)
      const data = await response.json()

      expect(getCachedSearch).toHaveBeenCalledWith('test-hash')
      expect(data).toEqual(mockCachedData)
      expect(response.headers.get('X-Cache')).toBe('HIT')
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=900')
    })

    it('should query database on cache miss', async () => {
      ;(getCachedSearch as jest.Mock).mockResolvedValue(null)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      const response = await searchListings(request)

      expect(getCachedSearch).toHaveBeenCalledWith('test-hash')
      expect(response.headers.get('X-Cache')).toBe('MISS')
    })

    it('should cache search results after database query', async () => {
      const { setCachedSearch } = require('@/lib/redis')
      ;(getCachedSearch as jest.Mock).mockResolvedValue(null)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      await searchListings(request)

      expect(setCachedSearch).toHaveBeenCalled()
    })
  })

  describe('Listing Detail Caching', () => {
    it('should serve listing detail from cache on cache hit', async () => {
      const mockListing = {
        id: 'test-id',
        title: 'Cached Listing Detail',
        price: 1000,
      }

      ;(getCachedListingDetail as jest.Mock).mockResolvedValue(mockListing)

      const request = new Request('http://localhost:3000/api/listings/test-id')
      const response = await getListingDetail(request, {
        params: Promise.resolve({ id: 'test-id' }),
      })

      const data = await response.json()

      expect(getCachedListingDetail).toHaveBeenCalledWith('test-id')
      expect(data).toEqual(mockListing)
      expect(response.headers.get('X-Cache')).toBe('HIT')
    })

    it('should query database on cache miss', async () => {
      ;(getCachedListingDetail as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/listings/test-id')
      const response = await getListingDetail(request, {
        params: Promise.resolve({ id: 'test-id' }),
      })

      expect(getCachedListingDetail).toHaveBeenCalledWith('test-id')
      expect(response.headers.get('X-Cache')).toBe('MISS')
    })

    it('should cache listing detail after database query', async () => {
      const { setCachedListingDetail } = require('@/lib/redis')
      ;(getCachedListingDetail as jest.Mock).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/listings/test-id')
      await getListingDetail(request, {
        params: Promise.resolve({ id: 'test-id' }),
      })

      expect(setCachedListingDetail).toHaveBeenCalled()
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache when creating new listing', async () => {
      const request = new Request('http://localhost:3000/api/listings', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Listing',
          description: 'Test description',
          monthly_rent_xlm: 1000,
        }),
      })

      await createListing(request)

      expect(invalidateListingsCache).toHaveBeenCalled()
    })
  })

  describe('Cache Headers', () => {
    it('should include correct cache control headers on cache hit', async () => {
      const mockData = {
        listings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }

      ;(getCachedSearch as jest.Mock).mockResolvedValue(mockData)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      const response = await searchListings(request)

      expect(response.headers.get('Cache-Control')).toBe('public, max-age=900')
      expect(response.headers.get('X-Cache')).toBe('HIT')
    })

    it('should include correct cache control headers on cache miss', async () => {
      ;(getCachedSearch as jest.Mock).mockResolvedValue(null)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      const response = await searchListings(request)

      expect(response.headers.get('Cache-Control')).toBe('public, max-age=900')
      expect(response.headers.get('X-Cache')).toBe('MISS')
    })
  })

  describe('Edge Cases', () => {
    it('should handle Redis unavailable gracefully', async () => {
      ;(getCachedSearch as jest.Mock).mockResolvedValue(null)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      const response = await searchListings(request)

      expect(response.status).toBe(200)
    })

    it('should handle empty search results', async () => {
      const emptyResult = {
        listings: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }

      ;(getCachedSearch as jest.Mock).mockResolvedValue(emptyResult)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      const response = await searchListings(request)
      const data = await response.json()

      expect(data.listings).toEqual([])
      expect(data.total).toBe(0)
    })

    it('should cache empty results', async () => {
      const { setCachedSearch } = require('@/lib/redis')
      ;(getCachedSearch as jest.Mock).mockResolvedValue(null)
      ;(createSearchHash as jest.Mock).mockReturnValue('test-hash')

      const request = new NextRequest('http://localhost:3000/api/listings/search?page=1')
      await searchListings(request)

      expect(setCachedSearch).toHaveBeenCalled()
    })
  })
})
