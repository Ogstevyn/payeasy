/**
 * Tests for cache metrics API endpoint
 */

import { GET } from '@/app/api/cache/metrics/route'
import { getCacheMetrics, getRedisInfo } from '@/lib/redis'

jest.mock('@/lib/redis', () => ({
  getCacheMetrics: jest.fn(),
  getRedisInfo: jest.fn(),
}))

describe('Cache Metrics API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return cache metrics when Redis is available', async () => {
    const mockMetrics = {
      hits: 850,
      misses: 150,
      hitRate: 85,
    }

    const mockInfo = {
      status: 'connected',
      metrics: mockMetrics,
      timestamp: '2026-02-26T10:00:00.000Z',
    }

    ;(getCacheMetrics as jest.Mock).mockResolvedValue(mockMetrics)
    ;(getRedisInfo as jest.Mock).mockResolvedValue(mockInfo)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.metrics).toEqual({
      hits: 850,
      misses: 150,
      total: 1000,
      hitRate: '85%',
    })
    expect(data.data.redis).toEqual(mockInfo)
  })

  it('should return 503 when Redis is not configured', async () => {
    ;(getCacheMetrics as jest.Mock).mockResolvedValue(null)
    ;(getRedisInfo as jest.Mock).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('Redis not configured')
    expect(data.message).toContain('Cache metrics are unavailable')
  })

  it('should return 500 on error', async () => {
    ;(getCacheMetrics as jest.Mock).mockRejectedValue(new Error('Redis connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch cache metrics')
    expect(data.message).toBe('Redis connection failed')
  })

  it('should calculate total requests correctly', async () => {
    const mockMetrics = {
      hits: 750,
      misses: 250,
      hitRate: 75,
    }

    const mockInfo = {
      status: 'connected',
      metrics: mockMetrics,
      timestamp: '2026-02-26T10:00:00.000Z',
    }

    ;(getCacheMetrics as jest.Mock).mockResolvedValue(mockMetrics)
    ;(getRedisInfo as jest.Mock).mockResolvedValue(mockInfo)

    const response = await GET()
    const data = await response.json()

    expect(data.data.metrics.total).toBe(1000)
    expect(data.data.metrics.hitRate).toBe('75%')
  })

  it('should handle zero metrics', async () => {
    const mockMetrics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
    }

    const mockInfo = {
      status: 'connected',
      metrics: mockMetrics,
      timestamp: '2026-02-26T10:00:00.000Z',
    }

    ;(getCacheMetrics as jest.Mock).mockResolvedValue(mockMetrics)
    ;(getRedisInfo as jest.Mock).mockResolvedValue(mockInfo)

    const response = await GET()
    const data = await response.json()

    expect(data.data.metrics.total).toBe(0)
    expect(data.data.metrics.hitRate).toBe('0%')
  })
})
