"use client"

import type React from "react"
import Link from "next/link"
import { Calendar, Clock, Video } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

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
  meetingLink?: string
  studentIds: string[]
  students?: { email: string; id: string; name: string }[]
  joinedStudents?: string[]
  startDate: string
  endDate: string
  createdAt?: any
  scheduleFormat?: string
  sendReminders?: boolean
  recordingUrl?: string
  roombrData?: {
    data?: {
      id?: string
      start_date?: string
      end_date?: string
      title?: string
      invitation?: { meeting_url?: string }
    }
  }
}

interface ClassData {
  id: string
  course: string
  batch: string
  topic: string
  time: string
  date: string
  meetingUrl?: string
  meetingLink?: string
  recordingUrl?: string
  startingSoon: boolean
  minutesUntilStart: number
  teacherName?: string
}

interface LiveClassesProps {
  title?: string
  showTitle?: boolean
  className?: string
  cardClassName?: string
}

const handleJoinAndTrack = async (cls: ClassData) => {
  const user = localStorage.getItem("studentEmail")
  if (!user) {
    toast({
      title: "You must be logged in",
      description: "Please login to join the class.",
      variant: "destructive",
    })
    return
  }

  try {
    const batchRef = doc(db, "batches", cls.id)
    await updateDoc(batchRef, {
      joinedStudents: arrayUnion(user),
    })
    window.open(cls.meetingUrl, "_blank")
  } catch (error) {
    console.error("Failed to mark attendance:", error)
    toast({
      title: "Error joining class",
      description: "Unable to update attendance. Try again.",
      variant: "destructive",
    })
  }
}

export default function LiveClasses({
  title = "📺 Live Classes",
  showTitle = true,
  className = "",
  cardClassName = "",
}: LiveClassesProps) {
  const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([])
  const [pastClasses, setPastClasses] = useState<ClassData[]>([])
  const [classLoading, setClassLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassLoading(true)

        const studentEmail = localStorage.getItem("studentEmail")
        if (!studentEmail) {
          console.warn("No student email found in localStorage")
          setClassLoading(false)
          return
        }

        const snapshot = await getDocs(collection(db, "batches"))
        const allBatches = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Batch[]

        const studentBatches = allBatches.filter((batch) =>
          batch.students?.some((s) => s.email === studentEmail) ||
          batch.joinedStudents?.includes(studentEmail)
        )

        const now = dayjs().tz("Asia/Kolkata")
        const upcoming: ClassData[] = []
        const past: ClassData[] = []

        for (const batch of studentBatches) {
          const meetingId = batch?.roombrData?.data?.id
          if (!meetingId) continue

          try {
            const res = await fetch(`/api/roombr/get-meeting/${meetingId}`)
            const json = await res.json()

            const startIST = dayjs.utc(batch.roombrData?.data?.start_date).tz("Asia/Kolkata")
            const endIST = dayjs.utc(batch.roombrData?.data?.end_date).tz("Asia/Kolkata")
            const minutesUntilStart = startIST.diff(now, "minute")

            const meetingUrl =
              json?.data?.invitation?.meeting_url ||
              json?.data?.meeting_url?.url ||
              batch?.roombrData?.data?.invitation?.meeting_url

            const classData: ClassData = {
              id: batch.id,
              course: batch.courseName,
              batch: batch.name,
              topic: batch.roombrData?.data?.title || `${batch.courseName} Session`,
              time: `${startIST.format("hh:mm A")} - ${endIST.format("hh:mm A")}`,
              date: `${startIST.format("DD MMM YYYY")}`,
              meetingUrl,
              meetingLink: batch.meetingLink,
              recordingUrl: batch.recordingUrl || "",
              startingSoon: minutesUntilStart <= 30 && minutesUntilStart > 0,
              minutesUntilStart,
              teacherName: batch.teacherNames?.[0] || "Instructor",
            }

            if (minutesUntilStart >= -60 && minutesUntilStart <= 7 * 24 * 60) {
              upcoming.push(classData)
            } else if (minutesUntilStart < -60) {
              past.push(classData)
            }
          } catch (err) {
            console.error("Roombr fetch error:", err)
          }
        }

        setUpcomingClasses(upcoming.sort((a, b) => a.minutesUntilStart - b.minutesUntilStart))
        setPastClasses(past.sort((a, b) => b.minutesUntilStart - a.minutesUntilStart))
      } catch (err) {
        console.error("Batch fetch error:", err)
      } finally {
        setClassLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    toast({
      title: "Meeting link not found",
      description: "The meeting link will be available 10 minutes before class.",
      variant: "destructive",
    })
  }

  const handleViewRecording = (cls: ClassData) => {
    if (cls.recordingUrl) {
      window.open(cls.recordingUrl, "_blank")
    } else {
      toast({
        title: "Recording not available yet",
        description: "The instructor hasn't uploaded this class recording.",
        variant: "destructive",
      })
    }
  }

  const renderClassCard = (cls: ClassData, isPast = false) => (
    <Card
      key={cls.id}
      className={`mb-6 border-2 ${
        isPast ? "border-gray-200 bg-gray-50" : "border-green-100 bg-green-50/30"
      } ${cardClassName}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#006400]">
              <Video className="h-4 w-4 text-white" />
            </div>
            <div>
              {!isPast && <p className="text-sm font-medium text-[#006400]">Live Class</p>}
              {cls.startingSoon && !isPast && (
                <p className="text-xs font-medium text-red-500">Starting Soon!</p>
              )}
            </div>
          </div>
          <div className="flex flex-col text-sm text-gray-500 items-end">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{cls.time}</span>
            </div>
            <span>{cls.date}</span>
          </div>
        </div>
        <CardTitle className="mt-2 text-xl">{cls.topic}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-gray-700">
          {cls.course} • {cls.batch}
        </p>
        {cls.teacherName && <p className="mt-1 text-sm text-gray-600">Instructor: {cls.teacherName}</p>}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        {isPast ? (
          <Button
            className={`w-full sm:w-auto ${
              cls.recordingUrl
                ? "bg-[#006400] hover:bg-[#004d00] text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
            onClick={() => handleViewRecording(cls)}
          >
            View Recording
          </Button>
        ) : cls.meetingUrl && cls.minutesUntilStart <= 10 ? (
          <Button
            className="w-full bg-[#006400] hover:bg-[#004d00] sm:w-auto"
            onClick={() => handleJoinAndTrack(cls)}
          >
            Join Now
          </Button>
        ) : (
          <Button
            className="w-full bg-[#006400] hover:bg-[#004d00] sm:w-auto opacity-80"
            onClick={handleJoinClick}
          >
            Join Class
          </Button>
        )}

        <Link href={`/dashboard/student/class/${cls.id}`}>
          <Button variant="outline" className="w-full sm:w-auto">
            View Class Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )

  return (
    <section className={className}>
      {showTitle && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

      {classLoading ? (
        <Card className={`border-2 border-green-100 bg-green-50/30 ${cardClassName}`}>
          <CardContent className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent"></div>
            <p className="ml-4">Loading class data...</p>
          </CardContent>
        </Card>
      ) : upcomingClasses.length === 0 && pastClasses.length === 0 ? (
        <Card className={`border-2 border-gray-100 bg-gray-50/30 ${cardClassName}`}>
          <CardContent className="p-6 text-center">
            <Calendar className="h-10 w-10 text-gray-400 mb-3 mx-auto" />
            <h3 className="font-semibold text-lg mb-2">No upcoming live classes</h3>
            <p className="text-gray-500 mb-4">
              There are no upcoming or past classes scheduled within the last 7 days.
            </p>
            <Link href="/dashboard/student/courses">
              <Button className="bg-[#006400] hover:bg-[#005000] text-white">Explore Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcomingClasses.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-2 text-[#006400]">Upcoming Live Classes</h3>
              {upcomingClasses.map((cls) => renderClassCard(cls))}
            </>
          )}
          {pastClasses.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mt-8 mb-2 text-gray-700">🕘 Past Classes</h3>
              {pastClasses.map((cls) => renderClassCard(cls, true))}
            </>
          )}
        </>
      )}
    </section>
  )
}
