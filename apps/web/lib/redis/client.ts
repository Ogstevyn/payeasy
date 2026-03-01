import { Redis } from '@upstash/redis'

/**
 * Upstash Redis client for serverless caching
 * 
 * Environment variables required:
 * - UPSTASH_REDIS_REST_URL: Your Upstash Redis REST URL
 * - UPSTASH_REDIS_REST_TOKEN: Your Upstash Redis REST token
 */

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn('Redis credentials not configured. Caching will be disabled.')
    return null
  }

  redis = new Redis({
    url,
    token,
  })

  return redis
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
