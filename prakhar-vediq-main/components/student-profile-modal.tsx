"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, BookOpen, Clock, GraduationCap, Mail, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StudentProfileModalProps {
  studentId: string | null
  isOpen: boolean
  onClose: () => void
}

interface CourseEnrollment {
  id: string
  courseId: string
  courseName: string
  enrolledAt: Date | null
}

interface StudentProfile {
  id: string
  name: string
  email: string
  enrollmentDate: Date | null
  lastLogin: Date | null
  coursesEnrolled: number
  status: "active" | "inactive" | "suspended"
  courses: CourseEnrollment[]
}

export function StudentProfileModal({ studentId, isOpen, onClose }: StudentProfileModalProps) {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<StudentProfile | null>(null)

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentProfile(studentId)
    }
  }, [isOpen, studentId])

  const fetchStudentProfile = async (id: string) => {
    setLoading(true)
    try {
      // Fetch student data
      const studentDoc = await getDoc(doc(db, "users", id))

      if (!studentDoc.exists()) {
        console.error("Student not found")
        return
      }

      const studentData = studentDoc.data()

      // Convert timestamps
      const createdAt = studentData.createdAt
        ? typeof studentData.createdAt === "string"
          ? new Date(studentData.createdAt)
          : studentData.createdAt.toDate()
        : null

      const lastLogin = studentData.lastLogin
        ? typeof studentData.lastLogin === "string"
          ? new Date(studentData.lastLogin)
          : studentData.lastLogin.toDate()
        : null

      // Determine status
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      let status = studentData.status || "active"
      if (status !== "suspended" && lastLogin && lastLogin < sevenDaysAgo) {
        status = "inactive"
      }

      // Fetch course enrollments
      const enrollmentsQuery = query(collection(db, "course_enrollments"), where("studentId", "==", id))
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)

      // Create array to store course enrollments with course details
      const coursePromises = enrollmentsSnapshot.docs.map(async (enrollDoc) => {
        const enrollData = enrollDoc.data()

        // Fetch course details
        let courseName = "Unknown Course"
        try {
          const courseDoc = await getDoc(doc(db, "courses", enrollData.courseId))
          if (courseDoc.exists()) {
            courseName = courseDoc.data().title || courseName
          }
        } catch (error) {
          console.error("Error fetching course:", error)
        }

        // Convert enrollment timestamp
        const enrolledAt = enrollData.enrolledAt
          ? typeof enrollData.enrolledAt === "string"
            ? new Date(enrollData.enrolledAt)
            : enrollData.enrolledAt.toDate()
          : null

        return {
          id: enrollDoc.id,
          courseId: enrollData.courseId,
          courseName,
          enrolledAt,
        }
      })

      // Wait for all course details to be fetched
      const courses = await Promise.all(coursePromises)

      // Set student profile data
      setStudent({
        id,
        name: studentData.name || "Unknown",
        email: studentData.email || "No email",
        enrollmentDate: createdAt,
        lastLogin,
        coursesEnrolled: courses.length,
        status,
        courses,
      })
    } catch (error) {
      console.error("Error fetching student profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return format(date, "PPP")
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return "N/A"
    return format(date, "PPP p")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : student ? (
          <>
            <DialogHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/abstract-geometric-shapes.png?height=64&width=64&query=${student.name}`} />
                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{student.name}</DialogTitle>
                  <DialogDescription className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {student.email}
                  </DialogDescription>
                </div>
                <div className="ml-auto">{getStatusBadge(student.status)}</div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Enrolled Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Student ID:</span>
                        <span className="text-sm font-medium">{student.id.substring(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(student.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Joined:</span>
                        <span className="text-sm font-medium flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(student.enrollmentDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Login:</span>
                        <span className="text-sm font-medium flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDateTime(student.lastLogin)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Course Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Courses:</span>
                        <span className="text-sm font-medium flex items-center">
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          {student.coursesEnrolled}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">First Enrolled:</span>
                        <span className="text-sm font-medium">
                          {student.courses.length > 0
                            ? formatDate(
                                student.courses.reduce(
                                  (earliest, course) =>
                                    !earliest || (course.enrolledAt && earliest > course.enrolledAt)
                                      ? course.enrolledAt
                                      : earliest,
                                  null as Date | null,
                                ),
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Latest Enrollment:</span>
                        <span className="text-sm font-medium">
                          {student.courses.length > 0
                            ? formatDate(
                                student.courses.reduce(
                                  (latest, course) =>
                                    !latest || (course.enrolledAt && latest < course.enrolledAt)
                                      ? course.enrolledAt
                                      : latest,
                                  null as Date | null,
                                ),
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <CardDescription>Recent logins and course activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Activity data will appear here</span>
                      </div>
                      <div className="h-[100px] w-full opacity-0">Placeholder</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrolled Courses</CardTitle>
                    <CardDescription>
                      {student.coursesEnrolled} course{student.coursesEnrolled !== 1 ? "s" : ""} enrolled
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {student.courses.length > 0 ? (
                      <div className="space-y-4">
                        {student.courses.map((course) => (
                          <div key={course.id} className="flex flex-col space-y-1 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{course.courseName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    ID: {course.courseId.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="mr-1 h-4 w-4" />
                                Enrolled on {formatDate(course.enrolledAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                        <div className="flex flex-col items-center text-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No courses enrolled</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            This student is not enrolled in any courses yet.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Student not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
