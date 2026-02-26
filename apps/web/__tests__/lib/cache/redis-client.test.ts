// Mock @upstash/redis before importing
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    incr: jest.fn(),
    decr: jest.fn(),
  })),
}))

import { getRedisClient, isRedisAvailable } from '@/lib/redis/client'

describe('Redis Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('isRedisAvailable', () => {
    it('should return true when Redis credentials are configured', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

      expect(isRedisAvailable()).toBe(true)
    })

    it('should return false when URL is missing', () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

      expect(isRedisAvailable()).toBe(false)
    })

    it('should return false when token is missing', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
      delete process.env.UPSTASH_REDIS_REST_TOKEN

      expect(isRedisAvailable()).toBe(false)
    })

    it('should return false when both are missing', () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN

      expect(isRedisAvailable()).toBe(false)
    })
  })

  describe('getRedisClient', () => {
    it('should return null when credentials are not configured', () => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN

      const client = getRedisClient()
      expect(client).toBeNull()
    })

    it('should return Redis client when credentials are configured', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

      const client = getRedisClient()
      expect(client).not.toBeNull()
      expect(client).toHaveProperty('get')
      expect(client).toHaveProperty('set')
      expect(client).toHaveProperty('del')
    })

    it('should return the same client instance on subsequent calls (singleton)', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'

      const client1 = getRedisClient()
      const client2 = getRedisClient()

      expect(client1).toBe(client2)
    })
  })
})
