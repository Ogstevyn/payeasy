# Redis Caching Strategy for PayEasy Listings

## Overview

This document describes the Redis caching implementation for the PayEasy application, designed to optimize listings query performance and reduce database load.

## Technology Stack

- **Redis Provider**: Upstash Redis (serverless)
- **Client Library**: `@upstash/redis` v1.36.2
- **Architecture**: Edge-compatible, serverless-first design

## Cache Configuration

### Environment Variables

Required environment variables for Redis connection:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### TTL (Time To Live) Rules

| Cache Type | TTL | Rationale |
|------------|-----|-----------|
| Active listings list | 15 minutes (900s) | Balances freshness with performance; listings don't change frequently |
| Individual listing details | 1 hour (3600s) | Longer TTL for detailed views; reduces DB load for popular listings |
| Search results | 15 minutes (900s) | Same as listings list; search results should stay relatively fresh |

## Cache Key Patterns

### Naming Conventions

All cache keys follow a consistent pattern using colons (`:`) as separators:

```
{namespace}:{type}:{identifier}
```

### Key Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| `listings:all:page:{pageNumber}` | `listings:all:page:1` | Paginated listings |
| `listings:detail:{listingId}` | `listings:detail:abc123` | Individual listing |
| `listings:search:{hash}` | `listings:search:a7f3c2` | Search results |
| `cache:metrics:hits` | `cache:metrics:hits` | Cache hit counter |
| `cache:metrics:misses` | `cache:metrics:misses` | Cache miss counter |

### Wildcard Patterns (for invalidation)

- `listings:*` - All listings-related keys
- `listings:all:page:*` - All paginated listing pages
- `listings:search:*` - All search results

## Cache Invalidation Strategy

### Trigger Events

Cache invalidation occurs on the following operations:

1. **Listing Creation** (`POST /api/listings`)
   - Invalidates: All listing pages and search results
   - Reason: New listing should appear in browse/search results

2. **Listing Update** (`PUT /api/listings/[id]`)
   - Invalidates: Specific listing detail + all listing pages and search results
   - Reason: Updated data must be reflected everywhere

3. **Listing Deletion** (`DELETE /api/listings/[id]`)
   - Invalidates: Specific listing detail + all listing pages and search results
   - Reason: Deleted listing should disappear from all views

### Invalidation Implementation

```typescript
// On create/update/delete
await invalidateListingsCache() // Clears all listing pages and searches
await invalidateListingDetail(listingId) // Clears specific listing (update/delete only)
```

## Cache Headers

All cached responses include appropriate HTTP cache headers:

```http
Cache-Control: public, max-age=900
X-Cache: HIT|MISS
```

- `Cache-Control`: Instructs CDN/browser caching behavior
- `X-Cache`: Indicates whether response came from Redis cache

## Monitoring & Observability

### Cache Metrics Endpoint

**Endpoint**: `GET /api/cache/metrics`

**Response**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "hits": 1250,
      "misses": 180,
      "total": 1430,
      "hitRate": "87.41%"
    },
    "redis": {
      "status": "connected",
      "timestamp": "2026-02-26T10:30:00.000Z"
    }
  }
}
```

### Logging

Cache operations are logged for debugging:

```
Cache HIT for search: a7f3c2
Cache MISS for listing: abc123
Listings cache invalidated
```

### Metrics Tracking

The system automatically tracks:
- **Cache Hits**: Successful cache retrievals
- **Cache Misses**: Cache lookups that required DB query
- **Hit Rate**: Percentage of requests served from cache

## Performance Benefits

### Expected Improvements

1. **Reduced Database Load**: 70-90% reduction in listing queries
2. **Faster Response Times**: 
   - Cache hit: ~50-100ms
   - Database query: ~300-800ms
3. **Better Scalability**: Handle more concurrent users without DB bottleneck
4. **Cost Savings**: Fewer database operations = lower infrastructure costs

### Cache Hit Rate Targets

- **Target**: ≥80% hit rate for listing pages
- **Acceptable**: ≥70% hit rate for search results
- **Monitor**: If hit rate drops below 60%, investigate invalidation frequency

## Implementation Details

### Module Structure

```
lib/redis/
├── client.ts          # Redis client initialization
├── cache-keys.ts      # Key patterns and TTL constants
├── cache-service.ts   # High-level caching operations
└── index.ts           # Public API exports
```

### Usage Examples

#### Caching a Search Result

```typescript
import { getCachedSearch, setCachedSearch, createSearchHash } from '@/lib/redis'

// Check cache
const searchHash = createSearchHash(params)
const cached = await getCachedSearch(searchHash)

if (cached) {
  return cached // Cache hit
}

// Query database
const result = await queryDatabase(params)

// Store in cache
await setCachedSearch(searchHash, result)

return result
```

#### Invalidating Cache on Update

```typescript
import { invalidateListingDetail, invalidateListingsCache } from '@/lib/redis'

// After updating listing
await invalidateListingDetail(listingId)
await invalidateListingsCache()
```

## Edge Cases & Considerations

### 1. Redis Unavailable

If Redis is not configured or unavailable:
- Application continues to work normally
- All requests go directly to database
- No errors thrown; graceful degradation

### 2. Cache Stampede Prevention

When cache expires and multiple requests arrive simultaneously:
- Current implementation: All requests query DB (acceptable for current scale)
- Future improvement: Implement request coalescing or lock mechanism

### 3. Stale Data

TTL ensures data freshness, but there's a window where cached data may be stale:
- Mitigated by: Short TTLs (15 min - 1 hour)
- Mitigated by: Proactive invalidation on mutations

### 4. Memory Management

Upstash Redis automatically manages memory:
- Eviction policy: LRU (Least Recently Used)
- No manual cleanup required
- Monitor usage via Upstash dashboard

## Testing Strategy

### Test Coverage

Tests cover the following scenarios:

1. **Cache Population**: First request populates cache
2. **Cache Retrieval**: Subsequent requests served from cache
3. **TTL Expiry**: Expired cache triggers fresh DB fetch
4. **Invalidation**: Mutations correctly clear cache
5. **Metrics**: Hit rate tracking works correctly
6. **Edge Cases**: 
   - Cold start (empty cache)
   - Simultaneous invalidation and read
   - Missing/malformed cache keys
   - Redis unavailable

### Running Tests

```bash
npm test -- __tests__/lib/cache
```

## Maintenance & Operations

### Monitoring Checklist

- [ ] Check cache hit rate weekly (target: ≥80%)
- [ ] Monitor Redis memory usage in Upstash dashboard
- [ ] Review cache invalidation logs for anomalies
- [ ] Verify TTL settings align with business requirements

### Troubleshooting

**Problem**: Low cache hit rate (<60%)

- Check: Are invalidations too frequent?
- Check: Are TTLs too short?
- Check: Is traffic pattern unusual (many unique searches)?

**Problem**: Stale data appearing

- Check: Is cache invalidation working on mutations?
- Check: Are TTLs too long?
- Solution: Manually clear cache via Redis CLI if needed

**Problem**: Redis connection errors

- Check: Environment variables configured correctly
- Check: Upstash Redis instance is active
- Check: Network connectivity to Upstash

## Future Enhancements

### Potential Improvements

1. **Request Coalescing**: Prevent cache stampede on popular listings
2. **Partial Cache Updates**: Update specific fields without full invalidation
3. **Predictive Prefetching**: Pre-warm cache for popular searches
4. **Geo-distributed Caching**: Use Upstash global replication
5. **Cache Warming**: Background job to populate cache during off-peak hours

### Metrics Dashboard

Consider building a dashboard to visualize:
- Real-time hit rate
- Cache size and memory usage
- Most frequently cached keys
- Invalidation frequency

## References

- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [HTTP Caching Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

## Support

For questions or issues related to caching:
1. Check this documentation
2. Review cache metrics at `/api/cache/metrics`
3. Check application logs for cache-related errors
4. Contact the backend team

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0  
**Maintained By**: PayEasy Backend Team
