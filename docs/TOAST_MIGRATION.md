# Toast System Migration Guide

This guide helps you migrate from `react-hot-toast` to the new built-in Toast system (or use both side-by-side).

## Quick Start

### Before (react-hot-toast)
```tsx
import toast from 'react-hot-toast'

toast.success('Success!')
```

### After (Built-in Toast)
```tsx
import { useToast } from '@/lib/toast'

const toast = useToast()
toast.success('Success!')
```

## Why Use the Built-in System?

✅ **Better TypeScript Support**
- Full type safety with Toast types
- Better IDE autocomplete
- No external library types needed

✅ **Simpler API**
- Easy hook-based usage
- Familiar React context pattern
- Direct state management

✅ **No Dependencies**
- Zero external toast library
- Smaller bundle size
- Full control over styling

✅ **Better Integration**
- Works seamlessly with the app's providers
- Same styling system (Tailwind)
- Dark mode built-in

## Migration Steps

### 1. Replace Imports

```tsx
// ❌ Old
import toast from 'react-hot-toast'

// ✅ New
import { useToast } from '@/lib/toast'
```

### 2. Update Hook Usage

```tsx
// ❌ Old
function MyComponent() {
  return <button onClick={() => toast.success('Done!')}>
}

// ✅ New
function MyComponent() {
  const toast = useToast()
  return <button onClick={() => toast.success('Done!')}>
}
```

### 3. Update Method Calls

```tsx
// ❌ Old React-Hot-Toast
toast.success('Success!', { duration: 3000 })
toast.error('Error')
toast.loading('Loading')
toast.custom((t) => <CustomComp toast={t} />)

// ✅ New Built-in
toast.success('Success!', undefined, 3000)
toast.error('Error')
toast.info('Loading') // Use info for loading states
toast.show({ type: 'info', title: 'Custom' })
```

## Common Patterns

### Form Submission

**Before:**
```tsx
const handleSubmit = async () => {
  try {
    await api.submit(data)
    toast.success('Submitted!')
  } catch (error) {
    toast.error(error.message)
  }
}
```

**After:**
```tsx
const handleSubmit = async () => {
  const toast = useToast()
  try {
    await api.submit(data)
    toast.success('Submitted!')
  } catch (error) {
    toast.error('Error', error.message)
  }
}
```

### Loading State

**Before:**
```tsx
const promise = new Promise(resolve => {
  setTimeout(() => resolve(), 2000)
})

toast.promise(
  promise,
  {
    loading: 'Loading...',
    success: 'Success!',
    error: 'Failed'
  }
)
```

**After:**
```tsx
const toast = useToast()
const toastId = toast.show({ type: 'info', title: 'Loading...', duration: 0 })

try {
  await new Promise(resolve => setTimeout(resolve, 2000))
  toast.dismissToast(toastId)
  toast.success('Success!')
} catch {
  toast.dismissToast(toastId)
  toast.error('Failed')
}
```

### Multiple Toasts

**Before:**
```tsx
toast.success('First')
toast.info('Second')
toast.warning('Third')
```

**After (Same!)**
```tsx
const toast = useToast()
toast.success('First')
toast.info('Second')
toast.warning('Third')
```

## API Comparison

| Feature | react-hot-toast | Built-in Toast |
|---------|-----------------|-----------------|
| Basic toast | `toast.success()` | `toast.success()` |
| Custom message | `toast.success('msg')` | `toast.success('title', 'msg')` |
| Duration | Option object | 3rd parameter |
| Auto-dismiss | Enabled by default | Yes, 5s default |
| Custom component | `toast.custom()` | Not needed - use message |
| Load state | `toast.loading()` | `toast.info()` or `toast.show()` |
| Promises | `toast.promise()` | Manual dismiss pattern |
| Position | Global config | Fixed bottom-right |
| Theme | Manual setup | Built-in dark mode |

## Side-by-Side Usage

You can use both systems together during migration:

```tsx
'use client'

import toast from 'react-hot-toast' // For older code
import { useToast } from '@/lib/toast' // For new code

export function MyComponent() {
  const newToast = useToast()

  return (
    <>
      <button onClick={() => toast.success('Old system')}>
        Old Toast
      </button>
      <button onClick={() => newToast.success('New system')}>
        New Toast
      </button>
    </>
  )
}
```

Both will display correctly!

## Testing

### Unit Tests

```tsx
import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/lib/toast'
import { ToastProvider } from '@/contexts/ToastContext'

test('shows success toast', () => {
  const { result } = renderHook(() => useToast(), {
    wrapper: ToastProvider
  })

  act(() => {
    result.current.success('Test')
  })

  expect(result.current.toasts).toHaveLength(1)
  expect(result.current.toasts[0].type).toBe('success')
})
```

### Integration Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('dismisses toast on click', async () => {
  render(<ToastDemo />, { wrapper: ToastProvider })

  const button = screen.getByText('Success Toast')
  await userEvent.click(button)

  expect(screen.getByText('Success!')).toBeInTheDocument()

  const closeBtn = screen.getByLabelText('Dismiss notification')
  await userEvent.click(closeBtn)

  await waitFor(() => {
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
  })
})
```

## Troubleshooting

### "useToast must be used within ToastProvider"

**Cause:** Component is outside the provider hierarchy
**Fix:** Ensure component is under `<ToastProvider>`

### Toasts not displaying

**Cause:** `ToastSystem` not rendering
**Fix:** Check that `ToastSystem` is in the layout

### TypeScript errors with toast types

**Cause:** Wrong import or missing types
**Fix:** Import from `@/lib/toast`

### Focus ring color not showing

**Cause:** Missing color value in focus ring class
**Fix:** Uses dynamic colors based on toast type

## Removing react-hot-toast

Once migration is complete:

1. Remove `import { Toaster } from 'react-hot-toast'` from layout
2. Remove `<Toaster />` component
3. Uninstall: `npm remove react-hot-toast`

## FAQ

**Q: Can I customize toast colors?**
A: Yes, edit `TOAST_CONFIG` in `ToastContext.tsx`

**Q: Can I change the position?**
A: Yes, modify the `position` prop in `ToastSystem` component

**Q: How do I show persistent toasts?**
A: Use `duration: 0` when creating the toast

**Q: Can I add custom actions to toasts?**
A: Not directly, but `onDismiss` callback is available

**Q: Is there a way to show loading toasts?**
A: Use `toast.info()` or `toast.show({ type: 'info' })` with `duration: 0`

## Support

For issues or questions:
1. Check [TOAST_SYSTEM.md](../docs/TOAST_SYSTEM.md)
2. See [ToastDemo.tsx](./ToastDemo.tsx) for examples
3. Review the Toast component source code
