import { redis } from '@/lib/cache/client'

const BLACKLIST_PREFIX = 'token:blacklist:'

/**
 * Add a JWT token to the blacklist.
 * The token will be auto-removed from Redis after `ttlSeconds` (matching the token's remaining lifetime).
 *
 * If Redis is not configured, this is a no-op — logout still clears cookies and state,
 * but the token remains valid until it naturally expires.
 */
export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
  if (!redis || ttlSeconds <= 0) return
  await redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', { ex: ttlSeconds })
}

/**
 * Check if a token has been blacklisted.
 * Returns `true` if the token is blacklisted and should be rejected.
 *
 * If Redis is not configured, always returns `false` (no blacklist enforcement).
 */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  if (!redis) return false
  const result = await redis.get(`${BLACKLIST_PREFIX}${jti}`)
  return result !== null
}
