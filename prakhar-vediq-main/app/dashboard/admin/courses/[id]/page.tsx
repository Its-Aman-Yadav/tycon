"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, BookOpen, Users, FileText, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

type Course = {
  id: string
  title: string
  description: string
  duration: string
  level: string
  teachers: Array<{ id: string; name: string }>
  createdAt: string
  isPublished: boolean
  thumbnail: string | null
  videoUrl?: string | null
  videos?: Array<string>
  syllabus?: Array<{
    title: string
    description: string
  }>
  prerequisites?: string[]
  objectives?: string[]
  enrolledStudents?: Array<{ id: string; name: string; email: string }>
}

type Lesson = {
  id: string
  title: string
  description: string
  courseId: string
  order: number
  duration: string
  isPublished: boolean
}

type Student = {
  id: string
  name: string
  email: string
  role: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvStudents, setCsvStudents] = useState<{ name: string; email: string }[]>([])
  const [isProcessingCsv, setIsProcessingCsv] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("Invalid course ID")
        setIsLoading(false)
        return
      }

      try {
        const courseRef = doc(db, "courses", params.id)
        const courseSnap = await getDoc(courseRef)

        if (!courseSnap.exists()) {
          setError("Course not found")
          setIsLoading(false)
          return
        }

        const courseData = courseSnap.data()
        setCourse({
          id: courseSnap.id,
          title: courseData.title || "",
          description: courseData.description || "",
          duration: courseData.duration || "",
          level: courseData.level || "beginner",
          teachers: courseData.teachers || [],
          createdAt: courseData.createdAt || "",
          isPublished: courseData.isPublished || false,
          thumbnail: courseData.thumbnail || null,
          videoUrl:
            courseData.videoUrl || (courseData.videos && courseData.videos.length > 0 ? courseData.videos[0] : null),
          videos: courseData.videos || [],
          syllabus: courseData.syllabus || [],
          prerequisites: courseData.prerequisites || [],
          objectives: courseData.objectives || [],
          enrolledStudents: courseData.enrolledStudents || [],
        })

        // Fetch lessons for this course
        const lessonsQuery = query(collection(db, "lessons"), where("courseId", "==", params.id))
        const lessonsSnapshot = await getDocs(lessonsQuery)

        const lessonsData = lessonsSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "",
          description: doc.data().description || "",
          courseId: doc.data().courseId,
          order: doc.data().order || 0,
          duration: doc.data().duration || "",
          isPublished: doc.data().isPublished || false,
        }))

        // Sort lessons by order
        lessonsData.sort((a, b) => a.order - b.order)
        setLessons(lessonsData)
      } catch (error) {
        console.error("Error fetching course:", error)
        setError("Failed to load course details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [params.id])

  const fetchStudents = async () => {
    if (!user || (user.role !== "admin" && user.role !== "teacher")) return

    setIsLoadingStudents(true)
    try {
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))
      const studentsSnapshot = await getDocs(studentsQuery)

      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        email: doc.data().email || "",
        role: doc.data().role || "student",
      }))

      setAllStudents(studentsData)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setIsProcessingCsv(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvData = event.target?.result as string
      const rows = csvData.split("\n")
      const headers = rows[0].split(",")

      // Find name and email column indexes
      const nameIndex = headers.findIndex((h) => h.toLowerCase().includes("name"))
      const emailIndex = headers.findIndex((h) => h.toLowerCase().includes("email"))

      if (nameIndex === -1 || emailIndex === -1) {
        toast({
          title: "Invalid CSV format",
          description: "CSV must contain 'name' and 'email' columns",
          variant: "destructive",
        })
        setIsProcessingCsv(false)
        return
      }

      const students = rows
        .slice(1)
        .filter((row) => row.trim() !== "")
        .map((row) => {
          const columns = row.split(",")
          return {
            name: columns[nameIndex].trim(),
            email: columns[emailIndex].trim(),
          }
        })
        .filter((student) => student.name && student.email)

      setCsvStudents(students)
      setIsProcessingCsv(false)
    }

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read CSV file",
        variant: "destructive",
      })
      setIsProcessingCsv(false)
    }

    reader.readAsText(file)
  }

  const enrollStudentsManually = async () => {
    if (!course || selectedStudents.length === 0) return

    setIsEnrolling(true)
    try {
      const courseRef = doc(db, "courses", course.id)

      // Get current enrolled students to avoid duplicates
      const currentEnrolledIds = (course.enrolledStudents || []).map((s) => s.id)

      // Filter out already enrolled students
      const newStudentIds = selectedStudents.filter((id) => !currentEnrolledIds.includes(id))

      if (newStudentIds.length === 0) {
        toast({
          title: "No new students",
          description: "All selected students are already enrolled",
        })
        setIsEnrolling(false)
        return
      }

      // Get student details for the new enrollments
      const newStudents = allStudents
        .filter((student) => newStudentIds.includes(student.id))
        .map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
        }))

      // Update the course with new students
      await updateDoc(courseRef, {
        enrolledStudents: arrayUnion(...newStudents),
      })

      // Update local state
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          enrolledStudents: [...(prev.enrolledStudents || []), ...newStudents],
        }
      })

      toast({
        title: "Success",
        description: `Enrolled ${newStudents.length} students to the course`,
      })

      setSelectedStudents([])
    } catch (error) {
      console.error("Error enrolling students:", error)
      toast({
        title: "Error",
        description: "Failed to enroll students",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  const enrollStudentsFromCsv = async () => {
    if (!course || csvStudents.length === 0) return

    setIsEnrolling(true)
    try {
      const courseRef = doc(db, "courses", course.id)

      // Get current enrolled students to avoid duplicates by email
      const currentEnrolledEmails = (course.enrolledStudents || []).map((s) => s.email)

      // Filter out already enrolled students by email
      const newStudents = csvStudents.filter((s) => !currentEnrolledEmails.includes(s.email))

      if (newStudents.length === 0) {
        toast({
          title: "No new students",
          description: "All students in CSV are already enrolled",
        })
        setIsEnrolling(false)
        return
      }

      // For CSV students, we'll use email as temporary ID
      // In a real app, you'd want to match these with actual user IDs
      const studentsToEnroll = newStudents.map((student) => ({
        id: `temp-${student.email}`, // This is a temporary ID
        name: student.name,
        email: student.email,
      }))

      // Update the course with new students
      await updateDoc(courseRef, {
        enrolledStudents: arrayUnion(...studentsToEnroll),
      })

      // Update local state
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          enrolledStudents: [...(prev.enrolledStudents || []), ...studentsToEnroll],
        }
      })

      toast({
        title: "Success",
        description: `Enrolled ${studentsToEnroll.length} students from CSV`,
      })

      setCsvStudents([])
      setCsvFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error enrolling students from CSV:", error)
      toast({
        title: "Error",
        description: "Failed to enroll students from CSV",
        variant: "destructive",
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "beginner":
        return "default"
      case "intermediate":
        return "secondary"
      case "professional":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleEnroll = () => {
    // Implement enrollment functionality
    alert("Enrollment functionality would be implemented here")
  }

  const handleEditCourse = () => {
    if (user?.role === "admin") {
      router.push(`/dashboard/admin/courses/${params.id}/edit`)
    } else if (user?.role === "teacher") {
      router.push(`/dashboard/teacher/courses/${params.id}/edit`)
    }
  }

  const filteredStudents = allStudents.filter((student) => {
    if (!searchQuery) return true
    return (
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-10">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container max-w-6xl py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Failed to load course"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isTeacherOfCourse = user?.role === "teacher" && course.teachers.some((t) => t.id === user.uid)
  const canEdit = user?.role === "admin" || isTeacherOfCourse
  const canEnrollStudents = user?.role === "admin" || isTeacherOfCourse

  return (
    <div className="container max-w-6xl py-6 md:py-10">
      <Button onClick={handleBack} variant="ghost" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{course.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={getLevelBadgeVariant(course.level)}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                    {!course.isPublished && <Badge variant="secondary">Published</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Video Player */}
              <div className="relative w-full aspect-video mb-6 rounded-md overflow-hidden bg-black">
                {course.videos && course.videos.length > 0 ? (
                  <video
                    ref={videoRef}
                    src={course.videos[0]}
                    poster={course.thumbnail || undefined}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : course.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={course.videoUrl}
                    poster={course.thumbnail || undefined}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : course.thumbnail ? (
                  <div className="relative w-full h-full">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                      <p>No video available</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <p className="text-muted-foreground">No video or thumbnail available</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{course.duration} weeks</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Created on {new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                  <TabsTrigger value="lessons">Lessons</TabsTrigger>
                  {canEnrollStudents && <TabsTrigger value="students">Students</TabsTrigger>}
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
                  </div>

                  {course.objectives && course.objectives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Learning Objectives</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {course.objectives.map((objective, index) => (
                          <li key={index} className="text-muted-foreground">
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {course.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="text-muted-foreground">
                            {prerequisite}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="syllabus">
                  {course.syllabus && course.syllabus.length > 0 ? (
                    <div className="space-y-4">
                      {course.syllabus.map((item, index) => (
                        <Card key={index}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">
                              Week {index + 1}: {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4">No syllabus information available for this course.</p>
                  )}
                </TabsContent>

                <TabsContent value="lessons">
                  {lessons.length > 0 ? (
                    <div className="space-y-4">
                      {lessons.map((lesson, index) => (
                        <Card key={lesson.id}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">
                              Lesson {index + 1}: {lesson.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{lesson.duration}</span>
                              {!lesson.isPublished && (
                                <Badge variant="outline" className="ml-2">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4">No lessons available for this course yet.</p>
                  )}
                </TabsContent>

                {canEnrollStudents && (
                  <TabsContent value="students">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Enrolled Students</h3>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={fetchStudents}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Enroll Students
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Enroll Students</DialogTitle>
                              <DialogDescription>
                                Add students to this course manually or by uploading a CSV file.
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="manual" className="mt-4">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Manual Selection</TabsTrigger>
                                <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                              </TabsList>

                              <TabsContent value="manual" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="search-students">Search Employee</Label>
                                  <Input
                                    id="search-students"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                </div>

                                {isLoadingStudents ? (
                                  <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                  </div>
                                ) : (
                                  <ScrollArea className="h-[300px] rounded-md border p-2">
                                    {filteredStudents.length > 0 ? (
                                      <div className="space-y-2">
                                        {filteredStudents.map((student) => (
                                          <div
                                            key={student.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md"
                                          >
                                            <Checkbox
                                              id={`student-${student.id}`}
                                              checked={selectedStudents.includes(student.id)}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  setSelectedStudents([...selectedStudents, student.id])
                                                } else {
                                                  setSelectedStudents(
                                                    selectedStudents.filter((id) => id !== student.id),
                                                  )
                                                }
                                              }}
                                            />
                                            <label
                                              htmlFor={`student-${student.id}`}
                                              className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              <div>{student.name}</div>
                                              <div className="text-xs text-muted-foreground">{student.email}</div>
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-center text-muted-foreground py-4">
                                        {searchQuery
                                          ? "No students found matching your search"
                                          : "No students available"}
                                      </p>
                                    )}
                                  </ScrollArea>
                                )}

                                <DialogFooter>
                                  <Button
                                    onClick={enrollStudentsManually}
                                    disabled={selectedStudents.length === 0 || isEnrolling}
                                  >
                                    {isEnrolling ? (
                                      <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                                        Enrolling...
                                      </>
                                    ) : (
                                      `Enroll ${selectedStudents.length} Students`
                                    )}
                                  </Button>
                                </DialogFooter>
                              </TabsContent>

                              <TabsContent value="csv" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="csv-file">Upload CSV File</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      ref={fileInputRef}
                                      id="csv-file"
                                      type="file"
                                      accept=".csv"
                                      onChange={handleCsvUpload}
                                      disabled={isProcessingCsv}
                                    />
                                    {isProcessingCsv && (
                                      <div className="animate-spin h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    CSV must include columns for name and email
                                  </p>
                                </div>

                                {csvStudents.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>Students from CSV ({csvStudents.length})</Label>
                                    <ScrollArea className="h-[200px] rounded-md border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {csvStudents.map((student, index) => (
                                            <TableRow key={index}>
                                              <TableCell>{student.name}</TableCell>
                                              <TableCell>{student.email}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </ScrollArea>
                                  </div>
                                )}

                                <DialogFooter>
                                  <Button
                                    onClick={enrollStudentsFromCsv}
                                    disabled={csvStudents.length === 0 || isEnrolling}
                                  >
                                    {isEnrolling ? (
                                      <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                                        Enrolling...
                                      </>
                                    ) : (
                                      `Enroll ${csvStudents.length} Students from CSV`
                                    )}
                                  </Button>
                                </DialogFooter>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {course.enrolledStudents.map((student, index) => (
                              <TableRow key={index}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground py-4">No students enrolled in this course yet.</p>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}


          {/* Instructors Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Trainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.teachers.length > 0 ? (
                <div className="space-y-4">
                  {course.teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&query=avatar`} alt={teacher.name} />
                        <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">Instructor</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No instructors assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Course Materials Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Course Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access to course materials will be available after enrollment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
