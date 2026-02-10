"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

const AuthContext = createContext<{
  user: any | null
  loading: boolean
}>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching user data. Replace with actual Firebase auth logic.
    const mockUser = {
      id: "user-1",
      name: "Mock User",
      email: "mock@example.com",
      role: "student", // or "teacher"
    }

    setTimeout(() => {
      setUser(mockUser)
      setLoading(false)
    }, 500)
  }, [])

  const value = { user, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
