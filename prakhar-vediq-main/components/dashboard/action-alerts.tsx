"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { AlertCircle, ArrowRight, CheckCircle, UserX } from "lucide-react"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import app from "@/lib/firebase"

interface AlertProps {
  title: string
  count: number
  description: string
  icon: React.ReactNode
  variant: "warning" | "error" | "info"
  isComingSoon?: boolean
}

function AlertItem({ title, count, description, icon, variant, isComingSoon = false }: AlertProps) {
  const variantStyles = {
    warning: "bg-amber-50 text-amber-600 border-l-amber-500",
    error: "bg-red-50 text-red-600 border-l-red-500",
    info: "bg-blue-50 text-blue-600 border-l-blue-500",
  }

  return (
    <div className="relative">
      {isComingSoon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/70 backdrop-blur-[1px] rounded-md">
          <Badge className="bg-[#006400] px-2 py-1 text-xs font-medium">Coming Soon</Badge>
        </div>
      )}
      <div
        className={`flex items-center gap-4 rounded-md border-l-4 p-4 ${variantStyles[variant]} ${isComingSoon ? "opacity-60" : ""}`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80">{icon}</div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <h4 className="font-medium">{title}</h4>
            <span className="rounded-full bg-white px-2 py-0.5 text-sm font-medium">{count}</span>
          </div>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function ActionAlerts() {
  const [inactiveStudentsCount, setInactiveStudentsCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchInactiveStudents() {
      try {
        const db = getFirestore(app)

        // Query for students where status is not "active"
        const studentsRef = collection(db, "users")
        const inactiveStudentsQuery = query(
          studentsRef,
          where("role", "==", "student"),
          where("status", "!=", "active"),
        )

        const inactiveStudentsSnapshot = await getDocs(inactiveStudentsQuery)
        setInactiveStudentsCount(inactiveStudentsSnapshot.size)

        console.log(`Found ${inactiveStudentsSnapshot.size} inactive students`)
      } catch (error) {
        console.error("Error fetching inactive students:", error)
        // Keep the default count in case of error
      } finally {
        setLoading(false)
      }
    }

    fetchInactiveStudents()
  }, [])

  // Define alerts with dynamic inactive students count
  const alerts: AlertProps[] = [
    {
      title: "Unassigned Teachers",
      count: 3,
      description: "Courses without assigned teachers",
      icon: <UserX className="h-5 w-5" />,
      variant: "error",
      isComingSoon: true,
    },
    {
      title: "Inactive Students",
      count: loading ? 0 : inactiveStudentsCount,
      description: "Students inactive for 14+ days",
      icon: <AlertCircle className="h-5 w-5" />,
      variant: "warning",
      isComingSoon: false,
    },
    {
      title: "Pending Grading",
      count: 42,
      description: "Assignments waiting to be graded",
      icon: <CheckCircle className="h-5 w-5" />,
      variant: "info",
      isComingSoon: true,
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Action Alerts</CardTitle>
          <CardDescription>Items that need your attention</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertItem key={index} {...alert} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
