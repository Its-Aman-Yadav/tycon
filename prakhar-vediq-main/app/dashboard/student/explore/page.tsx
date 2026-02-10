"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Video, Users, Clock, BookOpen, Check, X, Filter, FileText } from "lucide-react"
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

/* ====================== Interfaces ====================== */
interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  type: string
  duration: number
  price: number
  isFree: boolean
  status: string
  visibility: string
  certificateEnabled: boolean
  authorId: string
  thumbnailUrl?: string
  thumbnail?: string
  teacher?: {
    name: string
    avatar: string
  }
  attachments?: CourseAttachment[]
}

interface CourseAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  createdAt: Date
}

interface EnrollmentRequest {
  id: string
  courseId: string
  userId: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  courseTitle: string
  courseThumbnail?: string
}

/* ====================== Constants ====================== */
const categories = [
  { id: "design", name: "Design" },
  { id: "programming", name: "Programming" },
  { id: "business", name: "Business" },
]

const levels = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
]

/* ====================== Component ====================== */
export default function StudentView() {
  const router = useRouter()
  const { toast } = useToast()
  const formatDuration = (duration: number) => {
  return `${duration} ${duration === 1 ? "Hour" : "Hours"}`
}


  // State
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [requestedCourses, setRequestedCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  /* ====================== Firestore-based Auth ====================== */
  useEffect(() => {
    const studentEmail = localStorage.getItem("studentEmail")

    if (!studentEmail) {
      setCurrentUserId(null)
      setAuthLoading(false)
      setError("You must be logged in to view courses")
      return
    }

    const fetchStudent = async () => {
      try {
        const q = query(collection(db, "students"), where("email", "==", studentEmail))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          setCurrentUserId(snapshot.docs[0].id)
        } else {
          setError("Student record not found.")
        }
      } catch (err) {
        console.error("Error fetching student:", err)
        setError("Failed to fetch student details.")
      } finally {
        setAuthLoading(false)
      }
    }

    fetchStudent()
  }, [])

  /* ====================== Fetch Courses & Requests ====================== */
  useEffect(() => {
    if (!currentUserId || authLoading) return

    const fetchCoursesAndRequests = async () => {
      try {
        setLoading(true)
        setLoadingRequests(true)

        // Fetch all courses
        const coursesSnapshot = await getDocs(collection(db, "courses"))
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[]

        // Fetch enrollment requests for this student
        const requestsSnapshot = await getDocs(
          query(collection(db, "enrollmentRequests"), where("userId", "==", currentUserId))
        )

        const requestsData: EnrollmentRequest[] = []
        const requestedIds: string[] = []

        requestsSnapshot.forEach((doc) => {
          const data = doc.data()
          requestsData.push({
            id: doc.id,
            courseId: data.courseId,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            courseTitle: data.courseTitle,
            courseThumbnail: data.courseThumbnail,
          })
          requestedIds.push(data.courseId)
        })

        setCourses(coursesData)
        setEnrollmentRequests(requestsData)
        setRequestedCourses(requestedIds)
      } catch (err) {
        console.error("Error loading courses:", err)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
        setLoadingRequests(false)
      }
    }

    fetchCoursesAndRequests()
  }, [currentUserId, authLoading])

  /* ====================== Helpers ====================== */
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const handleRequestToJoin = (course: Course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const storeEnrollmentRequest = async (course: Course) => {
    try {
      const enrollmentRef = collection(db, "enrollmentRequests")
      const existing = await getDocs(
        query(enrollmentRef, where("userId", "==", currentUserId), where("courseId", "==", course.id))
      )

      if (!existing.empty) {
        return { success: false, message: "You have already requested to join this course." }
      }

      const newRequest = {
        courseId: course.id,
        userId: currentUserId,
        status: "pending",
        createdAt: new Date(),
        courseTitle: course.title,
        courseThumbnail: course.thumbnailUrl || course.thumbnail,
      }

      const docRef = await addDoc(enrollmentRef, newRequest)

      setEnrollmentRequests((prev) => [...prev, { id: docRef.id, ...newRequest } as EnrollmentRequest])
      setRequestedCourses((prev) => [...prev, course.id])

      return { success: true }
    } catch (error) {
      console.error("Error creating enrollment request:", error)
      return { success: false, message: "Failed to submit enrollment request." }
    }
  }

  const handleConfirmRequest = async () => {
    if (!selectedCourse) return

    setSubmitting(true)
    const result = await storeEnrollmentRequest(selectedCourse)
    setSubmitting(false)

    if (result.success) {
      toast({
        title: "Request Sent!",
        description: "You'll be notified once it's approved.",
      })
      setIsModalOpen(false)
    } else {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: result.message,
      })
    }
  }

  const isRequested = (courseId: string) => requestedCourses.includes(courseId)
  const hasAccessToCourse = (courseId: string) =>
    enrollmentRequests.some((req) => req.courseId === courseId && req.status === "approved")

  const navigateToCourseDetail = (id: string) => router.push(`/dashboard/student/courses/${id}`)

  const filteredCourses = courses.filter((course) => {
    const categoryMatch = categoryFilter === "all" || course.category === categoryFilter
    const typeMatch = typeFilter === "all" || course.type === typeFilter
    const levelMatch = levelFilter === "all" || course.level === levelFilter
    const searchMatch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && typeMatch && levelMatch && searchMatch
  })

  /* ====================== Auth States ====================== */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>Loading...</p>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-6">
              Please sign in with your student account to access available courses.
            </p>
            <Button onClick={() => router.push("/auth/login/student")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="courses">Available Courses</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {/* Page Header */}
            <header className="mb-8">
              <h1 className="text-2xl font-bold mb-6">All Courses</h1>

              {/* Desktop Filters */}
              <div className="hidden md:flex flex-wrap gap-4 items-center">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="live">Live Classes</SelectItem>
                    <SelectItem value="recorded">Recorded</SelectItem>
                  </SelectContent>
                </Select>

                {/* Level Filter */}
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[150px] bg-white">
                    <SelectValue placeholder="Course level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile Filters */}
              <div className="md:hidden space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Button */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>

                  {showFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryFilter("all")
                        setTypeFilter("all")
                        setLevelFilter("all")
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 gap-4 py-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="recorded">Recorded</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {levels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </header>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
                <div className="mb-6 w-24 h-24 mx-auto relative">
                  <Image src="/error-icon.png" alt="Error" width={96} height={96} className="object-contain" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            )}

            {/* Course Grid */}
            {!loading && !error && filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow bg-white w-full"
                  >
                    <div className="relative w-full aspect-video">
                      <Image
                        src={
                          course.thumbnailUrl ||
                          course.thumbnail ||
                          "/placeholder.svg?height=400&width=400&query=course" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                          || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover object-center"
                      />
                    </div>

                    <CardContent className="p-4">
                      <div className="flex gap-2 mb-3">
                        <Badge
                          className={`${course.type === "live"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}
                          variant="outline"
                        >
                          {course.type === "live" ? (
                            <>
                              <Users className="h-3 w-3 mr-1" /> Live
                            </>
                          ) : (
                            <>
                              <Video className="h-3 w-3 mr-1" /> Recorded
                            </>
                          )}
                        </Badge>
                        <Badge
                          className={`${course.isFree
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }`}
                          variant="outline"
                        >
                          {course.isFree ? "Free" : `Rs ${course.price}`}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.category.charAt(0).toUpperCase() + course.category.slice(1)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatDuration(course.duration)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs font-normal">
                            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                      {hasAccessToCourse(course.id) ? (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => navigateToCourseDetail(course.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" /> View Course Materials
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${isRequested(course.id)
                              ? "bg-gray-200 text-gray-600 hover:bg-gray-200 cursor-not-allowed"
                              : ""
                            }`}
                          onClick={() => !isRequested(course.id) && handleRequestToJoin(course)}
                          disabled={isRequested(course.id)}
                        >
                          {isRequested(course.id) ? (
                            <>
                              <Check className="h-4 w-4 mr-2" /> Request Sent
                            </>
                          ) : (
                            "Request Access"
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !loading && !error ? (
              // Empty State
              <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
                <div className="mb-6 w-24 h-24 mx-auto relative">
                  <Image
                    src="/empty-courses.png"
                    alt="No courses available"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">No courses available for enrollment</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  No courses match your current filters. Try adjusting your search criteria or check back soon for new
                  courses.
                </p>
                <Button
                  onClick={() => {
                    setCategoryFilter("all")
                    setTypeFilter("all")
                    setLevelFilter("all")
                    setSearchQuery("")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="requests">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">My Course Requests</h1>
              <p className="text-gray-500">Track the status of your course enrollment requests</p>
            </div>

            {loadingRequests ? (
              <div className="text-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600">Loading your requests...</p>
              </div>
            ) : enrollmentRequests.length > 0 ? (
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Course</TableHead>
                        <TableHead>Requested On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollmentRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={
                                    request.courseThumbnail ||
                                    "/placeholder.svg?height=40&width=40&query=course thumbnail" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                    || "/placeholder.svg"}
                                  alt={request.courseTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="line-clamp-2">{request.courseTitle}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.createdAt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeColor(request.status)}>
                              {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {request.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                              {request.status === "rejected" && <X className="h-3 w-3 mr-1" />}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => navigateToCourseDetail(request.courseId)}
                              >
                                <FileText className="h-3 w-3 mr-1" /> View Materials
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
                <div className="mb-6 w-24 h-24 mx-auto relative">
                </div>
                <h3 className="text-xl font-semibold mb-2">No course requests yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't requested access to any courses yet. Browse available courses and request access to get
                  started.
                </p>
                <Button onClick={() => document.querySelector('[data-value="courses"]')?.click()}>
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">My Enrolled Courses</h1>
              <p className="text-gray-500">Access your approved courses and learning materials</p>
            </div>

            {loadingRequests ? (
              <div className="text-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-4 text-gray-600">Loading your courses...</p>
              </div>
            ) : enrollmentRequests.filter((req) => req.status === "approved").length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollmentRequests
                  .filter((req) => req.status === "approved")
                  .map((request) => {
                    const course = courses.find((c) => c.id === request.courseId)
                    return course ? (
                      <Card
                        key={request.id}
                        className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow bg-white w-full"
                      >
                        <div className="relative w-full aspect-video">
                          <Image
                            src={
                              course.thumbnailUrl ||
                              course.thumbnail ||
                              request.courseThumbnail ||
                              "/placeholder.svg?height=400&width=400&query=course" ||
                              "/placeholder.svg"
                              || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover object-center"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500 text-white">Enrolled</Badge>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                          <Button
                            className="w-full"
                            onClick={() => navigateToCourseDetail(course.id)}
                          >
                            <FileText className="h-4 w-4 mr-2" /> View Course Materials
                          </Button>
                        </CardContent>
                      </Card>
                    ) : null
                  })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-lg shadow-sm">
                <div className="mb-6 w-24 h-24 mx-auto relative">
                  <Image
                    src="/empty-courses.png"
                    alt="No enrolled courses"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">No enrolled courses yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You don't have any approved course enrollments yet. Once your requests are approved, your courses will
                  appear here.
                </p>
                <Button onClick={() => document.querySelector('[data-value="requests"]')?.click()}>
                  Check Request Status
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirmation Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirm Course Request</DialogTitle>
              <DialogDescription className="text-gray-500 pt-1.5">
                You're about to send a join request for{" "}
                <span className="font-medium text-gray-700">{selectedCourse?.title}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="text-sm text-gray-500 px-1 mt-1">
              Once confirmed, your instructor will review your request.
            </div>

            <DialogFooter className="flex sm:justify-between gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleConfirmRequest} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Confirm Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
