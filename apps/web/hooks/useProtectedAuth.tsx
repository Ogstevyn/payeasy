"use client"
import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/auth/me') // your auth verification endpoint
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false) // ✅ always clear loading state
      }
    }

    verifyAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)