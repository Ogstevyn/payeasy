# Toast Notification System - Quick Reference

## 🚀 Quick Start

```tsx
'use client'
import { useToast } from '@/lib/toast'

function MyComponent() {
  const toast = useToast()

  return (
    <button onClick={() => toast.success('Success!', 'Operation completed')}>
      Show Toast
    </button>
  )
}
```

## 📚 API Methods

```tsx
const toast = useToast()

// Display toasts
toast.success(title, message?, duration?)    // Green
toast.error(title, message?, duration?)      // Red
toast.warning(title, message?, duration?)    // Yellow
toast.info(title, message?, duration?)       // Blue

// Custom toast
toast.show({
  type: 'success',
  title: 'Custom',
  message: 'Optional',
  duration: 5000,
  onDismiss: () => console.log('dismissed')
})

// Manage toasts
toast.dismissToast(toastId)    // Dismiss specific toast
toast.clearAllToasts()          // Dismiss all toasts
```

## ⏱️ Duration

- Default: 5000ms (5 seconds)
- Custom: Pass any number in milliseconds
- Persistent: Use `0` for no auto-dismiss

## 🎨 Toast Types

| Type | Color | Icon | Uses |
|------|-------|------|------|
| success | Green | ✓ CheckCircle | Confirmations, success |
| error | Red | ✗ AlertCircle | Errors, validation |
| warning | Yellow | ⚠ Triangle | Warnings, caution |
| info | Blue | ⓘ Info | Info, loading |

## 📁 Key Files

- **Use this:** `@/lib/toast` exports
- **Provider:** `contexts/ToastContext.tsx`
- **Hook:** `hooks/useToast.ts`
- **Component:** `components/Toast.tsx`
- **Demo:** `components/ToastDemo.tsx`

## 📖 Full Documentation

- [TOAST_SYSTEM.md](./TOAST_SYSTEM.md) - Complete guide
- [TOAST_MIGRATION.md](./TOAST_MIGRATION.md) - Migration from react-hot-toast
- [TOAST_IMPLEMENTATION.md](./TOAST_IMPLEMENTATION.md) - Implementation details

## ✅ Features

✅ 4 toast types
✅ Auto-dismiss (configurable)
✅ Manual dismiss with button
✅ Stack management (max 5)
✅ Smooth animations
✅ Dark mode
✅ Mobile responsive
✅ Accessible (ARIA)

## 🎯 Examples

### Form Submission
```tsx
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    await api.submit(data)
    toast.success('Done!', 'Changes saved')
  } catch (error) {
    toast.error('Failed', error.message)
  }
}
```

### Async Operation
```tsx
const toastId = toast.show({
  type: 'info',
  title: 'Loading...',
  duration: 0  // Don't auto-dismiss
})

await operation()

toast.dismissToast(toastId)
toast.success('Complete!', 'Operation finished')
```

### Multiple Toasts
```tsx
toast.success('First')
toast.info('Second')
toast.warning('Third')
// Auto-stacks with max 5 visible
```

### Persistent Toast
```tsx
toast.success('Important', 'Click X to dismiss', 0)
// Won't auto-dismiss
```

## 🔧 Customization

### Change default position
Edit `ToastSystem` in `components/ToastSystem.tsx`:
```tsx
<ToastContainer position="top-right" />
```

Positions: `top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`

### Change max visible toasts
Edit `app/layout.tsx`:
```tsx
<ToastProvider maxToasts={10}>
```

### Change colors/icons
Edit `TOAST_CONFIG` in `contexts/ToastContext.tsx`

## ⚠️ Common Mistakes

❌ Using outside client component
```tsx
// This won't work - not 'use client'
function MyComponent() { }
```

✅ Use in client component
```tsx
'use client'
function MyComponent() { }
```

❌ Using without provider
```tsx
// App not wrapped in ToastProvider
```

✅ Provider is in layout (already done!)
```tsx
// Layout has ToastProvider
```

## 🆘 Troubleshooting

**Toasts not showing?**
- Make sure component has `'use client'`
- Verify component is within app hierarchy
- Check browser console for errors

**Animations not smooth?**
- Check Tailwind CSS is loaded
- Verify animate utilities in tailwind.config.ts

**TypeScript errors?**
- Import from `@/lib/toast`
- Ensure useToast is called in hook context

## 📊 Statistics

- **Files created**: 9
- **Lines of code**: ~700
- **Documentation**: ~800 lines
- **Bundle size**: ~5KB
- **External dependencies**: 0 (new)

## 🎉 You're All Set!

The toast system is fully integrated and ready to use. Start showing notifications in your components!

```tsx
import { useToast } from '@/lib/toast'
// ... enjoy beautiful toasts!
```

---

**Last Updated:** February 25, 2026
