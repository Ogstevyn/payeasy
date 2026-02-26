# Empty & Error States - Quick Reference

Fast lookup guide for empty and error state components.

## 🎯 Quick Start (2 minutes)

### Basic Empty State

```tsx
import { EmptyState } from '@/components/EmptyState'
import { Package } from 'lucide-react'

<EmptyState
  icon={Package}
  title="No items"
  description="Create your first item to get started"
  actions={[
    { label: 'Create', onClick: () => {}, variant: 'primary' }
  ]}
/>
```

### Search No Results

```tsx
import { NoResults } from '@/components/NoResults'

<NoResults
  query={searchTerm}
  onClear={handleClear}
/>
```

### 404 Page

```tsx
import { NotFound } from '@/components/NotFound'

<NotFound showHomeButton showSupportButton />
```

### 500 Error

```tsx
import { ServerError } from '@/components/ServerError'

<ServerError
  onRetry={() => location.reload()}
  showRetryButton
  showHomeButton
/>
```

### Network Error

```tsx
import { NetworkError } from '@/components/NetworkError'

<NetworkError autoDetect onRetry={handleRetry} />
```

### Error Boundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 📦 Component Reference

### EmptyState

**Import:** `import { EmptyState } from '@/components'`

**Essential Props:**
| Prop | Type | Required |
|------|------|----------|
| title | string | ✅ |
| icon | LucideIcon | ❌ |
| description | string | ❌ |
| actions | Action[] | ❌ |

**Common Patterns:**
```tsx
// With icon
<EmptyState icon={Package} title="Empty" />

// With action
<EmptyState
  title="No items"
  actions={[{ label: 'Create', onClick: create }]}
/>

// With details
<EmptyState
  title="No items"
  description="Start by creating your first item"
  detail="Takes less than a minute"
/>

// Custom icon color
<EmptyState icon={AlertTriangle} iconColor="text-red-600" />
```

**Available Variants:**
```tsx
EmptyStateVariants.noResults(onClear)      // No search results
EmptyStateVariants.emptyList(name, onCreate)  // Empty list
EmptyStateVariants.noPermission(onGoBack)  // No access
EmptyStateVariants.offline(onRetry)        // Offline
EmptyStateVariants.noContent()             // No content
```

### NoResults

**Import:** `import { NoResults } from '@/components'`

**Essential Props:**
| Prop | Type | Required |
|------|------|----------|
| query | string | ❌ |
| onClear | function | ❌ |
| suggestions | string[] | ❌ |

**Examples:**
```tsx
// Basic
<NoResults query="laptop" />

// With clear action
<NoResults query={term} onClear={() => setTerm('')} />

// Custom suggestions
<NoResults
  query="vintage"
  suggestions={['Check spelling', 'Try keywords', 'Remove filters']}
/>
```

### NotFound

**Import:** `import { NotFound } from '@/components'`

**Essential Props:**
| Prop | Type | Default |
|------|------|---------|
| showHomeButton | boolean | true |
| showSupportButton | boolean | true |
| title | string | "Page not found" |
| description | string | "..." |

**Examples:**
```tsx
// Standard 404
<NotFound />

// Custom message
<NotFound
  title="Listing not found"
  description="This listing has been deleted"
/>

// Custom buttons only
<NotFound
  showHomeButton
  showSupportButton={false}
/>
```

### ServerError

**Import:** `import { ServerError } from '@/components'`

**Essential Props:**
| Prop | Type | Default |
|------|------|---------|
| onRetry | function | - |
| showRetryButton | boolean | true |
| showHomeButton | boolean | true |
| showSupportButton | boolean | true |
| details | string | - |

**Examples:**
```tsx
// Basic
<ServerError onRetry={() => location.reload()} />

// With error details
<ServerError
  details="Database connection failed"
  onRetry={handleRetry}
/>

// Hide buttons
<ServerError
  showRetryButton={false}
  showSupportButton={false}
/>
```

### NetworkError

**Import:** `import { NetworkError } from '@/components'`

**Essential Props:**
| Prop | Type | Default |
|------|------|---------|
| onRetry | function | - |
| autoDetect | boolean | true |
| showRetryButton | boolean | true |
| showHomeButton | boolean | true |

**Examples:**
```tsx
// Auto-detect offline status
<NetworkError autoDetect onRetry={refetch} />

// Manual control
<NetworkError autoDetect={false} onRetry={handleRetry} />

// Custom titles
<NetworkError
  title="Connection lost"
  description="Check your internet"
/>
```

### ErrorBoundary

**Import:** `import { ErrorBoundary } from '@/components'`

**Essential Props:**
| Prop | Type | Default |
|------|------|---------|
| children | ReactNode | - |
| fallback | ReactNode | ErrorUI |
| showDetails | boolean | isDev |

**Examples:**
```tsx
// Basic wrapping
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<CustomError />}>
  <YourComponent />
</ErrorBoundary>

// Show details in dev
<ErrorBoundary showDetails={true}>
  <YourComponent />
</ErrorBoundary>
```

## 🎨 Icon Reference

Common icons for each state:

| State | Icon Name | Import |
|-------|-----------|--------|
| Empty | Package | `import { Package }` |
| Search | Search | `import { Search }` |
| Error | AlertTriangle | `import { AlertTriangle }` |
| Network | WifiOff | `import { WifiOff }` |
| Not Found | FileX | `import { FileX }` |
| Access | Lock | `import { Lock }` |

**All icons from:** `lucide-react`

## 📱 Responsive Behavior

All components adapt to screen size:

```
Mobile   │ Tablet   │ Desktop
---------|----------|----------
100%     │ 90%      │ 80%
16px gap │ 24px gap │ 32px gap
col      │ col/row  │ row
full-w   │ flexible │ auto-w
```

Auto-handled - no configuration needed!

## 🎯 When to Use Each

```
✅ Empty List        → EmptyState + icon
✅ No Search Results → NoResults
✅ 404 Page          → NotFound
✅ 500 Error         → ServerError + retry
✅ Network Down      → NetworkError (auto-detect)
✅ Component Crash   → ErrorBoundary
✅ No Permission     → EmptyState + AlertTriangle
✅ Loading           → LoadingStates (separate)
```

## 🎨 Color Palette

```
Primary    : #7D00FF (Violet) - Success, primary
Error      : #EF4444 (Red)    - Errors, critical
Warning    : #F59E0B (Amber)  - Warnings, offline
Secondary  : #6B7280 (Gray)   - Neutral, disabled
Success    : #10B981 (Green)  - Success indicator
```

## ♿ Accessibility

All components include:

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast 4.5:1
- ✅ Focus indicators
- ✅ Heading hierarchy

No additional setup needed!

## 🔧 Customization

### Change Icon Color

```tsx
<EmptyState
  icon={Package}
  iconColor="text-blue-500"
/>
```

### Change Icon Size

```tsx
<EmptyState
  icon={Package}
  iconSize={80}
/>
```

### Custom Icon (SVG)

```tsx
<EmptyState
  illustration={<CustomSVG />}
  title="Empty"
/>
```

### Custom Layout

```tsx
<EmptyState
  className="min-h-screen bg-gradient-to-b"
  title="Empty"
/>
```

## 📊 Common Patterns

### Pattern: Empty List with Create

```tsx
const [items, setItems] = useState([])

if (items.length === 0) {
  return (
    <EmptyState
      icon={Package}
      title="No items"
      actions={[{
        label: 'Create',
        onClick: () => setShowCreate(true)
      }]}
    />
  )
}
```

### Pattern: Search Flow

```tsx
const [query, setQuery] = useState('')
const [results, setResults] = useState([])

if (!query) return <EmptyState title="Start searching" />
if (results.length === 0) return <NoResults query={query} />
return <ResultsList items={results} />
```

### Pattern: Error Recovery

```tsx
const [error, setError] = useState(null)

const handleRetry = async () => {
  try {
    await loadData()
    setError(null)
  } catch (e) {
    setError(categorize(e))
  }
}

if (error === '404') return <NotFound />
if (error === '500') return <ServerError onRetry={handleRetry} />
if (error === 'network') return <NetworkError onRetry={handleRetry} />
```

### Pattern: Protected Content

```tsx
const [isAuthorized, setIsAuthorized] = useState(false)

if (!isAuthorized) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Access denied"
      description="You don't have permission"
    />
  )
}
```

## 🚀 Performance Tips

- EmptyState renders instantly (no data loading)
- NoResults doesn't block search input
- ErrorBoundary prevents app crash
- NetworkError auto-shows/hides (no manual control)
- All components use React.memo (no re-render issues)

## 🐛 Debugging

### Error Details Not Showing?

Check `NODE_ENV`:
```tsx
// Dev: shows error.stack
// Prod: shows generic message
// Override: showDetails={true}
```

### NetworkError Not Detecting?

Verify:
- `autoDetect={true}` (default)
- Browser supports `online`/`offline` events
- Test with DevTools offline mode

### Dark Mode Not Working?

Check layout has:
```tsx
<html data-dark-mode={isDark ? 'true' : undefined}>
```

## 📚 See Also

- [Full EMPTY_ERROR_STATES.md](./EMPTY_ERROR_STATES.md) - Complete guide
- [EmptyErrorStateShowcase.tsx](../components/EmptyErrorStateShowcase.tsx) - Live demo
- [Button.tsx](../components/Button.tsx) - Action buttons
- [Card.tsx](../components/Card.tsx) - Card wrapper

## 📞 Quick Support

| Issue | Solution |
|-------|----------|
| Icon not showing | Import from `lucide-react` |
| Button not working | Check `onClick` callback |
| Dark mode wrong | Check `data-dark-mode` in html |
| Not responsive | All components auto-responsive |
| Accessibility issues | All WCAG 2.1 AA compliant |

---

**Status:** ✅ Complete and Ready to Use

Copy, paste, customize. That's it!
