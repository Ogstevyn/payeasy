# Redis Caching Layer

This module provides a complete Redis caching implementation for the PayEasy application using Upstash Redis.

## Quick Start

### 1. Configuration

Add these environment variables to your `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 2. Usage

```typescript
import {
  getCachedListingsPage,
  setCachedListingsPage,
  invalidateListingsCache,
} from '@/lib/redis'

// Check cache
const cached = await getCachedListingsPage(1)
if (cached) {
  return cached // Cache hit
}

// Query database
const data = await queryDatabase()

// Store in cache
await setCachedListingsPage(1, data)

// Invalidate on mutation
await invalidateListingsCache()
```

## Module Structure

```
lib/redis/
├── client.ts          # Redis client initialization
├── cache-keys.ts      # Key patterns and TTL constants
├── cache-service.ts   # High-level caching operations
├── index.ts           # Public API exports
└── README.md          # This file
```

## API Reference

### Cache Operations

#### `getCachedListingsPage(page: number)`
Get cached listings page. Returns `null` on cache miss.

#### `setCachedListingsPage(page: number, data: ListingSearchResult)`
Cache listings page with 15-minute TTL.

#### `getCachedListingDetail(id: string)`
Get cached listing detail. Returns `null` on cache miss.

#### `setCachedListingDetail(id: string, data: any)`
Cache listing detail with 1-hour TTL.

#### `getCachedSearch(searchHash: string)`
Get cached search results. Returns `null` on cache miss.

#### `setCachedSearch(searchHash: string, data: ListingSearchResult)`
Cache search results with 15-minute TTL.

### Invalidation

#### `invalidateListingsCache()`
Clear all listing pages and search results. Call after create/update/delete.

#### `invalidateListingDetail(id: string)`
Clear specific listing detail cache. Call after update/delete.

### Monitoring

#### `getCacheMetrics()`
Get cache hit/miss statistics and hit rate percentage.

#### `getRedisInfo()`
Get Redis connection status and metrics.

### Utilities

#### `createSearchHash(params: Record<string, any>)`
Create consistent hash for search parameters.

#### `isRedisAvailable()`
Check if Redis credentials are configured.

#### `getRedisClient()`
Get Redis client instance (or `null` if not configured).

## Cache Keys

All keys follow the pattern: `{namespace}:{type}:{identifier}`

- `listings:all:page:{pageNumber}` - Paginated listings
- `listings:detail:{listingId}` - Individual listing
- `listings:search:{hash}` - Search results
- `cache:metrics:hits` - Cache hit counter
- `cache:metrics:misses` - Cache miss counter

## TTL Values

- Listings pages: 15 minutes (900s)
- Listing details: 1 hour (3600s)
- Search results: 15 minutes (900s)

## Error Handling

All cache operations fail gracefully:
- If Redis is unavailable, operations return `null` or do nothing
- Errors are logged but don't throw exceptions
- Application continues to work without caching

## Testing

```bash
# Run cache tests
npm test -- __tests__/lib/cache

# Run with coverage
npm test -- __tests__/lib/cache --coverage
```

## Monitoring

Check cache performance:

```bash
curl http://localhost:3000/api/cache/metrics
```

Response:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "hits": 850,
      "misses": 150,
      "total": 1000,
      "hitRate": "85%"
    },
    "redis": {
      "status": "connected",
      "timestamp": "2026-02-26T10:00:00.000Z"
    }
  }
}
```

## Best Practices

1. **Always check cache first** before querying database
2. **Always invalidate** after mutations (create/update/delete)
3. **Monitor hit rate** - target ≥80% for optimal performance
4. **Use consistent hashing** for search parameters
5. **Handle null gracefully** - cache miss is normal

## Troubleshooting

### Low hit rate (<60%)

- Check if invalidations are too frequent
- Verify TTLs aren't too short
- Review traffic patterns

### Stale data

- Verify cache invalidation on mutations
- Check TTL values
- Manually clear cache if needed

### Connection errors

- Verify environment variables
- Check Upstash Redis instance status
- Test network connectivity

## Learn More

- [Full Documentation](../../docs/CACHING_STRATEGY.md)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
