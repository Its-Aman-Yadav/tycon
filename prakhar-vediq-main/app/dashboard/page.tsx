"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function DashboardPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (userData) {
      if (userData.role === "teacher") {
        router.push("/dashboard/teacher")
      } else if (userData.role === "student") {
        router.push("/dashboard/student")
      } else if (userData.role === "admin") {
        router.push("/dashboard/admin")
      }
    }
  }, [user, userData, loading, router])

  if (loading || !user) {
    return <DashboardSkeleton />
  }

  return <DashboardSkeleton />
}
