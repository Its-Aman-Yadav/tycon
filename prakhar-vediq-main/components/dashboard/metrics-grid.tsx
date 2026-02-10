"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { BookOpen, Calendar, GraduationCap, Users, Video, Clock, Check, X } from "lucide-react"
import { collection, getDocs, getFirestore, query, where, doc, updateDoc, Timestamp } from "firebase/firestore"
import { format } from "date-fns"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import app from "@/lib/firebase"

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  href?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

function MetricCard({ title, value, icon, href, trend, onClick }: MetricCardProps) {
  const cardContent = (
    <CardContent className="flex items-center gap-4 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f0e6]">
        <div className="text-[#006400]">{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </CardContent>
  )

  // If there's an onClick handler, use it (for the enrollment dialog)
  if (onClick) {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
        {cardContent}
      </Card>
    )
  }

  // Otherwise, use Link for navigation
  return (
    <Link href={href || "#"} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">{cardContent}</Card>
    </Link>
  )
}

interface EnrollmentRequest {
  id: string
  courseId: string
  userId: string
  userName?: string
  status: string
  createdAt: any
  courseTitle?: string
  courseThumbnail?: string
}

export function MetricsGrid() {
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    totalBatches: 0,
    totalStudents: 0,
    totalTeachers: 0,
    liveClassesToday: 0,
    pendingEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const { toast } = useToast()
  const db = getFirestore(app)

  useEffect(() => {
    fetchMetrics()
  }, [])

  async function fetchMetrics() {
    try {
      console.log("Starting to fetch metrics...")

      // Initialize Firebase
      console.log("Firebase initialized:", app.name)

      console.log("Firestore instance created")

      // Get total courses
      console.log("Fetching courses...")
      const coursesSnapshot = await getDocs(collection(db, "courses"))
      const totalCourses = coursesSnapshot.size
      console.log(`Found ${totalCourses} courses`)

      // Get total batches - Updated to fetch from batches collection
      console.log("Fetching batches...")
      const batchesSnapshot = await getDocs(collection(db, "batches"))
      const totalBatches = batchesSnapshot.size
      console.log(`Found ${totalBatches} batches`)

      // Get total students
      console.log("Fetching students...")
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))
      const studentsSnapshot = await getDocs(studentsQuery)
      const totalStudents = studentsSnapshot.size
      console.log(`Found ${totalStudents} students`)

      // Get total teachers
      console.log("Fetching teachers...")
      const teachersQuery = query(collection(db, "teachers"))
      const teachersSnapshot = await getDocs(teachersQuery)
      const totalTeachers = teachersSnapshot.size
      console.log(`Found ${totalTeachers} teachers`)

      // Get live classes today
      console.log("Fetching today's classes...")
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      console.log("Date range:", {
        today: today.toISOString(),
        tomorrow: tomorrow.toISOString(),
      })

      // Try a simpler query first to see if we can get any sessions
      const allSessions = await getDocs(collection(db, "sessions"))
      console.log(`Total sessions in database: ${allSessions.size}`)

      // Log a few session dates to check format
      allSessions.docs.slice(0, 3).forEach((doc) => {
        const data = doc.data()
        console.log("Session data sample:", {
          id: doc.id,
          startTime: data.startTime,
          endTime: data.endTime,
        })
      })

      // Now try the filtered query
      const todayClassesQuery = query(
        collection(db, "sessions"),
        where("startTime", ">=", today.toISOString()),
        where("startTime", "<", tomorrow.toISOString()),
      )

      const todayClasses = await getDocs(todayClassesQuery)
      const liveClassesToday = todayClasses.size
      console.log(`Found ${liveClassesToday} classes today`)

      // Get pending enrollments from the enrollmentRequests collection
      console.log("Fetching pending enrollments...")

      // First check if the collection exists
      const enrollmentRequestsRef = collection(db, "enrollmentRequests")

      // Query for pending enrollment requests
      const pendingEnrollmentsQuery = query(enrollmentRequestsRef, where("status", "==", "pending"))

      const pendingEnrollmentsSnapshot = await getDocs(pendingEnrollmentsQuery)
      const pendingEnrollments = pendingEnrollmentsSnapshot.size

      // Store the enrollment requests for later use
      const requests: EnrollmentRequest[] = await Promise.all(
        pendingEnrollmentsSnapshot.docs.map(async (doc) => {
          const data = doc.data()
          let userName = "Unknown User"

          try {
            // Fetch the user document to get the name
            const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", data.userId)))
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data()
              userName = userData.displayName || userData.fullName || userData.name || data.userId
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
          }

          return {
            id: doc.id,
            ...data,
            userName,
            createdAt: data.createdAt,
          } as EnrollmentRequest
        }),
      )

      setEnrollmentRequests(requests)

      console.log(`Found ${pendingEnrollments} pending enrollments`)

      // Log a few enrollment requests to verify data structure
      pendingEnrollmentsSnapshot.docs.slice(0, 3).forEach((doc) => {
        const data = doc.data()
        console.log("Enrollment request sample:", {
          id: doc.id,
          courseId: data.courseId,
          userId: data.userId,
          status: data.status,
          createdAt: data.createdAt,
        })
      })

      // Set the metrics state
      setMetrics({
        totalCourses,
        totalBatches,
        totalStudents,
        totalTeachers,
        liveClassesToday,
        pendingEnrollments,
      })

      console.log("Metrics updated successfully:", {
        totalCourses,
        totalBatches,
        totalStudents,
        totalTeachers,
        liveClassesToday,
        pendingEnrollments,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching metrics:", error)
      // Log more details about the error
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      setLoading(false)
    }
  }

  const handleOpenEnrollmentRequests = () => {
    setIsEnrollmentDialogOpen(true)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return format(timestamp.toDate(), "MMM d, yyyy h:mm a")
      }

      // Handle Date object or ISO string
      return format(new Date(timestamp), "MMM d, yyyy h:mm a")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const handleUpdateEnrollmentStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      setProcessingId(id)

      // Update the document in Firestore
      const enrollmentRef = doc(db, "enrollmentRequests", id)
      await updateDoc(enrollmentRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
        adminId: "admin123", // Replace with actual admin ID from auth
      })

      // Update local state - remove the request instead of updating its status
      setEnrollmentRequests((prev) => prev.filter((request) => request.id !== id))

      // Update metrics count
      setMetrics((prev) => ({
        ...prev,
        pendingEnrollments: prev.pendingEnrollments - 1,
      }))

      toast({
        title: `Request ${newStatus}`,
        description: `The enrollment request has been ${newStatus}.`,
        duration: 3000,
      })
    } catch (error) {
      console.error(`Error ${newStatus} enrollment:`, error)
      toast({
        title: "Error",
        description: `Failed to ${newStatus} the enrollment request.`,
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="flex h-[88px] items-center gap-4 p-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Courses"
          value={metrics.totalCourses}
          icon={<BookOpen className="h-6 w-6" />}
          href="/dashboard/admin/courses"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Total Batches"
          value={metrics.totalBatches}
          icon={<Calendar className="h-6 w-6" />}
          href="/dashboard/admin/batches"
        />
        <MetricCard
          title="Total Students"
          value={metrics.totalStudents.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          href="/dashboard/admin/students"
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Total Teachers"
          value={metrics.totalTeachers}
          icon={<GraduationCap className="h-6 w-6" />}
          href="/dashboard/admin/teachers"
        />
        <MetricCard
          title="Classes Today"
          value={metrics.liveClassesToday}
          icon={<Video className="h-6 w-6" />}
          href="/dashboard/admin/livesessions"
        />

        <MetricCard
          title="Pending Enrollments"
          value={metrics.pendingEnrollments}
          icon={<Clock className="h-6 w-6" />}
          trend={{ value: 15, isPositive: false }}
          onClick={handleOpenEnrollmentRequests}
        />
      </div>

      {/* Enrollment Requests Dialog */}
      <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Pending Enrollment Requests</DialogTitle>
            <DialogDescription>Review and manage student enrollment requests for your courses.</DialogDescription>
          </DialogHeader>

          {enrollmentRequests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No pending enrollment requests found.</div>
          ) : (
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.courseTitle || request.courseId}</TableCell>
                      <TableCell>{request.userName || request.userId}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() => handleUpdateEnrollmentStatus(request.id, "rejected")}
                            disabled={processingId === request.id}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateEnrollmentStatus(request.id, "approved")}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
