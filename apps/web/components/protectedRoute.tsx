'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useProtectedAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode // optional custom loading UI
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // ✅ Show loading state during auth verification
  if (isLoading) {
    return fallback ?? <AuthLoadingSpinner />
  }

  // ✅ Prevent flash of protected content before redirect fires
  if (!isAuthenticated) return null

  return <>{children}</>
}

function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  )
}