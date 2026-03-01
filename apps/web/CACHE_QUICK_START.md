# Redis Caching - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Create Upstash Redis Instance

1. Go to https://upstash.com
2. Sign up or log in
3. Click "Create Database"
4. Choose a region close to your deployment
5. Copy the REST URL and token

### 2. Configure Environment

Add to `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. Install Dependencies

Already installed! ✅
```bash
@upstash/redis: ^1.36.2
```

### 4. Verify Installation

```bash
# Run tests
npm test -- __tests__/lib/cache

# Check metrics endpoint (after starting dev server)
curl http://localhost:3000/api/cache/metrics
```

## 📊 Monitor Performance

### Check Cache Metrics

```bash
curl http://localhost:3000/api/cache/metrics | jq
```

Expected response:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "hits": 850,
      "misses": 150,
      "total": 1000,
      "hitRate": "85%"
    }
  }
}
```

### Target Metrics

- **Hit Rate**: ≥80% (good), ≥90% (excellent)
- **Response Time**: <100ms for cache hits
- **Database Load**: 70-90% reduction

## 🔍 Verify Caching Works

### Test Cache Hit

```bash
# First request (cache miss)
curl -i http://localhost:3000/api/listings/search?page=1
# Look for: X-Cache: MISS

# Second request (cache hit)
curl -i http://localhost:3000/api/listings/search?page=1
# Look for: X-Cache: HIT
```

### Test Cache Invalidation

```bash
# 1. Request listing (cache miss)
curl http://localhost:3000/api/listings/search?page=1

# 2. Request again (cache hit)
curl http://localhost:3000/api/listings/search?page=1

# 3. Create new listing (invalidates cache)
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","monthly_rent_xlm":1000}'

# 4. Request again (cache miss - cache was invalidated)
curl http://localhost:3000/api/listings/search?page=1
```

## 📚 Key Files

```
lib/redis/
├── client.ts          # Redis client setup
├── cache-service.ts   # Cache operations
├── cache-keys.ts      # Key patterns & TTLs
└── README.md          # Full API reference

docs/
├── CACHING_STRATEGY.md              # Complete strategy guide
├── CACHE_TESTING.md                 # Testing documentation
└── CACHE_IMPLEMENTATION_SUMMARY.md  # Implementation details
```

## 🎯 Common Tasks

### Add Caching to New Endpoint

```typescript
import { getCachedSearch, setCachedSearch, createSearchHash } from '@/lib/redis'

export async function GET(request: NextRequest) {
  // 1. Create cache key
  const params = parseParams(request)
  const cacheKey = createSearchHash(params)
  
  // 2. Check cache
  const cached = await getCachedSearch(cacheKey)
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, max-age=900',
        'X-Cache': 'HIT',
      },
    })
  }
  
  // 3. Query database
  const data = await queryDatabase(params)
  
  // 4. Store in cache
  await setCachedSearch(cacheKey, data)
  
  // 5. Return with headers
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=900',
      'X-Cache': 'MISS',
    },
  })
}
```

### Invalidate Cache on Mutation

```typescript
import { invalidateListingsCache, invalidateListingDetail } from '@/lib/redis'

export async function PUT(request: Request, { params }) {
  const { id } = await params
  
  // Update database
  await updateListing(id, data)
  
  // Invalidate cache
  await invalidateListingDetail(id)
  await invalidateListingsCache()
  
  return NextResponse.json({ success: true })
}
```

## 🐛 Troubleshooting

### Cache Not Working

**Check environment variables:**
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

**Check Redis connection:**
```bash
curl http://localhost:3000/api/cache/metrics
```

### Low Hit Rate

**Check metrics:**
```bash
curl http://localhost:3000/api/cache/metrics | jq '.data.metrics'
```

**Common causes:**
- Too many unique searches (expected)
- Invalidations too frequent (check logs)
- TTLs too short (review cache-keys.ts)

### Stale Data

**Manual cache clear:**
```typescript
import { invalidateListingsCache } from '@/lib/redis'
await invalidateListingsCache()
```

**Check invalidation logs:**
```bash
# Look for: "Listings cache invalidated"
# Look for: "Listing detail cache invalidated for ID: xxx"
```

## 📖 Learn More

- **Full Documentation**: `docs/CACHING_STRATEGY.md`
- **API Reference**: `lib/redis/README.md`
- **Testing Guide**: `docs/CACHE_TESTING.md`
- **Implementation Details**: `docs/CACHE_IMPLEMENTATION_SUMMARY.md`

## ✅ Checklist

- [ ] Upstash Redis instance created
- [ ] Environment variables configured
- [ ] Tests passing (`npm test -- __tests__/lib/cache`)
- [ ] Metrics endpoint accessible
- [ ] Cache hit/miss headers visible
- [ ] Cache invalidation working
- [ ] Hit rate ≥80%

## 🎉 Success!

Your Redis caching layer is now active and optimizing listings performance!

**Next Steps:**
1. Monitor cache metrics regularly
2. Adjust TTLs based on usage patterns
3. Review hit rate weekly
4. Consider adding caching to other endpoints

---

**Need Help?** Check the full documentation in the `docs/` folder or contact the backend team.
