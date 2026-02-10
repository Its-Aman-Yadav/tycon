"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { BookOpen, Calendar, GraduationCap, Users } from "lucide-react"
import { collection, onSnapshot, query, orderBy, limit, type Timestamp } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"

interface ActivityProps {
  id: string
  action: string
  description: string
  time: string
  icon: React.ReactNode
  user?: {
    name: string
    avatar?: string
  }
  createdAt: Timestamp
}

function getActivityIcon(type: string) {
  switch (type) {
    case "course":
      return <BookOpen className="h-4 w-4" />
    case "teacher":
      return <GraduationCap className="h-4 w-4" />
    case "class":
      return <Calendar className="h-4 w-4" />
    case "student":
      return <Users className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

function getDateFromTimestamp(timestamp: any): Date {
  try {
    if (!timestamp) return new Date()

    // Handle Firestore Timestamp objects
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate()
    }

    // Handle timestamp as seconds (number)
    if (typeof timestamp === "number") {
      return new Date(timestamp * 1000)
    }

    // Handle timestamp as ISO string or other date format
    if (timestamp.seconds && timestamp.nanoseconds) {
      return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    }

    // Handle timestamp as Date object
    if (timestamp instanceof Date) {
      return timestamp
    }

    // Handle timestamp as string
    if (typeof timestamp === "string") {
      const parsedDate = new Date(timestamp)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    }

    // Default fallback
    return new Date()
  } catch (error) {
    console.error("Error parsing timestamp:", error, timestamp)
    return new Date()
  }
}

function ActivityItem({ action, description, time, icon, user }: ActivityProps) {
  return (
    <div className="flex gap-4 border-b border-gray-100 py-4 last:border-0">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name} />
        <AvatarFallback>
          {user?.name
            ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
            : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e6f0e6] text-[#006400]">
            {icon}
          </div>
          <p className="font-medium text-gray-900">{action}</p>
        </div>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        <p className="mt-1 text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create an array to store all unsubscribe functions
    const unsubscribes: (() => void)[] = []

    // Function to create a formatted activity from Firestore data
    const createActivity = (doc: any, type: string) => {
      const data = doc.data()
      let action = ""
      let description = ""
      let userName = "Admin"
      let userAvatar = "/letter-a-abstract.png"

      switch (type) {
        case "course":
          action = "New course created"
          description = `${data.title} has been added to the catalog`
          break
        case "teacher":
          action = "Teacher assigned"
          description = `${data.fullName} assigned to ${data.batch || "a batch"}`
          break
        case "class":
          action = "Live class completed"
          description = `${data.subject || "Class"} with ${data.batch || "students"} completed`
          userName = data.teacherName || "Teacher"
          userAvatar = data.teacherAvatar || "/placeholder-user.jpg"
          break
        case "student":
          action = "New students enrolled"
          description = `${data.count || 1} student${data.count > 1 ? "s" : ""} enrolled in ${data.course || "a course"}`
          break
      }

      return {
        id: doc.id,
        action,
        description,
        time: (() => {
          try {
            const date = getDateFromTimestamp(data.createdAt)
            return formatDistanceToNow(date, { addSuffix: true })
          } catch (error) {
            console.error("Error formatting time:", error, data.createdAt)
            return "recently"
          }
        })(),
        icon: getActivityIcon(type),
        user: {
          name: userName,
          avatar: userAvatar,
        },
        createdAt: data.createdAt,
      }
    }

    // Watch courses collection
    const coursesQuery = query(collection(db, "courses"), orderBy("createdAt", "desc"), limit(3))

    unsubscribes.push(
      onSnapshot(coursesQuery, (snapshot) => {
        const courseActivities = snapshot.docs.map((doc) => createActivity(doc, "course"))
        updateActivities(courseActivities)
      }),
    )

    // Watch teachers collection
    const teachersQuery = query(collection(db, "teachers"), orderBy("createdAt", "desc"), limit(3))

    unsubscribes.push(
      onSnapshot(teachersQuery, (snapshot) => {
        const teacherActivities = snapshot.docs.map((doc) => createActivity(doc, "teacher"))
        updateActivities(teacherActivities)
      }),
    )

    // Watch classes collection
    const classesQuery = query(collection(db, "classes"), orderBy("createdAt", "desc"), limit(3))

    unsubscribes.push(
      onSnapshot(classesQuery, (snapshot) => {
        const classActivities = snapshot.docs.map((doc) => createActivity(doc, "class"))
        updateActivities(classActivities)
      }),
    )

    // Watch students collection
    const studentsQuery = query(collection(db, "students"), orderBy("createdAt", "desc"), limit(3))

    unsubscribes.push(
      onSnapshot(studentsQuery, (snapshot) => {
        const studentActivities = snapshot.docs.map((doc) => createActivity(doc, "student"))
        updateActivities(studentActivities)
      }),
    )

    // Function to update activities state with new data
    function updateActivities(newActivities: ActivityProps[]) {
      setActivities((currentActivities) => {
        // Combine current and new activities
        const combined = [...currentActivities, ...newActivities]

        // Remove duplicates based on id
        const unique = combined.filter((activity, index, self) => index === self.findIndex((a) => a.id === activity.id))

        // Sort by createdAt in descending order
        const sorted = unique.sort((a, b) => {
          const dateA = getDateFromTimestamp(a.createdAt)
          const dateB = getDateFromTimestamp(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })

        // Limit to 3 activities
        return sorted.slice(0, 3)
      })

      setLoading(false)
    }

    // Cleanup function to unsubscribe from all listeners
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  return (
    <div className="relative">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and updates</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#006400] border-t-transparent"></div>
            </div>
          ) : activities.length > 0 ? (
            <div>
              {activities.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No recent activity found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
