"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Video } from "lucide-react"
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import app from "@/lib/firebase"
import Link from "next/link"

interface SessionInfo {
  day: string
  startTime: string
  endTime: string
  recurring: boolean
}

interface BatchClass {
  id: string
  batchName: string
  courseId: string
  courseName: string
  day: string
  date: string
  time: string
  startTime: string
  endTime: string
  teacher: {
    id: string
    name: string
    avatar?: string
  }
}

function ClassItem({ batchName, courseName, day, date, time, teacher }: BatchClass) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0e6]">
          <Video className="h-5 w-5 text-[#006400]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{courseName}</p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{batchName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-[#006400]">{date}</span>
            {/* <span>•</span> */}
            {/* <span>{day}</span> */}
            <span>•</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {teacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-gray-600 md:inline">{teacher.name}</span>
        </div>
      </div>
    </div>
  )
}

export function UpcomingClasses() {
  const [upcomingClasses, setUpcomingClasses] = useState<BatchClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUpcomingClasses() {
      try {
        const db = getFirestore(app)
        const now = new Date()
        const today = now.toISOString().split("T")[0] // Format: YYYY-MM-DD

        // Query active batches that haven't ended yet
        const batchesRef = collection(db, "batches")
        const batchesQuery = query(batchesRef, where("status", "==", "active"), where("endDate", ">=", today))

        const batchesSnapshot = await getDocs(batchesQuery)

        if (batchesSnapshot.empty) {
          console.log("No active batches found")
          setUpcomingClasses([])
          setLoading(false)
          return
        }

        // Process each batch to extract upcoming class sessions
        const upcomingClassesList: BatchClass[] = []

        for (const batchDoc of batchesSnapshot.docs) {
          const batchData = batchDoc.data()

          // Skip batches with no sessions
          if (!batchData.sessions || !Array.isArray(batchData.sessions) || batchData.sessions.length === 0) {
            continue
          }

          // Get teacher info
          const teacherInfo = {
            id: batchData.teacherIds?.[0] || "unknown",
            name: batchData.teacherNames?.[0] || "Unknown Teacher",
            avatar: undefined,
          }

          // Process each session in the batch
          for (const session of batchData.sessions) {
            // Skip sessions without required data
            if (!session.day || !session.startTime || !session.endTime) {
              continue
            }

            // Calculate the next occurrence of this session
            const nextSessionDate = getNextDayOccurrence(session.day, batchData.startDate)

            // Skip if the next occurrence is before today or after the batch end date
            if (
              !nextSessionDate ||
              nextSessionDate < now ||
              (batchData.endDate && nextSessionDate > new Date(batchData.endDate))
            ) {
              continue
            }

            // Format date string
            const dateString = formatDate(nextSessionDate)

            // Add to upcoming classes
            upcomingClassesList.push({
              id: `${batchDoc.id}-${session.day}-${session.startTime}`,
              batchName: batchData.name || "Unknown Batch",
              courseId: batchData.courseId || "",
              courseName: batchData.courseName || "Unknown Course",
              day: capitalizeFirstLetter(session.day),
              date: dateString,
              time: `${formatTimeString(session.startTime)} - ${formatTimeString(session.endTime)}`,
              startTime: session.startTime,
              endTime: session.endTime,
              teacher: teacherInfo,
            })
          }
        }

        // Sort by date and time
        upcomingClassesList.sort((a, b) => {
          const dateA = getNextDayOccurrence(a.day.toLowerCase(), null)
          const dateB = getNextDayOccurrence(b.day.toLowerCase(), null)

          if (!dateA || !dateB) return 0

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime()
          }

          return a.startTime.localeCompare(b.startTime)
        })

        // Limit to 10 upcoming classes
        setUpcomingClasses(upcomingClassesList.slice(0, 10))
      } catch (err) {
        console.error("Error fetching upcoming classes:", err)
        setError("Failed to load upcoming classes")
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingClasses()
  }, [])

  // Helper function to get the next occurrence of a day
  function getNextDayOccurrence(day: string, startDateStr: string | null): Date | null {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const dayIndex = daysOfWeek.indexOf(day.toLowerCase())

    if (dayIndex === -1) return null

    const today = new Date()
    const startDate = startDateStr ? new Date(startDateStr) : null

    // If we have a start date and it's in the future, use that as our reference
    const referenceDate = startDate && startDate > today ? startDate : today

    const resultDate = new Date(referenceDate)
    resultDate.setHours(0, 0, 0, 0)

    // Calculate days to add
    const currentDayIndex = referenceDate.getDay()
    let daysToAdd = dayIndex - currentDayIndex

    if (daysToAdd < 0) {
      daysToAdd += 7
    } else if (daysToAdd === 0 && referenceDate.getHours() >= 12) {
      // If it's the same day but past noon, move to next week
      daysToAdd = 7
    }

    resultDate.setDate(resultDate.getDate() + daysToAdd)
    return resultDate
  }

  // Helper function to format date
  function formatDate(date: Date): string {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    if (dateOnly.getTime() === today.getTime()) {
      return "Today"
    }

    if (dateOnly.getTime() === tomorrow.getTime()) {
      return "Tomorrow"
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Helper function to format time string (convert 24h to 12h format)
  function formatTimeString(timeStr: string): string {
    const [hours, minutes] = timeStr.split(":").map(Number)

    if (isNaN(hours) || isNaN(minutes)) {
      return timeStr
    }

    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Upcoming Classes</CardTitle>
          <CardDescription>All scheduled upcoming live sessions</CardDescription>
        </div>
        <Link href="/dashboard/admin/batches">
        <Button variant="ghost" size="sm" className="text-[#006400]">
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 py-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex animate-pulse items-center justify-between py-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="h-8 w-16 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-gray-500">{error}</div>
        ) : upcomingClasses.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No upcoming classes scheduled.</div>
        ) : (
          <div className="space-y-1">
            {upcomingClasses.map((classItem) => (
              <ClassItem key={classItem.id} {...classItem} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
