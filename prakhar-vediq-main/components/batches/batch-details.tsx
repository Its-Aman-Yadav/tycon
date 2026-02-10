"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, GraduationCap, Loader2, Users, Video, BookOpen, Mail, Phone, Calendar } from "lucide-react"
import { doc, getDoc, collection, query, where, getDocs, documentId } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Teacher {
  id: string
  name: string
  fullName?: string
  email?: string
  mobile?: string
  profilePictureURL?: string
  subjects?: string[]
  teacherType?: string
}

interface Student {
  id: string
  name: string
  email?: string
  profilePictureURL?: string
}

interface Session {
  day: string
  startTime: string
  endTime: string
  recurring: boolean
  date?: string
}

interface Batch {
  id: string
  name: string
  course: {
    id: string
    title: string
    description?: string
  }
  teachers: Teacher[]
  students: Student[]
  startDate: string
  endDate: string
  mode: "live" | "recorded" | "both"
  sessions: Session[]
  status: "active" | "upcoming" | "completed"
  description?: string
  createdAt?: string
}

interface BatchDetailsProps {
  batchId: string
}

export function BatchDetails({ batchId }: BatchDetailsProps) {
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Step 1: Fetch the batch document
        const batchDocRef = doc(db, "batches", batchId)
        const batchDocSnap = await getDoc(batchDocRef)

        if (!batchDocSnap.exists()) {
          setError("Batch not found")
          setLoading(false)
          return
        }

        const batchData = batchDocSnap.data()

        // Step 2: Fetch teacher details
        const teacherIds = batchData.teacherIds || []
        const teachers: Teacher[] = []

        if (teacherIds.length > 0) {
          // Process in chunks of 10 due to Firestore limitations
          for (let i = 0; i < teacherIds.length; i += 10) {
            const chunk = teacherIds.slice(i, i + 10)
            const teachersQuery = query(collection(db, "teachers"), where(documentId(), "in", chunk))
            const teachersSnapshot = await getDocs(teachersQuery)

            teachersSnapshot.forEach((doc) => {
              const teacherData = doc.data()
              teachers.push({
                id: doc.id,
                name: teacherData.fullName || teacherData.name || "Unknown Teacher",
                fullName: teacherData.fullName,
                email: teacherData.email,
                mobile: teacherData.mobile,
                profilePictureURL: teacherData.profilePictureURL,
                subjects: teacherData.subjects || [],
                teacherType: teacherData.teacherType,
              })
            })
          }
        }

        // Step 3: Fetch student details
        const studentIds = batchData.studentIds || []
        const students: Student[] = []

        if (studentIds.length > 0) {
          // Process in chunks of 10 due to Firestore limitations
          for (let i = 0; i < studentIds.length; i += 10) {
            const chunk = studentIds.slice(i, i + 10)
            const studentsQuery = query(collection(db, "students"), where(documentId(), "in", chunk))
            const studentsSnapshot = await getDocs(studentsQuery)

            studentsSnapshot.forEach((doc) => {
              const studentData = doc.data()
              students.push({
                id: doc.id,
                name: studentData.fullName || studentData.name || "Unknown Student",
                email: studentData.email,
                profilePictureURL: studentData.profilePictureURL,
              })
            })
          }
        }

        // Step 4: Fetch course details if needed
        let courseDetails = {
          id: batchData.courseId || "",
          title: batchData.courseName || "Unknown Course",
        }

        if (batchData.courseId) {
          const courseDocRef = doc(db, "courses", batchData.courseId)
          const courseDocSnap = await getDoc(courseDocRef)

          if (courseDocSnap.exists()) {
            const courseData = courseDocSnap.data()
            courseDetails = {
              id: batchData.courseId,
              title: courseData.title || batchData.courseName || "Unknown Course",
              description: courseData.description,
            }
          }
        }

        // Step 5: Determine batch status
        const today = new Date()
        const startDate = new Date(batchData.startDate)
        const endDate = new Date(batchData.endDate)

        let status: "active" | "upcoming" | "completed" = "active"
        if (today < startDate) {
          status = "upcoming"
        } else if (today > endDate) {
          status = "completed"
        }

        // Step 6: Assemble the complete batch object
        const completeBatch: Batch = {
          id: batchId,
          name: batchData.name || "Unnamed Batch",
          course: courseDetails,
          teachers,
          students,
          startDate: batchData.startDate || "",
          endDate: batchData.endDate || "",
          mode: batchData.mode || "live",
          sessions: batchData.sessions || [],
          status: batchData.status || status,
          description: batchData.description,
          createdAt: batchData.createdAt?.toDate?.()?.toISOString() || "",
        }

        setBatch(completeBatch)
      } catch (err) {
        console.error("Error fetching batch details:", err)
        setError("Failed to load batch details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (batchId) {
      fetchBatchDetails()
    }
  }, [batchId])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDay = (day: string) => {
    const days: Record<string, string> = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    }
    return days[day.toLowerCase()] || day
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading batch details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800 shadow-sm">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-amber-800 shadow-sm">
        <p>Batch not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with back button and actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full border-slate-200 shadow-sm transition-all hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{batch.name}</h1>
              <Badge
                className={`px-2.5 py-0.5 text-xs font-medium ${
                  batch.status === "active"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : batch.status === "upcoming"
                      ? "bg-sky-50 text-sky-600 border-sky-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{batch.course.title}</p>
          </div>
        </div>

        {/* Batch overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column - Batch info */}
          <div className="space-y-6 md:col-span-2">
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <CardTitle className="text-lg font-medium text-slate-900">Batch Overview</CardTitle>
                <CardDescription>Key information about this batch</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-500">Course</h3>
                    <p className="font-medium text-slate-900">{batch.course.title}</p>
                    {batch.course.description && (
                      <p className="mt-1 text-sm text-slate-500">{batch.course.description}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-500">Mode</h3>
                    <div className="flex items-center">
                      <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                        <Video className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="font-medium text-slate-900">
                        {batch.mode === "live"
                          ? "Live Classes"
                          : batch.mode === "recorded"
                            ? "Recorded"
                            : "Live & Recorded"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-500">Duration</h3>
                    <div className="flex items-center">
                      <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                        <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <span className="font-medium text-slate-900">
                        {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-500">Teachers</h3>
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        {batch.teachers.slice(0, 3).map((teacher) => (
                          <Tooltip key={teacher.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-slate-100">
                                {teacher.profilePictureURL ? (
                                  <AvatarImage
                                    src={teacher.profilePictureURL || "/placeholder.svg"}
                                    alt={teacher.name}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                    }}
                                  />
                                ) : null}
                                <AvatarFallback className="bg-sky-100 text-sky-600 text-xs">
                                  {teacher.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm font-medium">{teacher.name}</div>
                              {teacher.subjects && teacher.subjects.length > 0 && (
                                <div className="text-xs text-slate-500">{teacher.subjects.join(", ")}</div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {batch.teachers.length > 3 && (
                          <Avatar className="h-7 w-7 border-2 border-white bg-slate-100 ring-1 ring-slate-100">
                            <AvatarFallback className="text-xs text-slate-500">
                              +{batch.teachers.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{batch.teachers.length} assigned</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-500">Students</h3>
                    <div className="flex items-center">
                      <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-violet-100">
                        <Users className="h-3.5 w-3.5 text-violet-600" />
                      </div>
                      <span className="font-medium text-slate-900">{batch.students.length} enrolled</span>
                    </div>
                  </div>
                </div>

                {batch.description && (
                  <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-slate-700">Description</h3>
                    <p className="text-sm text-slate-600">{batch.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <CardTitle className="text-lg font-medium text-slate-900">Class Schedule</CardTitle>
                <CardDescription>Upcoming and past sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {batch.sessions.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-slate-200">
                    <p className="text-sm text-slate-500">No sessions scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {batch.sessions.map((session, index) => (
                      <div
                        key={index}
                        className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{formatDay(session.day)}</p>
                              <div className="flex items-center text-sm text-slate-500">
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                <span>
                                  {session.startTime} - {session.endTime}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              session.recurring
                                ? "border-sky-200 bg-sky-50 text-sky-600"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }
                          >
                            {session.recurring ? "Recurring" : "One-time"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Teachers and quick stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <CardTitle className="text-lg font-medium text-slate-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-slate-100">
                  <div className="flex items-center p-6">
                    <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{batch.students.length}</p>
                      <p className="text-sm text-slate-500">Students Enrolled</p>
                    </div>
                  </div>

                  <div className="flex items-center p-6">
                    <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
                      <GraduationCap className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{batch.teachers.length}</p>
                      <p className="text-sm text-slate-500">Teachers Assigned</p>
                    </div>
                  </div>

                  <div className="flex items-center p-6">
                    <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{batch.sessions.length}</p>
                      <p className="text-sm text-slate-500">Sessions Scheduled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Details */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <CardTitle className="text-lg font-medium text-slate-900">Teachers</CardTitle>
                <CardDescription>Assigned to this batch</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {batch.teachers.length === 0 ? (
                  <div className="flex h-24 items-center justify-center">
                    <p className="text-sm text-slate-500">No teachers assigned</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {batch.teachers.map((teacher) => (
                      <div key={teacher.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10 border border-slate-200">
                            {teacher.profilePictureURL ? (
                              <AvatarImage
                                src={teacher.profilePictureURL || "/placeholder.svg"}
                                alt={teacher.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"
                                }}
                              />
                            ) : null}
                            <AvatarFallback className="bg-sky-100 text-sky-600">
                              {teacher.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-slate-900">{teacher.name}</p>
                            {teacher.teacherType && (
                              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                                {teacher.teacherType}
                              </Badge>
                            )}
                            {teacher.subjects && teacher.subjects.length > 0 && (
                              <p className="text-xs text-slate-500">{teacher.subjects.join(", ")}</p>
                            )}

                            {/* Teacher contact information */}
                            <div className="flex flex-wrap gap-3 pt-1">
                              {teacher.email && (
                                <a
                                  href={`mailto:${teacher.email}`}
                                  className="inline-flex items-center text-xs text-sky-600 hover:text-sky-700 hover:underline"
                                >
                                  <Mail className="mr-1 h-3 w-3" />
                                  {teacher.email}
                                </a>
                              )}
                              {teacher.mobile && (
                                <a
                                  href={`tel:${teacher.mobile}`}
                                  className="inline-flex items-center text-xs text-sky-600 hover:text-sky-700 hover:underline"
                                >
                                  <Phone className="mr-1 h-3 w-3" />
                                  {teacher.mobile}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Students Section */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-slate-900">Students</CardTitle>
                <CardDescription>Students enrolled in this batch</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {batch.students.length === 0 ? (
              <div className="flex h-24 items-center justify-center">
                <p className="text-sm text-slate-500">No students enrolled</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batch.students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 border border-slate-200">
                              {student.profilePictureURL ? (
                                <AvatarImage
                                  src={student.profilePictureURL || "/placeholder.svg"}
                                  alt={student.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                              ) : null}
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{student.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
