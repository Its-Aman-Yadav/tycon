"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminLayout } from "@/components/layout/admin-layout"
import { PageHeader } from "@/components/common/page-header"
import { CourseCreationForm, type CourseData } from "@/components/courses/course-creation-form"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function EditCoursePage() {
    const params = useParams()
    const router = useRouter()
    const [course, setCourse] = useState<CourseData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const rawId = params?.id
                const courseId = Array.isArray(rawId) ? rawId[0] : rawId

                if (!courseId) return

                const courseRef = doc(db, "courses", courseId)
                const courseSnap = await getDoc(courseRef)

                if (courseSnap.exists()) {
                    // Normalize data to ensure it matches CourseData type
                    const data = courseSnap.data()
                    const courseData: CourseData = {
                        title: data.title || "",
                        description: data.description || "",
                        category: data.category || "",
                        level: data.level || "",
                        // Handle both string and array legacy types if necessary, default to "Recorded"
                        type: Array.isArray(data.type) ? data.type[0] : (data.type || "Recorded"),
                        duration: data.duration || 0,
                        price: data.price || 0,
                        isFree: data.isFree || false,
                        modules: data.modules || [],
                        finalAssignment: data.finalAssignment || null,
                        status: data.status || "draft",
                        visibility: data.visibility || "public",
                        prerequisites: data.prerequisites || [],
                        thumbnailUrl: data.thumbnailUrl || "",
                        promoVideoUrl: data.promoVideoUrl || "",
                    }
                    setCourse(courseData)
                } else {
                    toast({
                        title: "Course not found",
                        description: "The course you're trying to edit doesn't exist.",
                        variant: "destructive",
                    })
                    router.push("/dashboard/admin/courses")
                }
            } catch (error) {
                console.error("Error loading course:", error)
                toast({
                    title: "Error",
                    description: "Failed to load course data.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchCourse()
    }, [params, router])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!course) return null

    const courseId = Array.isArray(params?.id) ? params?.id[0] : params?.id

    return (
        <AdminLayout>
            <PageHeader
                title="Edit Course"
                description={`Edit content and settings for "${course.title}"`}
            />
            <div className="mt-6">
                <CourseCreationForm
                    initialData={course}
                    courseId={courseId}
                    isEditMode={true}
                />
            </div>
        </AdminLayout>
    )
}
