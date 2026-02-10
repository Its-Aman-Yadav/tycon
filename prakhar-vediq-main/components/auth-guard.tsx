"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "student" | "teacher" | "admin"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login")
      } else if (requiredRole && userData?.role !== requiredRole) {
        router.push("/dashboard")
      }
    }
  }, [user, userData, loading, router, requiredRole])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!user) {
    return null
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return <DashboardSkeleton />
  }

  return <>{children}</>
}
