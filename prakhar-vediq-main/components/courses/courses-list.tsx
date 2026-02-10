"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Trash2, Search, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDoc } from "firebase/firestore"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { query, where, getCountFromServer } from "firebase/firestore"

import { collection, getDocs, doc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Bot } from "lucide-react"
import { usePathname } from "next/navigation"
import { useRef } from "react"

interface Course {
  id: string
  title: string
  description: string
  type: "live" | "recorded" | "both"
  duration: number
  enrolledStudents?: number
  status: "published" | "draft" | "archived"
  thumbnailUrl?: string
  authorId: string
  authorName?: string
  category: string
  aiModeEnabled?: boolean
  assignedTeachers?: { id: string; name: string }[]
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [categoryFilter, setCategory] = useState<string>("")
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false
  const router = useRouter()
  const { toast } = useToast()
  const [showProgress, setShowProgress] = useState(false)
  const [progressText, setProgressText] = useState("🧠 Enabling AI Mode, please wait...")
  const [aiModeEnabled, setAiModeEnabled] = useState(false)
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({})


  const pathname = usePathname()
  const lastPathRef = useRef(pathname)

  const handleEnableAIMode = async (courseId: string) => {
    try {
      setShowProgress(true)
      setProgressText("🧠 Enabling AI Mode, please wait...")

      const courseRef = doc(db, "courses", courseId)
      const courseSnap = await getDoc(courseRef)

      if (!courseSnap.exists()) throw new Error("Course not found in Firestore")

      const courseData = courseSnap.data()
      // Create a deep copy of modules to work with
      const modules = JSON.parse(JSON.stringify(courseData.modules || []))
      let combinedTranscription = ""

      // Step 1: Transcribe videos and save incrementally
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i]

        for (let j = 0; j < (module.materials || []).length; j++) {
          const material = module.materials[j]

          if (material.type === "video" && material.videoUrl) {
            // If transcription already exists, skip (optimization) or append (if needed)
            // For now, we assume we want to re-transcribe or it's new. 
            // Check if we should skip already transcribed? User didn't ask, but safe to overwrite or check.
            // Let's stick to the current behavior: always transcribe.

            const position = `Module ${i + 1}, Video ${j + 1}`
            setProgressText(`🎥 Processing ${position}...`)
            let transcription = ""
            let success = false

            // Try to fetch normally first
            try {
              const res = await fetch("/api/transcribe-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  videoUrl: material.videoUrl,
                  courseId,
                  moduleIndex: i,
                  videoIndex: j
                }),
              })

              if (res.status === 504) {
                throw new Error("Gateway Timeout")
              }

              const transcribeData = await res.json()
              if (res.ok && transcribeData.transcription) {
                transcription = transcribeData.transcription
                success = true
              } else {
                throw new Error(transcribeData.error || "Transcription failed")
              }

            } catch (err: any) {
              // If it's a timeout or network error, switch to POLLING
              if (err.message.includes("Timeout") || err.message.includes("504") || err.name === 'TypeError') {
                console.warn(`Timeout/Network error for ${position}. Switching to polling mode...`)
                setProgressText(`⏳ Server is busy. Polling for results... (${position})`)

                // Poll every 5 seconds for up to 10 minutes (120 attempts)
                let attempts = 0
                const maxAttempts = 120

                while (attempts < maxAttempts && !success) {
                  attempts++
                  await new Promise(r => setTimeout(r, 5000)) // Wait 5s

                  // Check Firestore directly
                  const freshSnap = await getDoc(courseRef)
                  if (freshSnap.exists()) {
                    const freshData = freshSnap.data()
                    const freshModule = freshData.modules?.[i]
                    const freshMaterial = freshModule?.materials?.[j]

                    if (freshMaterial?.transcription) {
                      transcription = freshMaterial.transcription
                      success = true
                      console.log(`✅ Polling successful for ${position}`)
                    }
                  }
                }

                if (!success) {
                  console.warn(`Polling timed out for ${position}. Continuing...`)
                }

              } else {
                console.error(`Error processing ${position}:`, err)
                // Non-timeout error. Log and continue.
              }
            }

            if (success && transcription) {
              combinedTranscription += `\n\n${transcription}`
              // Update local state to match what's in DB
              modules[i].materials[j] = { ...material, transcription }
            }
          }
        }
      }

      // Step 2: Summarize combined transcription
      if (combinedTranscription) {
        try {
          setProgressText("📖 Summarizing all videos...")
          const summaryRes = await fetch("/api/summarize-transcription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcription: combinedTranscription }),
          })

          const summaryData = await summaryRes.json()
          if (!summaryRes.ok || !summaryData.longSummary || !summaryData.simplifiedSummary) {
            // Don't fail the whole process if only summary fails
            console.error("Summarization failed:", summaryData.error)
            toast({
              title: "Summarization Warning",
              description: "Transcriptions were saved, but summarization failed.",
              variant: "destructive",
            })
          } else {
            const { longSummary, simplifiedSummary } = summaryData

            // Final save with summaries
            setProgressText("💾 Saving summaries to Firestore...")
            await updateDoc(courseRef, {
              aiModeEnabled: true,
              summarylong: longSummary,
              summaryshort: simplifiedSummary,
            })
          }
        } catch (summaryErr) {
          console.error("Summary error:", summaryErr)
          toast({
            title: "Summarization Failed",
            description: "Transcriptions saved, but could not generate summary.",
            variant: "destructive",
          })
        }
      } else {
        // No videos found?
        await updateDoc(courseRef, { aiModeEnabled: true })
      }

      setProgressText("✅ AI Mode Enabled!")
      toast({
        title: "AI Mode Enabled",
        description: "Process completed successfully.",
      })

      // Refresh local state (re-fetch courses)
      fetchCourses()

    } catch (error: any) {
      console.error("❌ AI Mode Error:", error)
      toast({
        title: "Failed to enable AI Mode",
        description: error.message || "Unknown error",
        variant: "destructive",
      })
    } finally {
      setShowProgress(false)
      setProgressText("")
    }
  }

  async function getEnrollmentCount(courseId: string): Promise<number> {
    const q = query(
      collection(db, "enrollmentRequests"),
      where("courseId", "==", courseId),
      where("status", "==", "approved")
    )

    const snapshot = await getCountFromServer(q)
    return snapshot.data().count
  }


  const fetchCourses = async () => {
    try {
      setLoading(true)

      const coursesRef = collection(db, "courses")
      const querySnapshot = await getDocs(coursesRef)

      const coursesData: Course[] = []

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data()

        // Handle multiple assigned teachers
        const assignedTeacherIds = data.assignedTeacherIds || []
        const assignedTeachers: { id: string; name: string }[] = []
        let derivedAuthorName = "Unknown Author"

        if (assignedTeacherIds.length > 0) {
          // Fetch all assigned teachers
          await Promise.all(
            assignedTeacherIds.map(async (tId: string) => {
              try {
                const teacherRef = doc(db, "teachers", tId)
                const teacherSnap = await getDoc(teacherRef)
                if (teacherSnap.exists()) {
                  const tData = teacherSnap.data()
                  assignedTeachers.push({
                    id: tId,
                    name: tData.fullName || tData.name || tData.displayName || "Unnamed Teacher"
                  })
                }
              } catch (err) {
                console.error(`Error fetching teacher ${tId}`, err)
              }
            })
          )
        } else if (data.teacherId) {
          // Fallback for legacy single teacher
          try {
            const teacherRef = doc(db, "teachers", data.teacherId)
            const teacherSnap = await getDoc(teacherRef)
            if (teacherSnap.exists()) {
              const tData = teacherSnap.data()
              assignedTeachers.push({
                id: data.teacherId,
                name: tData.fullName || tData.name || tData.displayName || "Unnamed Teacher"
              })
            }
          } catch (err) {
            console.error("Error fetching legacy teacher", err)
          }
        }

        if (data.authorId) {
          try {
            // Try fetching from teachers first
            let authorRef = doc(db, "teachers", data.authorId)
            let authorSnap = await getDoc(authorRef)

            if (!authorSnap.exists()) {
              // Try admins if not found in teachers
              authorRef = doc(db, "admins", data.authorId)
              authorSnap = await getDoc(authorRef)
            }


            if (authorSnap.exists()) {
              const aData = authorSnap.data()
              derivedAuthorName = aData.fullName || aData.name || aData.displayName || "Unknown Author"
            }

          } catch (err) {
            console.error("Error fetching author", err)
          }
        }

        // Filter out the author from assigned teachers if they are the same person
        const filteredAssignedTeachers = assignedTeachers.filter(t => t.id !== data.authorId)

        coursesData.push({
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          type: data.type || "recorded",
          duration: data.duration || 0,
          enrolledStudents: data.enrolledStudents || 0,
          status: data.status || "draft",
          thumbnailUrl: data.thumbnailUrl || "",
          authorId: data.authorId || "",
          authorName: derivedAuthorName, // ✅ Add this
          category: data.category || "",
          aiModeEnabled: data.aiModeEnabled || false,
          assignedTeachers: filteredAssignedTeachers,
        })
      }

      setCourses(coursesData)
      setFilteredCourses(coursesData)

      // Enrollment counts
      const counts = await Promise.all(
        coursesData.map((course) => getEnrollmentCount(course.id))
      )

      const countMap = coursesData.reduce((acc, course, idx) => {
        acc[course.id] = counts[idx]
        return acc
      }, {} as Record<string, number>)

      setEnrollmentCounts(countMap)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }

  }



  useEffect(() => {
    if (showProgress && lastPathRef.current !== pathname) {
      const confirmLeave = confirm("AI Mode is currently being enabled. Are you sure you want to leave?")
      if (!confirmLeave) {
        window.history.pushState(null, "", lastPathRef.current)
      } else {
        lastPathRef.current = pathname
      }
    } else {
      lastPathRef.current = pathname
    }
  }, [pathname, showProgress])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showProgress) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [showProgress])

  useEffect(() => {
    fetchCourses()
  }, [])

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, typeFilter, statusFilter, categoryFilter, courses])

  const applyFilters = () => {
    let result = [...courses]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (course) => course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query),
      )
    }

    // Apply type filter
    if (typeFilter.length > 0) {
      result = result.filter((course) => typeFilter.includes(course.type))
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((course) => statusFilter.includes(course.status))
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((course) => course.category === categoryFilter)
    }

    setFilteredCourses(result)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTypeFilterChange = (type: "live" | "recorded" | "both") => {
    setTypeFilter((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  const handleStatusFilterChange = (status: "published" | "draft" | "archived") => {
    setStatusFilter((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setTypeFilter([])
    setStatusFilter([])
    setCategory("")
  }

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  const handleEditCourse = (courseId: string) => {
    router.push(`/dashboard/admin/courses/${courseId}/edit`)
  }

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const courseRef = doc(db, "courses", courseId)
      await updateDoc(courseRef, {
        status: "archived",
      })

      // Update the local state
      setCourses((prevCourses) =>
        prevCourses.map((course) => (course.id === courseId ? { ...course, status: "archived" } : course)),
      )

      toast({
        title: "Course archived",
        description: "The course has been archived successfully.",
      })
    } catch (error) {
      console.error("Error archiving course:", error)
      toast({
        title: "Error",
        description: "Failed to archive course. Please try again.",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = (course: Course) => {
    setCourseToDelete(course)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    try {

      // Delete from related collections
      const relatedCollections = ["enrollmentRequests", "userCourseProgress", "courseReviews", "quizScores"]

      for (const collectionName of relatedCollections) {
        const q = query(collection(db, collectionName), where("courseId", "==", courseToDelete.id))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const chunkSize = 500
          for (let i = 0; i < snapshot.docs.length; i += chunkSize) {
            const batch = writeBatch(db)
            const chunk = snapshot.docs.slice(i, i + chunkSize)
            chunk.forEach((doc) => {
              batch.delete(doc.ref)
            })
            await batch.commit()
          }
        }
      }

      const courseRef = doc(db, "courses", courseToDelete.id)
      await deleteDoc(courseRef)

      // Update the local state
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseToDelete.id))

      toast({
        title: "Course deleted",
        description: "The course and all associated data have been permanently deleted.",
      })
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    }
  }

  // Get unique categories from courses
  const categories = Array.from(new Set(courses.map((course) => course.category))).filter(Boolean)

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Course Type</h4>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-live"
                          checked={typeFilter.includes("live")}
                          onCheckedChange={() => handleTypeFilterChange("live")}
                        />
                        <Label htmlFor="type-live">Live Classes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-recorded"
                          checked={typeFilter.includes("recorded")}
                          onCheckedChange={() => handleTypeFilterChange("recorded")}
                        />
                        <Label htmlFor="type-recorded">Recorded</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="type-both"
                          checked={typeFilter.includes("both")}
                          onCheckedChange={() => handleTypeFilterChange("both")}
                        />
                        <Label htmlFor="type-both">Live & Recorded</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Status</h4>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-published"
                          checked={statusFilter.includes("published")}
                          onCheckedChange={() => handleStatusFilterChange("published")}
                        />
                        <Label htmlFor="status-published">Published</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-draft"
                          checked={statusFilter.includes("draft")}
                          onCheckedChange={() => handleStatusFilterChange("draft")}
                        />
                        <Label htmlFor="status-draft">Draft</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-archived"
                          checked={statusFilter.includes("archived")}
                          onCheckedChange={() => handleStatusFilterChange("archived")}
                        />
                        <Label htmlFor="status-archived">Archived</Label>
                      </div>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Category</h4>
                      <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active filters display */}
        {(typeFilter.length > 0 || statusFilter.length > 0 || categoryFilter) && (
          <div className="flex flex-wrap gap-2">
            {typeFilter.map((type) => (
              <Badge key={type} variant="secondary" className="flex gap-1 items-center">
                {type === "live" ? "Live Classes" : type === "recorded" ? "Recorded" : "Live & Recorded"}
                <button
                  onClick={() => handleTypeFilterChange(type as "live" | "recorded" | "both")}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <span className="sr-only">Remove</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Badge>
            ))}

            {statusFilter.map((status) => (
              <Badge key={status} variant="secondary" className="flex gap-1 items-center">
                {status === "published" ? "Published" : status === "draft" ? "Draft" : "Archived"}
                <button
                  onClick={() => handleStatusFilterChange(status as "published" | "draft" | "archived")}
                  className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                >
                  <span className="sr-only">Remove</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Badge>
            ))}

            {categoryFilter && (
              <Badge variant="secondary" className="flex gap-1 items-center">
                Category: {categoryFilter}
                <button onClick={() => setCategory("")} className="ml-1 rounded-full hover:bg-gray-200 p-0.5">
                  <span className="sr-only">Remove</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#006400]"></div>
            <p className="text-sm text-gray-500">Loading courses...</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">
            {courses.length === 0
              ? "No courses found. Create your first course to get started."
              : "No courses match your search criteria. Try adjusting your filters."}
          </p>
          {courses.length > 0 && (
            <Button variant="outline" onClick={resetFilters} className="mt-4 bg-transparent">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assigned Teacher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={course.thumbnailUrl || "/placeholder.svg?height=100&width=160&query=course"}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {course.title}
                          {course.aiModeEnabled && (
                            <Badge className="text-xs bg-green-100 text-green-700 border border-green-300">
                              AI Mode Enabled
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          {course.description}
                          {course.authorName && course.authorName !== "Unknown Author" && (
                            <div className="mt-1 text-xs text-gray-400">Created by: {course.authorName}</div>
                          )}
                        </div>

                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.assignedTeachers && course.assignedTeachers.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {course.assignedTeachers.map((teacher, idx) => (
                          <Badge key={idx} variant="secondary" className="w-fit">{teacher.name}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        course.type === "live"
                          ? "bg-blue-50 text-blue-600"
                          : course.type === "recorded"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-indigo-50 text-indigo-600"
                      }
                    >
                      {course.type === "live"
                        ? "Live Classes"
                        : course.type === "recorded"
                          ? "Recorded"
                          : "Live & Recorded"}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.duration} hours</TableCell>
                  <TableCell>
                    {enrollmentCounts[course.id] ?? 0}{" "}
                    {enrollmentCounts[course.id] === 1 ? "student" : "students"}
                  </TableCell>


                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        course.status === "published"
                          ? "bg-green-50 text-green-600"
                          : course.status === "draft"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600"
                      }
                    >
                      {course.status === "published" ? "Published" : course.status === "draft" ? "Draft" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCourse(course.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={course.aiModeEnabled ? undefined : () => handleEnableAIMode(course.id)}
                          className={course.aiModeEnabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Bot className="mr-2 h-4 w-4" /> {course.aiModeEnabled ? "AI Mode Enabled" : "Enable AI Mode"}
                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(course)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              <span className="font-semibold"> {courseToDelete?.title}</span> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showProgress && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-lg rounded-lg p-4 w-80 animate-fade-in">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{progressText}</p>
          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse w-full" />
          </div>
        </div>
      )}
    </div>
  )
}
