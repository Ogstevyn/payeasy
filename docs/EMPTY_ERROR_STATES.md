# Empty & Error State Screens

Beautiful, accessible, and memorable empty and error state screens for your application.

## 📋 Overview

A complete system for handling edge cases gracefully with:
- **Empty State** - When lists/sections have no content
- **No Results** - When search queries return nothing
- **404 Not Found** - When a page doesn't exist
- **500 Server Error** - When something breaks on the server
- **Network Error** - When the user is offline
- **Error Boundary** - Catches React component errors
- **Permission Denied** - When user lacks access

All components are:
- ✅ Mobile responsive
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Dark mode support
- ✅ Brand consistent
- ✅ Professional illustrations
- ✅ Clear call-to-actions
- ✅ Memorable design

## 🎯 Components

### EmptyState

Reusable component for empty content states.

```tsx
import { EmptyState } from '@/components/EmptyState'
import { Package } from 'lucide-react'

export function MyListings() {
  return (
    <EmptyState
      icon={Package}
      title="No listings"
      description="You haven't created any listings yet."
      actions={[
        {
          label: 'Create listing',
          onClick: () => router.push('/create'),
          variant: 'primary',
        },
      ]}
    />
  )
}
```

**Props:**
- `icon?: LucideIcon` - Icon to display
- `title: string` - Main heading
- `description?: string` - Descriptive text
- `detail?: string` - Additional context
- `actions?: Action[]` - Action buttons
- `iconColor?: string` - Icon color class
- `iconSize?: number` - Icon size in pixels
- `illustration?: React.ReactNode` - Custom illustration
- `className?: string` - Additional CSS

**Built-in Variants:**
```tsx
import { EmptyStateVariants } from '@/components/EmptyState'

// No search results
<EmptyState {...EmptyStateVariants.noResults(onClearFilters)} />

// Empty list
<EmptyState {...EmptyStateVariants.emptyList('listing', onCreate)} />

// No permission
<EmptyState {...EmptyStateVariants.noPermission(onGoBack)} />

// Offline
<EmptyState {...EmptyStateVariants.offline(onRetry)} />

// No content
<EmptyState {...EmptyStateVariants.noContent()} />
```

### NoResults

Specialized component for search results with no matches.

```tsx
import { NoResults } from '@/components/NoResults'

export function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  if (results.length === 0 && query) {
    return (
      <NoResults
        query={query}
        onClear={() => {
          setQuery('')
          setResults([])
        }}
        suggestions={[
          'Check your spelling',
          'Try different keywords',
          'Try more general searches',
        ]}
      />
    )
  }

  return <div>{/* results */}</div>
}
```

**Props:**
- `query?: string` - The search query
- `showClearButton?: boolean` - Show clear search button
- `onClear?: () => void` - Clear callback
- `suggestions?: string[]` - Search tips
- `className?: string` - Additional CSS

### NotFound

Beautiful 404 page for missing resources.

```tsx
import { NotFound } from '@/components/NotFound'

// In app/[slug]/not-found.tsx
export default function NotFoundPage() {
  return (
    <NotFound
      title="Listing not found"
      description="The listing you're looking for has been deleted or never existed."
      showHomeButton
      showSupportButton
    />
  )
}
```

**Props:**
- `title?: string` - Custom heading
- `description?: string` - Custom description
- `showHomeButton?: boolean` - Show home link
- `showSupportButton?: boolean` - Show contact support
- `actions?: Action[]` - Custom actions
- `className?: string` - Additional CSS

### ServerError

Beautiful 500 page for server errors.

```tsx
import { ServerError } from '@/components/ServerError'

export function ErrorPage() {
  return (
    <ServerError
      title="Something went wrong"
      description="We're experiencing technical difficulties."
      details={process.env.NODE_ENV === 'development' ? error.message : undefined}
      onRetry={() => location.reload()}
      showRetryButton
      showHomeButton
      showSupportButton
    />
  )
}
```

**Props:**
- `title?: string` - Custom heading
- `description?: string` - Custom description
- `details?: string` - Error details (dev only)
- `onRetry?: () => void` - Retry callback
- `showHomeButton?: boolean` - Show home link
- `showRetryButton?: boolean` - Show retry button
- `showSupportButton?: boolean` - Show contact support
- `actions?: Action[]` - Custom actions
- `className?: string` - Additional CSS

### NetworkError

Component for offline/network error states.

```tsx
import { NetworkError } from '@/components/NetworkError'

export function MyApp() {
  return (
    <>
      <NetworkError
        autoDetect={true}
        showRetryButton
        showHomeButton
        onRetry={async () => {
          // Retry failed request
          await refetchData()
        }}
      />
      <YourApp />
    </>
  )
}
```

**Props:**
- `title?: string` - Custom heading
- `description?: string` - Custom description
- `showRetryButton?: boolean` - Show retry button
- `showHomeButton?: boolean` - Show home button
- `onRetry?: () => void` - Retry callback
- `onGoHome?: () => void` - Go home callback
- `autoDetect?: boolean` - Auto-detect online/offline
- `className?: string` - Additional CSS
- `children?: React.ReactNode` - Custom content

**Features:**
- Automatically shows/hides based on connection
- Live status indicator
- Auto-retry on connection restore

### ErrorBoundary

Catches React errors and displays error state.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ErrorBoundary
          title="Oops!"
          description="Something unexpected happened"
          showDetails={process.env.NODE_ENV === 'development'}
        >
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

**Props:**
- `children: ReactNode` - Child components
- `fallback?: ReactNode` - Custom fallback UI
- `showDetails?: boolean` - Show error details
- `title?: string` - Custom title
- `description?: string` - Custom description

**Features:**
- Catches unhandled errors
- Shows error details in development
- Auto-reports to error capture service
- Beautiful error UI with recovery options

## 🎨 Design System

### Colors

- **Primary (Violet):** `#7D00FF` - Success, primary actions
- **Red:** `#EF4444` - Errors, alerts
- **Amber:** `#F59E0B` - Warnings, offline
- **Gray:** `#6B7280` - Neutral, disabled
- **Green:** `#10B981` - Success indicator

### Icons

All components use icons from `lucide-react`:

- **Empty:** Package, Book, Inbox
- **Search:** Search, Filter
- **Errors:** AlertTriangle, AlertCircle
- **Network:** WifiOff, CloudOff
- **Actions:** RotateCcw, Home, Mail

### Typography

- **Headings:** 24-48px bold
- **Descriptions:** 18-20px normal gray-700
- **Details:** 14-16px italic gray-500
- **Buttons:** 14-18px medium

### Spacing

- **Mobile:** 16px padding, 24px gaps
- **Tablet:** 24px padding, 32px gaps
- **Desktop:** 32px padding, 40px gaps

## 📱 Mobile Responsive

All components are mobile-first:

- **Mobile (< 640px)**
  - Single column layout
  - Full-width buttons
  - Adjusted text sizes
  - Reduced icon sizes

- **Tablet (640px - 1024px)**
  - Flexible button rows
  - Optimized spacing
  - Medium icon sizes

- **Desktop (≥ 1024px)**
  - Optimal layout
  - Multi-button rows
  - Full-size icons

## ♿ Accessibility

All components meet WCAG 2.1 AA standards:

- **Semantic HTML** - Proper heading hierarchy
- **Color Contrast** - 4.5:1 text contrast ratio
- **Keyboard Navigation** - All buttons are keyboard accessible
- **Focus Management** - Visible focus indicators
- **ARIA Labels** - Proper icon descriptions
- **Error Details** - Hidden but available in markup

## 🎭 Theming

### Dark Mode

All components automatically adapt to dark mode:

```tsx
// Global dark mode toggle in Layout
<html data-dark-mode={isDarkMode ? 'true' : undefined}>
  {children}
</html>
```

### Custom Colors

Override default colors:

```tsx
<EmptyState
  icon={Package}
  iconColor="text-blue-500"
  title="Custom theme"
/>
```

## 🔨 Usage Patterns

### Pattern: Empty List with Create Action

```tsx
import { EmptyState } from '@/components/EmptyState'

export function ListingsPage() {
  const [listings, setListings] = useState([])

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No listings"
        description="Create your first listing to get started."
        actions={[
          {
            label: 'Create listing',
            onClick: createListing,
            variant: 'primary',
          },
        ]}
      />
    )
  }

  return <ListingsGrid listings={listings} />
}
```

### Pattern: Search with No Results

```tsx
import { NoResults } from '@/components/NoResults'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  return (
    <>
      <SearchBar value={query} onChange={setQuery} />

      {results.length === 0 && query && (
        <NoResults
          query={query}
          onClear={() => {
            setQuery('')
            setResults([])
          }}
        />
      )}

      {results.map(result => (
        <ResultCard key={result.id} result={result} />
      ))}
    </>
  )
}
```

### Pattern: Error Boundary Wrapper

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function DashboardPage() {
  return (
    <ErrorBoundary
      title="Dashboard Error"
      description="Unable to load dashboard"
    >
      <Dashboard />
    </ErrorBoundary>
  )
}
```

### Pattern: Network Aware Component

```tsx
import { NetworkError } from '@/components/NetworkError'
import { useCallback, useState } from 'react'

export function DataGrid() {
  const [error, setError] = useState<'network' | null>(null)

  const handleRetry = useCallback(async () => {
    try {
      await refetchData()
      setError(null)
    } catch (err) {
      setError('network')
    }
  }, [])

  if (error === 'network') {
    return <NetworkError onRetry={handleRetry} />
  }

  return <DataGridContent />
}
```

### Pattern: Multi-Step Error Handling

```tsx
export function FileUpload() {
  const [state, setState] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle')
  const [error, setError] = useState<{ type: '404' | '500' | 'network' } | null>(null)

  const handleUpload = async (file: File) => {
    setState('loading')
    try {
      const result = await uploadFile(file)
      if (result.items.length === 0) {
        setState('empty')
      }
    } catch (err) {
      setError(categorizeError(err))
      setState('error')
    }
  }

  if (state === 'empty') {
    return <EmptyState title="Upload successful" description="No items found" />
  }

  if (error?.type === '404') {
    return <NotFound />
  }

  if (error?.type === '500') {
    return <ServerError onRetry={handleUpload} />
  }

  if (error?.type === 'network') {
    return <NetworkError onRetry={handleUpload} />
  }

  return <FileUploadForm onUpload={handleUpload} />
}
```

## 🚀 Best Practices

### Do's ✅

- Use EmptyState for all empty list scenarios
- Show helpful tips and suggestions
- Provide clear call-to-action buttons
- Use appropriate icons for context
- Test on mobile devices
- Include error details in development
- Use consistent messaging

### Don'ts ❌

- Don't hide error information completely
- Don't use generic "Error" messages
- Don't forget mobile responsive design
- Don't make CTAs unclear
- Don't use too many colors
- Don't ignore accessibility features
- Don't show technical errors to users

## 📊 Component Showcase

See all components in action:

```tsx
import { EmptyErrorStateShowcase } from '@/components/EmptyErrorStateShowcase'

export default function ShowcasePage() {
  return <EmptyErrorStateShowcase />
}
```

Or visit: `/showcase/empty-states`

## 🔗 Related Components

- `Button.tsx` - Action buttons
- `Card.tsx` - Content cards
- `Spinner.tsx` - Loading spinners
- `Skeleton.tsx` - Skeleton loading
- `LoadingStates.tsx` - Loading examples
- `Banner.tsx` - Alert banners

## 📚 Files Created

- `components/EmptyState.tsx` - Reusable empty state
- `components/NoResults.tsx` - Search results
- `components/NotFound.tsx` - 404 page
- `components/ServerError.tsx` - 500 page
- `components/NetworkError.tsx` - Network error
- `components/ErrorBoundary.tsx` - Error boundary (enhanced)
- `components/EmptyErrorStateShowcase.tsx` - Component showcase

## 🎓 Learning Resources

### Quick Start

1. Import the component you need
2. Pass required props (title, description)
3. Add custom icon (optional)
4. Add action buttons (optional)
5. Customize colors/text as needed

### Code Examples

Check `EmptyErrorStateShowcase.tsx` for live examples of:
- Different empty states
- Search results
- 404 and 500 pages
- Network errors
- Permission denied

### Accessibility Best Practices

- All heading hierarchy is correct
- Icon descriptions included
- Buttons are keyboard accessible
- Color is not the only indicator
- Suggestions help users recover

## 💡 Tips

### Choosing the Right Component

| Situation | Component |
|-----------|-----------|
| List/section is empty | EmptyState |
| Search has no results | NoResults |
| Page doesn't exist | NotFound (404) |
| Server error occurred | ServerError (500) |
| User is offline | NetworkError |
| Component crashed | ErrorBoundary |
| User lacks permission | EmptyState + icon |
| Loading in progress | LoadingStates.tsx |

### Custom Illustrations

Replace lucide-react icons with custom SVGs:

```tsx
<EmptyState
  illustration={
    <img src="/illustrations/empty-box.svg" alt="" />
  }
  title="Empty"
/>
```

### Animated States

Add animations to states:

```tsx
<ServerError
  onRetry={async () => {
    // Animate while retrying
    setIsRetrying(true)
    await retry()
    setIsRetrying(false)
  }}
/>
```

---

**Status:** ✅ Complete and Production-Ready

All components are fully typed, accessible, mobile-responsive, and tested.
