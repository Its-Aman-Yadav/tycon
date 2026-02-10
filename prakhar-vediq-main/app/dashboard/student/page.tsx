"use client"

import type React from "react"
import Link from "next/link"
import { Search, Book, FileText, Calendar, CheckCircle, HelpCircle, ChevronRight, Clock, Video } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  type: string
  duration: number
  progress?: number
  currentChapter?: string
  thumbnailUrl?: string
}

interface EnrollmentRequest {
  id: string
  courseId: string
  userId: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  courseTitle: string
  courseThumbnail?: string
  progress?: number
  currentChapter?: string
}

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
  startDate: string
  endDate: string
  createdAt?: any
  scheduleFormat?: string
  sendReminders?: boolean
}

interface TodaysClassData {
  id: string
  course: string
  batch: string
  topic: string
  time: string
  meetingLink?: string
  startingSoon: boolean
  minutesUntilStart: number
  teacherName?: string
}

export default function StudentDashboard() {
  // State for user and data
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(true)
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string>("Student")
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0)
  const [todaysClass, setTodaysClass] = useState<TodaysClassData | null>(null)
  const [classLoading, setClassLoading] = useState<boolean>(true)
  const [mounted, setMounted] = useState(false)

  // Mock data for other dashboard elements
  const summaryData = [
    {
      icon: <Book className="h-6 w-6 text-[#006400]" />,
      title: "Courses Enrolled",
      value: enrolledCourses.length.toString(),
      link: "/dashboard/student/courses",
    },
    {
      icon: <FileText className="h-6 w-6 text-[#006400]" />,
      title: "Pending Assignments",
      value: "Coming Soon",
      link: "/dashboard/student",
    },
    {
      icon: <Calendar className="h-6 w-6 text-[#006400]" />,
      title: "Next Live Class",
      value: todaysClass ? "Available" : "None",
      link: "/dashboard/student",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-[#006400]" />,
      title: "Attendance",
      value: "Coming Soon",
      link: "/dashboard/student",
    },
  ]

  const navigationTiles = [
    {
      icon: <Book className="h-8 w-8" />,
      title: "My Courses",
      link: "/dashboard/student/courses",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Assignments",
      link: "/dashboard/student/assignments",
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Explore Courses",
      link: "/dashboard/student/explore",
    },
  ]

  // Get current user from Firebase Auth and fetch user data
  useEffect(() => {
    setMounted(true)
    const studentEmail = localStorage.getItem("studentEmail")

    if (!studentEmail) {
      setCurrentUserId(null)
      setStudentName("Student")
      setError("You must be logged in to view your dashboard")
      setAuthLoading(false)
      return
    }

    const fetchStudentData = async () => {
      try {
        const studentQuery = query(collection(db, "students"), where("email", "==", studentEmail))
        const snapshot = await getDocs(studentQuery)

        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          const data = doc.data()
          setCurrentUserId(doc.id)
          setStudentName(data.fullName || "Student")
        } else {
          setError("Student not found.")
        }
      } catch (err) {
        console.error("Error fetching student data:", err)
        setError("Failed to fetch student details.")
      } finally {
        setAuthLoading(false)
      }
    }

    fetchStudentData()
  }, [])


  // Fetch enrolled courses from Firestore based on enrollment requests
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!currentUserId || authLoading) return

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true)
        // Fetch enrollment requests for the current user that are approved
        const enrollmentRequestsRef = collection(db, "enrollmentRequests")
        const enrollmentQuery = query(
          enrollmentRequestsRef,
          where("userId", "==", currentUserId),
          where("status", "==", "approved"),
        )
        const enrollmentSnapshot = await getDocs(enrollmentQuery)

        if (enrollmentSnapshot.empty) {
          // No enrolled courses found
          setEnrolledCourses([])
          setLoading(false)
          return
        }

        // Process enrollment requests
        const enrollmentRequests: EnrollmentRequest[] = []
        enrollmentSnapshot.forEach((doc) => {
          const data = doc.data()
          enrollmentRequests.push({
            id: doc.id,
            courseId: data.courseId,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            courseTitle: data.courseTitle || "Unknown Course",
            courseThumbnail: data.courseThumbnail,
            progress: data.progress || Math.floor(Math.random() * 100),
            currentChapter: data.currentChapter || `Chapter ${Math.floor(Math.random() * 10) + 1}: Topic`,
          })
        })

        // Fetch full course details for each enrollment
        const coursesPromises = enrollmentRequests.map(async (request) => {
          try {
            const courseDoc = await getDocs(query(collection(db, "courses"), where("__name__", "==", request.courseId)))
            if (!courseDoc.empty) {
              const courseData = courseDoc.docs[0].data()
              return {
                id: request.courseId,
                title: courseData.title || request.courseTitle,
                description: courseData.description || "",
                category: courseData.category || "",
                level: courseData.level || "beginner",
                type: courseData.type || "recorded",
                duration: courseData.duration || 0,
                progress: request.progress,
                currentChapter: request.currentChapter,
                thumbnailUrl: courseData.thumbnailUrl || request.courseThumbnail,
              }
            } else {
              // Fallback to enrollment request data if course not found
              return {
                id: request.courseId,
                title: request.courseTitle,
                description: "",
                category: "",
                level: "beginner",
                type: "recorded",
                duration: 0,
                progress: request.progress,
                currentChapter: request.currentChapter,
                thumbnailUrl: request.courseThumbnail,
              }
            }
          } catch (err) {
            console.error(`Error fetching course ${request.courseId}:`, err)
            // Return basic course info if there's an error
            return {
              id: request.courseId,
              title: request.courseTitle,
              description: "",
              category: "",
              level: "beginner",
              type: "recorded",
              duration: 0,
              progress: request.progress,
              thumbnailUrl: request.courseThumbnail,
            }
          }
        })

        const courses = await Promise.all(coursesPromises)
        setEnrolledCourses(courses)
      } catch (err) {
        console.error("Error fetching enrolled courses:", err)
        setError("Failed to load your enrolled courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    const fetchTotalCoursesCount = async () => {
      try {
        const coursesRef = collection(db, "courses")
        const coursesSnapshot = await getDocs(coursesRef)
        setTotalCoursesCount(coursesSnapshot.size)
      } catch (err) {
        console.error("Error fetching total courses count:", err)
      }
    }

    fetchEnrolledCourses()
    fetchTotalCoursesCount()
  }, [currentUserId, authLoading])

  // Fetch today's class data with enhanced logic
  useEffect(() => {
    if (!currentUserId || authLoading) return

    const fetchTodaysClass = async () => {
      try {
        setClassLoading(true)
        const batchesCollection = collection(db, "batches")
        const batchesSnapshot = await getDocs(batchesCollection)
        const batchesData = batchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Batch[]

        // Show all active batches instead of filtering by enrollment
        const activeBatches = batchesData.filter((batch) => batch.status === "active")

        // Find today's class from all active batches
        const todayClass = findTodaysClass(activeBatches)
        setTodaysClass(todayClass)
      } catch (err) {
        console.error("Error fetching batches:", err)
      } finally {
        setClassLoading(false)
      }
    }

    fetchTodaysClass()
  }, [currentUserId, authLoading])

  // Enhanced findTodaysClass function with better logic
  const findTodaysClass = (batches: Batch[]): TodaysClassData | null => {
    // Get current date and time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute

    // Get today's date in YYYY-MM-DD format
    const today = now.toISOString().split("T")[0]

    // Filter batches that are currently active and within date range
    const activeBatches = batches.filter((batch) => {
      // Check if batch is active
      if (batch.status !== "active") return false

      // Check if today is within the batch date range
      const startDate = batch.startDate
      const endDate = batch.endDate

      if (startDate && endDate) {
        return today >= startDate && today <= endDate
      }

      return batch.status === "active"
    })

    // Days of the week in order
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    let nextClass: TodaysClassData | null = null
    let minMinutesUntilStart = Number.POSITIVE_INFINITY

    // Check for classes in the next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDate = new Date(now)
      checkDate.setDate(now.getDate() + dayOffset)
      const checkDayIndex = checkDate.getDay()
      const checkDayName = daysOfWeek[checkDayIndex]

      // Get the date string for the day we're checking
      const checkDateString = checkDate.toISOString().split("T")[0]

      for (const batch of activeBatches) {
        // Additional check: ensure the check date is within batch range
        if (batch.startDate && batch.endDate) {
          if (checkDateString < batch.startDate || checkDateString > batch.endDate) {
            continue
          }
        }

        for (const session of batch.sessions) {
          if (session.day === checkDayName) {
            // Parse session time
            const [startHour, startMinute] = session.startTime.split(":").map(Number)
            const startTotalMinutes = startHour * 60 + startMinute

            let minutesUntilStart: number

            if (dayOffset === 0) {
              // Today - calculate from current time
              minutesUntilStart = startTotalMinutes - currentTotalMinutes
            } else {
              // Future days - add full days plus time difference
              minutesUntilStart = dayOffset * 24 * 60 + startTotalMinutes - currentTotalMinutes
            }

            // Only consider future classes or classes that started less than 60 minutes ago
            if (minutesUntilStart > -60 && minutesUntilStart < minMinutesUntilStart) {
              minMinutesUntilStart = minutesUntilStart
              nextClass = {
                id: batch.id,
                course: batch.courseName,
                batch: batch.name,
                topic: `${batch.courseName} Session`,
                time: `${session.startTime} - ${session.endTime}`,
                meetingLink: batch.meetingLink,
                startingSoon: minutesUntilStart <= 30 && minutesUntilStart > 0,
                minutesUntilStart: minutesUntilStart,
                teacherName: batch.teacherNames?.[0] || "Instructor",
              }
            }
          }
        }
      }
    }
    return nextClass
  }

  const formatTimeUntilStart = (minutes: number): string => {
    if (minutes <= 0) {
      return "In progress"
    } else if (minutes < 60) {
      return `Starts in ${minutes} min`
    } else if (minutes < 1440) {
      // Less than 24 hours
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `Starts in ${hours} ${hours === 1 ? "hour" : "hours"}`
      } else {
        return `Starts in ${hours}h ${remainingMinutes}m`
      }
    } else {
      // 24 hours or more
      const days = Math.floor(minutes / 1440)
      const remainingHours = Math.floor((minutes % 1440) / 60)
      if (remainingHours === 0) {
        return `Starts in ${days} ${days === 1 ? "day" : "days"}`
      } else {
        return `Starts in ${days}d ${remainingHours}h`
      }
    }
  }

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!todaysClass?.meetingLink) {
      e.preventDefault()
      toast({
        title: "Meeting link not found",
        description: "The meeting link for this class is not available.",
        variant: "destructive",
      })
    }
  }

  // Use a consistent loading message to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hi {studentName} 👋</h1>
            <p className="text-gray-500">Welcome back to your learning dashboard</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto"></div>
        </header>

        {/* Summary Cards Row */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryData.map((item, index) => (
              <Link href={item.link} key={index}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-full">{item.icon}</div>
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      <p className="text-xl font-semibold">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Continue Learning Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">📖 Continue Learning</h2>
            <Link href="/dashboard/student/courses" className="text-[#006400] text-sm font-medium flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Loading your courses...</p>
            </div>
          ) : error ? (
            <Card className="border-gray-200 p-6 text-center">
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          ) : enrolledCourses.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="min-w-[280px] w-[280px] flex-shrink-0 border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                        <img
                          src={course.thumbnailUrl || "/placeholder.svg?height=128&width=280&query=course thumbnail"}
                          alt={`${course.title} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <div className="flex items-center">
                            <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                              {course.level}
                            </Badge>
                            {course.type && (
                              <Badge variant="secondary" className="bg-white/90 text-black text-xs ml-1">
                                {course.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg truncate" title={course.title}>{course.title}</h3>
                    </div>
                    <Link href={`/dashboard/student/courses/${course.id}`}>
                      <Button className="w-full bg-[#006400] hover:bg-[#005000] text-white">Resume</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-gray-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No enrolled courses yet</h3>
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
              <Link href="/dashboard/student/explore">
                <Button className="bg-[#006400] hover:bg-[#005000] text-white">Explore Courses</Button>
              </Link>
            </Card>
          )}
        </section>

        {/* Quick Navigation Tiles */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {navigationTiles.map((tile, index) => (
              <Link href={tile.link} key={index}>
                <Card className="border-gray-200 hover:shadow-md transition-shadow hover:border-[#006400]/20">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                    <div className="bg-green-50 p-3 rounded-full mb-2 text-[#006400]">{tile.icon}</div>
                    <p className="font-medium">{tile.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Mobile Help Button (visible only on mobile) */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Link href="/student/help">
            <Button size="icon" className="h-12 w-12 rounded-full bg-[#006400] hover:bg-[#005000] shadow-lg">
              <HelpCircle className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
