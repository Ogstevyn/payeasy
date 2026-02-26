# Toast Notification System

A lightweight, accessible toast notification system built with React, TypeScript, and Tailwind CSS.

## Features

✨ **Beautiful & Accessible**
- Type variants: success, error, warning, info
- Icons for each type using lucide-react
- Dark mode support
- ARIA roles and live regions for accessibility

🎯 **Smart Stack Management**
- Auto-dismiss after 5 seconds (configurable)
- Manual dismiss with close button
- Max 5 toasts visible (configurable)
- Smooth slide-in/out animations

📱 **Responsive Design**
- Mobile-friendly positioning
- Works on all screen sizes
- Touch-friendly close button

⚡ **Easy to Use**
- Simple hook-based API
- Context-based state management
- No external toast libraries required

## Installation

The Toast system is already integrated in the app. Just use the `useToast` hook!

## Usage

### Basic Setup

The Toast system is already wrapped in your app layout via `ToastProvider`. Just import and use:

```tsx
'use client'

import { useToast } from '@/lib/toast'

export function MyComponent() {
  const toast = useToast()

  return (
    <button onClick={() => toast.success('Success!', 'Your changes have been saved')}>
      Show Toast
    </button>
  )
}
```

### Toast Types

```tsx
const toast = useToast()

// Success toast
toast.success('Success', 'Operation completed')

// Error toast
toast.error('Error', 'Something went wrong')

// Warning toast
toast.warning('Warning', 'Please review this')

// Info toast
toast.info('Info', 'Here is some information')
```

### Custom Duration

```tsx
// Auto-dismiss after 3 seconds
toast.success('Quick notification', 'This disappears in 3 seconds', 3000)

// Never auto-dismiss (0 means no auto-dismiss)
toast.success('Persistent notification', 'Click to dismiss', 0)

// Default is 5000ms
toast.success('Standard notification')
```

### Custom Toast

```tsx
const toastId = toast.show({
  type: 'info',
  title: 'Custom Toast',
  message: 'With custom options',
  duration: 4000,
  onDismiss: () => {
    console.log('Toast was dismissed')
  }
})

// Later, dismiss it manually
toast.dismissToast(toastId)
```

### Clear All Toasts

```tsx
toast.clearAllToasts()
```

## API Reference

### `useToast()`

Returns an object with the following methods:

#### Success Toast
```typescript
success(title: string, message?: string, duration?: number): string
```

#### Error Toast
```typescript
error(title: string, message?: string, duration?: number): string
```

#### Warning Toast
```typescript
warning(title: string, message?: string, duration?: number): string
```

#### Info Toast
```typescript
info(title: string, message?: string, duration?: number): string
```

#### Custom Toast
```typescript
show(toast: Omit<Toast, 'id'>): string
```

#### Dismiss Toast
```typescript
dismissToast(id: string): void
```

#### Clear All
```typescript
clearAllToasts(): void
```

## Styling

The toast system uses Tailwind CSS for styling with these colors:

- **Success**: Green (green-50, green-600, etc.)
- **Error**: Red (red-50, red-600, etc.)
- **Warning**: Yellow (yellow-50, yellow-600, etc.)
- **Info**: Blue (blue-50, blue-600, etc.)

Dark mode is automatically supported with `dark:` prefixed classes.

## Positioning

By default, toasts appear in the `bottom-right` corner. To change this, modify the `ToastSystem` component:

```tsx
<ToastContainer
  toasts={context.toasts}
  onDismiss={context.dismissToast}
  position="top-right"  // or: top-left, bottom-left, top-center, bottom-center
/>
```

## Examples

### Form Submission

```tsx
'use client'

import { useToast } from '@/lib/toast'
import { useState } from 'react'

export function SignupForm() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        body: new FormData(e.currentTarget),
      })

      if (!response.ok) {
        toast.error('Signup failed', 'Please check your information')
        return
      }

      toast.success('Account created', 'Welcome to PayEasy!')
    } catch (error) {
      toast.error('Error', 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### Loading Operation

```tsx
'use client'

import { useToast } from '@/lib/toast'

export function DeleteButton() {
  const toast = useToast()

  const handleDelete = async () => {
    try {
      // Show info toast (doesn't auto-dismiss since duration is 0)
      const loadingId = toast.show({
        type: 'info',
        title: 'Deleting...',
        duration: 0,
      })

      await fetch('/api/item', { method: 'DELETE' })

      // Dismiss loading toast and show success
      toast.dismissToast(loadingId)
      toast.success('Deleted', 'Item has been removed')
    } catch (error) {
      toast.error('Error', 'Failed to delete item')
    }
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

### Validation Feedback

```tsx
'use client'

import { useToast } from '@/lib/toast'

export function PaymentForm() {
  const toast = useToast()

  const handlePayment = async (amount: number) => {
    if (!amount || amount <= 0) {
      toast.warning('Invalid Amount', 'Please enter a valid amount')
      return
    }

    try {
      await processPayment(amount)
      toast.success('Payment Successful', `$${amount.toFixed(2)} has been processed`)
    } catch (error) {
      toast.error('Payment Failed', error.message)
    }
  }

  return (
    <button onClick={() => handlePayment(50)}>
      Pay $50
    </button>
  )
}
```

## Accessibility

The toast system includes several accessibility features:

- **ARIA Live Regions**: Uses `aria-live="assertive"` and `aria-atomic="true"`
- **Role Alert**: Properly set to `role="alert"` for immediate announcements
- **Keyboard Navigation**: Close button is keyboard focusable
- **Focus Ring**: Visible focus state on the close button
- **Icon Accessibility**: Icons have `aria-hidden="true"` since the text describes them

## Performance

- **Lazy-loaded**: Uses client-side rendering only when needed
- **Efficient**: Minimal re-renders, optimized animations
- **Memory-safe**: Automatic cleanup of timers on unmount
- **Stack limits**: Maximum 5 toasts by default (configurable)

## Troubleshooting

### ToastProvider not found error

Make sure your component is within the provider hierarchy:

```tsx
// ✅ Good - inside the app where ToastProvider wraps everything
'use client'
import { useToast } from '@/lib/toast'

// ❌ Bad - component is at root level before ToastProvider
```

### Toasts not appearing

1. Make sure you're using `useToast()` hook in a client component (`'use client'`)
2. Verify the component is within the `ToastProvider` hierarchy
3. Check that `ToastSystem` is rendering in the layout

### Animations not smooth

Ensure Tailwind CSS is properly configured with the animate utilities. Check that `tailwind.config.ts` includes animation configurations.

## Comparison with react-hot-toast

The built-in system provides:
- Better TypeScript support
- Simpler API
- No external dependencies
- Direct context integration
- Full control over styling
- Better accessibility defaults

## Related Files

- [Toast.tsx](../../components/Toast.tsx) - Toast component and container
- [ToastContext.tsx](../../contexts/ToastContext.tsx) - Context provider
- [useToast.ts](../../hooks/useToast.ts) - Hook
- [ToastSystem.tsx](../../components/ToastSystem.tsx) - Renderer component
