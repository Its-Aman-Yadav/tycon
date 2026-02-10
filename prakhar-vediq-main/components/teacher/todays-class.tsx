"use client"

import { useEffect, useState } from "react"
import { Clock, Video } from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"

// ===================== Interfaces =====================
interface Session {
  day: string
  startTime: string
  endTime: string
  recurring: boolean
}

interface Batch {
  id: string
  courseId: string
  courseName: string
  name: string
  mode: string
  sessions: Session[]
  teacherNames: string[]
  status: string
  roombrData?: {
    data?: {
      id?: string
      meeting_url?: {
        url?: string
      }
      invitation?: {
        meeting_url?: string
      }
    }
  }
  meetingUrl?: string | null
}

interface TodaysClassData {
  id: string
  course: string
  batch: string
  topic: string
  time: string
  meetingLink?: string | null
  startingSoon: boolean
  minutesUntilStart: number
  teacherName?: string
}

// ===================== Component =====================
export default function TodaysClass() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [todaysClass, setTodaysClass] = useState<TodaysClassData | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true)

        const teacherId = localStorage.getItem("teacherId")
        if (!teacherId) {
          setError("Teacher ID missing from localStorage.")
          return
        }

        const batchesRef = collection(db, "batches")
        const q = query(batchesRef, where("teacherIds", "array-contains", teacherId))
        const querySnapshot = await getDocs(q)

        const batches = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Batch[]

        // 📡 Fetch updated meeting URL via API
        const batchesWithMeetingUrls = await Promise.all(
          batches.map(async (batch) => {
            const roombrMeetingId = batch.roombrData?.data?.id
            if (roombrMeetingId) {
              try {
                const res = await fetch(`/api/roombr/get-meeting/${roombrMeetingId}`, { cache: 'no-store' })
                const data = await res.json()

                const meetingUrl =
                  data?.data?.meeting_url?.url ||
                  batch.roombrData?.data?.meeting_url?.url ||
                  null

                return {
                  ...batch,
                  meetingUrl,
                }
              } catch (err) {
                console.warn("Error fetching Roombr meeting:", err)
              }
            }
            return {
              ...batch,
              meetingUrl: batch.roombrData?.data?.meeting_url?.url || null,
            }
          })
        )


        const todayClass = findTodaysClass(batchesWithMeetingUrls)
        setTodaysClass(todayClass)
      } catch (err) {
        console.error("Error fetching batches:", err)
        setError("Failed to load class data.")
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [])

  console.log("Saved to localStorage:", localStorage.getItem("teacherId"));


  useEffect(() => {
    setMounted(true)
  }, [])



  // ===================== Utility Functions =====================
  const formatTimeUntilStart = (minutes: number): string => {
    if (minutes <= 0) return "In progress"
    if (minutes < 60) return `Starts in ${minutes} min`

    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes === 0
        ? `Starts in ${hours} ${hours === 1 ? "hour" : "hours"}`
        : `Starts in ${hours}h ${remainingMinutes}m`
    }

    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return remainingHours === 0
      ? `Starts in ${days} ${days === 1 ? "day" : "days"}`
      : `Starts in ${days}d ${remainingHours}h`
  }

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!todaysClass?.meetingLink) {
      e.preventDefault()
      toast({
        title: "Meeting link not found",
        description: "The meeting link for this class will be available before 10 mins of start time.",
        variant: "destructive",
      })
    }
  }

  // ===================== Core Logic =====================
  const findTodaysClass = (batches: Batch[]): TodaysClassData | null => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute

    const activeBatches = batches.filter(
      (batch) => batch.status?.toLowerCase() === "active"
    )

    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]
    const currentDayIndex = now.getDay()

    let nextClass: TodaysClassData | null = null
    let minMinutesUntilStart = Number.POSITIVE_INFINITY

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date(now)
      checkDate.setDate(now.getDate() + dayOffset)
      const checkDayIndex = checkDate.getDay()
      const checkDayName = daysOfWeek[checkDayIndex]

      for (const batch of activeBatches) {
        for (const session of batch.sessions || []) {
          if (session.day === checkDayName) {
            const [startHour, startMinute] = session.startTime.split(":").map(Number)
            const startTotalMinutes = startHour * 60 + startMinute

            let minutesUntilStart: number
            if (dayOffset === 0) {
              minutesUntilStart = startTotalMinutes - currentTotalMinutes
            } else {
              minutesUntilStart =
                dayOffset * 24 * 60 + startTotalMinutes - currentTotalMinutes
            }

            if (minutesUntilStart > -60 && minutesUntilStart < minMinutesUntilStart) {
              const meetingUrl = batch.meetingUrl // ✅ Use the enriched field

              if (!meetingUrl) {
                console.warn(`⚠️ No meeting URL found for batch: ${batch.name}`)
              }

              minMinutesUntilStart = minutesUntilStart
              nextClass = {
                id: batch.id,
                course: batch.courseName,
                batch: batch.name,
                topic: `${batch.courseName} Session`,
                time: `${session.startTime} - ${session.endTime}`,
                meetingLink: meetingUrl,
                startingSoon: minutesUntilStart <= 30 && minutesUntilStart > 0,
                minutesUntilStart,
                teacherName: batch.teacherNames?.[0] || "Instructor",

              }
              console.log("✅ Using final meeting URL:", meetingUrl)

            }
          }
        }
      }
    }

    return nextClass
  }

  // ===================== UI =====================
  if (!mounted || loading) {
    return (
      <section>
        <Card className="border-2 border-green-100 bg-green-50/30">
          <CardContent className="flex items-center justify-center p-6">
            <p>Loading class data...</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <Card className="border-2 border-red-100 bg-red-50/30">
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!todaysClass) {
    return (
      <section>
        <Card className="border-2 border-gray-100 bg-gray-50/30">
          <CardContent className="p-6">
            <p>No classes scheduled in the next 7 days.</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  const progressPercentage = Math.max(
    0,
    Math.min(100, 100 - (todaysClass.minutesUntilStart / 30) * 100)
  )

  return (
    <section>
      <Card className="border-2 border-green-100 bg-green-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006400]">
                <Video className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#006400]">Class</p>
                {todaysClass.startingSoon && (
                  <p className="text-xs font-medium text-red-500">Starting Soon!</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{todaysClass.time}</span>
            </div>
          </div>
          <CardTitle className="mt-2 text-xl">{todaysClass.topic}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm font-medium text-gray-700">
            {todaysClass.course} • {todaysClass.batch}
          </p>
          {todaysClass.teacherName && (
            <p className="mt-1 text-sm text-gray-600">
              Instructor: {todaysClass.teacherName}
            </p>
          )}
          <div className="mt-4 flex items-center">
            <div className="h-2 flex-1 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#006400]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs font-medium text-gray-500">
              {formatTimeUntilStart(todaysClass.minutesUntilStart)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          {todaysClass.meetingLink ? (
            <a
              href={todaysClass.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full bg-[#006400] hover:bg-[#004d00] sm:w-auto">
                Join to Teach
              </Button>
            </a>
          ) : (
            <Button
              className="w-full bg-[#006400] hover:bg-[#004d00] sm:w-auto opacity-80"
              onClick={handleJoinClick}
            >
              Join to Teach
            </Button>
          )}

          <Link href={`/dashboard/teacher/class/${todaysClass.id}`} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              View Class Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </section>
  )
}
