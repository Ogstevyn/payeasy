import { NextResponse } from 'next/server'
import { getCacheMetrics, getRedisInfo } from '@/lib/redis'

/**
 * GET /api/cache/metrics
 * 
 * Returns cache hit rate metrics and Redis connection info
 * Useful for monitoring cache performance
 */
export async function GET() {
  try {
    const [metrics, info] = await Promise.all([
      getCacheMetrics(),
      getRedisInfo(),
    ])

    if (!metrics || !info) {
      return NextResponse.json(
        {
          error: 'Redis not configured',
          message: 'Cache metrics are unavailable. Please configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          hits: metrics.hits,
          misses: metrics.misses,
          total: metrics.hits + metrics.misses,
          hitRate: `${metrics.hitRate}%`,
        },
        redis: info,
      },
    })
  } catch (error) {
    console.error('Error fetching cache metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch cache metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
