"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MoreVertical, HelpCircle, Video, Users, Filter, Bot } from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIModal } from "@/components/ai-modal"
import { doc, getDoc } from "firebase/firestore"


// Course type definition
interface Course {
  id: string
  title: string
  mode: "live" | "recorded"
  progress: number
  thumbnail: string
  instructor: string
  lastAccessed?: string
  totalHours?: number
  totalLectures?: number
  aiModeEnabled?: boolean
  summarylong?: string
  summaryshort?: string
}


export default function CoursesPage() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  // Filter options
  const filters = [
    { label: "All", value: "all", active: activeFilter === "all" },
    { label: "In Progress", value: "active", active: activeFilter === "active" },
    { label: "Completed", value: "completed", active: activeFilter === "completed" },
    { label: "Archived", value: "archived", active: activeFilter === "archived" },
  ]

  useEffect(() => {
    const fetchApprovedEnrollments = async () => {
      const email = localStorage.getItem("studentEmail") // 🔁 This must match your login logic
      if (!email) {
        setLoading(false)
        setEnrolledCourses([])
        return
      }

      try {
        setLoading(true)

        // Step 1: Fetch student Firestore document using email
        const studentQuery = query(collection(db, "students"), where("email", "==", email))
        const studentSnapshot = await getDocs(studentQuery)

        if (studentSnapshot.empty) {
          console.warn("Student not found for email:", email)
          setLoading(false)
          return
        }

        const studentId = studentSnapshot.docs[0].id // 🔑 This is the correct userId

        // Step 2: Fetch enrollment requests for this student
        const enrollmentRef = collection(db, "enrollmentRequests")
        const q = query(enrollmentRef, where("status", "==", "approved"), where("userId", "==", studentId))
        const enrollmentSnapshot = await getDocs(q)

        const enrolledCoursesData: Course[] = []

        for (const docSnap of enrollmentSnapshot.docs) {
          const data = docSnap.data()
          const courseDocRef = doc(db, "courses", data.courseId)
          const courseSnap = await getDoc(courseDocRef)
          const courseData = courseSnap.exists() ? courseSnap.data() : {}

          enrolledCoursesData.push({
            id: data.courseId,
            title: data.courseTitle || courseData.title || "Untitled Course",
            mode: data.mode || courseData.mode || "recorded",
            progress: data.progress || 0,
            thumbnail: data.courseThumbnail || courseData.thumbnail || "/course-thumbnail.png",
            instructor: data.instructor || courseData.instructor || "",
            lastAccessed: data.lastAccessed || "Never",
            totalHours: data.totalHours || Math.floor(Math.random() * 20) + 1,
            totalLectures: data.totalLectures || Math.floor(Math.random() * 100) + 10,
            aiModeEnabled: courseData.aiModeEnabled ?? false,
            summarylong: courseData.summarylong || "",
            summaryshort: courseData.summaryshort || "",
          })
        }

        setEnrolledCourses(enrolledCoursesData)
      } catch (error) {
        console.error("Error fetching enrolled courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedEnrollments()
  }, [])


  // Filter enrolled courses based on search query and active filter
  const filteredCourses = enrolledCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "completed") return matchesSearch && course.progress === 100
    if (activeFilter === "active") return matchesSearch && course.progress > 0 && course.progress < 100
    if (activeFilter === "archived") return matchesSearch && false // Placeholder: no archived
    return matchesSearch
  })

  const hasCourses = filteredCourses.length > 0

  const handleAIClick = (course: Course, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCourse(course)
    setIsAIModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Learning</h1>
          </div>

          <Tabs defaultValue="all-courses" className="mb-6">
            <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 mb-4">
              <TabsTrigger
                value="all-courses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1c1d1f] data-[state=active]:bg-transparent px-4 py-2 text-sm font-medium"
              >
                All courses
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all-courses" className="mt-0">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search my courses"
                    className="pl-10 bg-white border-gray-300 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 border-gray-300 bg-transparent flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {filters.map((filter) => (
                      <DropdownMenuItem
                        key={filter.value}
                        className={filter.active ? "bg-gray-100" : ""}
                        onClick={() => setActiveFilter(filter.value)}
                      >
                        {filter.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 border-gray-300 bg-transparent">
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Recently Accessed</DropdownMenuItem>
                    <DropdownMenuItem>Title: A-to-Z</DropdownMenuItem>
                    <DropdownMenuItem>Title: Z-to-A</DropdownMenuItem>
                    <DropdownMenuItem>Progress</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TabsContent>
          </Tabs>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1c1d1f]"></div>
          </div>
        )}

        {/* Course Grid View */}
        {!loading && hasCourses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow w-full flex flex-col bg-white"
              >
                <Link href={`/dashboard/student/courses/${course.id}`} className="block relative aspect-video">
                  <div className="relative h-full w-full">
                    <Image
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {/* AI Icon - Top Left */}
                    <div className="relative group">
                      {course.aiModeEnabled && (
                        <div className="relative group">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 left-2 h-8 w-8 bg-[#FF6600] hover:bg-[#e65c00] shadow-sm z-10"
                            onClick={(e) => handleAIClick(course, e)}
                          >
                            <Bot className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      )}

                    </div>
                    <Badge
                      className={`absolute top-3 right-3 ${course.mode === "live"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      variant="outline"
                    >
                      {course.mode === "live" ? (
                        <>
                          <Users className="h-3 w-3 mr-1" /> Live
                        </>
                      ) : (
                        <>
                          <Video className="h-3 w-3 mr-1" /> Recorded
                        </>
                      )}
                    </Badge>
                  </div>
                </Link>
                <CardContent className="p-4 bg-white flex-1 flex flex-col">
                  <Link href={`/student/courses/${course.id}`} className="block">
                    <h3 className="font-bold text-base mb-1 line-clamp-2 hover:text-[#5624d0]">{course.title}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-gray-500"></div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/dashboard/student/courses/${course.id}`} className="w-full">
                            View Course
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-auto">
                    <Link href={`/dashboard/student/courses/${course.id}`} className="w-full">
                      <Button className="w-full bg-[#1c1d1f] hover:bg-black text-white text-sm h-9">
                        {course.progress > 0 ? "Continue" : "Start"} Learning
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-200 rounded-md">
            <div className="mb-6 w-48 h-48 relative">
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No courses match your search." : "You're not enrolled in any course yet."}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {searchQuery
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Browse our catalog to find courses that match your interests and learning goals."}
            </p>
            <Link href="/dashboard/student/explore">
              <Button className="bg-[#1c1d1f] hover:bg-black text-white">Browse courses</Button>
            </Link>
          </div>
        ) : null}

        {/* Floating Help Button */}
        {/* <div className="fixed bottom-6 right-6">
          <Link href="/student/help">
            <Button size="icon" className="h-12 w-12 rounded-full bg-[#1c1d1f] hover:bg-black shadow-lg">
              <HelpCircle className="h-6 w-6" />
            </Button>
          </Link>
        </div> */}
      </div>

      {/* AI Modal */}
      <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} course={selectedCourse} />
    </div>
  )
}
