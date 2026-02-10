"use client"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Star,
  Video,
  CheckCircle,
  AlertCircle,
  File,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trophy,
  BookOpen,
  Book,
  Presentation,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

// Define TypeScript interfaces
interface Question {
  id: string
  text: string
  type: string
  imageUrl?: string
  options?: {
    id: string
    text: string
    isCorrect: boolean
  }[]
}

interface Assignment {
  id: string
  title: string
  description: string
  questions: Question[]
}

interface Material {
  id: string
  title: string
  type: string
  content?: string
  videoUrl?: string
  pdfUrl?: string
  pdfFileName?: string
  pptUrl?: string
  pptFileName?: string
  imageUrl?: string
  imageFileName?: string
  duration?: number
}

interface Module {
  id: string
  title: string
  description: string
  estimatedTime: number
  materials: Material[]
  assignment?: Assignment
}

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  authorId: string
  teacherName?: string
  category: string
  level: string
  duration: number
  price: number
  status: string
  type: string
  visibility: string
  isFree: boolean
  modules: Module[]
  finalAssignment?: Assignment
  prerequisites?: string[]
  createdAt: any
  updatedAt: any
}

// Progress tracking interfaces
interface MaterialProgress {
  materialId: string
  completed: boolean
  completedAt?: Date
  timeSpent?: number // in seconds
  lastAccessedAt?: Date
}

interface ModuleProgress {
  moduleId: string
  completed: boolean
  completedAt?: Date
  materials: MaterialProgress[]
  assignmentScore?: number
  assignmentCompleted: boolean
  assignmentCompletedAt?: Date
}

interface UserCourseProgress {
  id?: string
  userId: string
  courseId: string
  enrolledAt: Date
  lastAccessedAt: Date
  overallProgress: number // 0-100
  completed: boolean
  completedAt?: Date
  status: "enrolled" | "started" | "halfway" | "completed" // Add this new field
  modules: ModuleProgress[]
  finalAssignmentScore?: number
  finalAssignmentCompleted: boolean
  finalAssignmentCompletedAt?: Date
  totalTimeSpent: number // in seconds
  certificateIssued: boolean
  certificateIssuedAt?: Date
}

// Review interface
interface CourseReview {
  id?: string
  userId: string
  courseId: string
  userName: string
  rating: number
  reviewText: string
  createdAt: Date
}

// Quiz Score interface
interface QuizScore {
  id?: string
  userId: string
  courseId: string
  moduleId?: string // null for final assessment
  assignmentId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  answers: Record<string, string>
  completedAt: Date
  isFinalAssessment: boolean
}

// PDF Viewer Component (unchanged)
const PDFViewer = ({ pdfUrl, fileName }: { pdfUrl: string; fileName?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const activeMaterialIdRef = useRef<string | null>(null)
  const [studentEmail, setStudentEmail] = useState<string | null>(null)

  useEffect(() => {
    const email = localStorage.getItem("studentEmail")
    console.log("Student email from localStorage:", email) // ✅ This should log in console
    setStudentEmail(email)
  }, [])

  useEffect(() => {
    // This useEffect is intended to fetch user review, but it relies on courseId which is not defined here.
    // It should likely be moved or refactored within the main component where courseId is available.
    // For now, commenting out to avoid potential issues if this component is used standalone without context.
    /*
    if (studentEmail && courseId) { // courseId is not defined in this scope
      fetchUserReview()
    }
    */
  }, [studentEmail /*, courseId */]) // Removed courseId from dependency array as it's not available

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true)
        setError(null)
        const pdfjsLib = await import("pdfjs-dist")
        if (typeof window !== "undefined") {
          // Use CDN worker directly to avoid bundler issues with Turbopack/Next.js 16
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
        }
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setCurrentPage(1)
      } catch (err) {
        console.error("Error loading PDF:", err)
        setError("Failed to load PDF. Please try downloading or opening in a new tab.")
      } finally {
        setLoading(false)
      }
    }

    if (pdfUrl) {
      loadPDF()
    }
  }, [pdfUrl])

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return
      try {
        const page = await pdfDoc.getPage(currentPage)
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height
        canvas.width = viewport.width
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }
        await page.render(renderContext).promise
      } catch (err) {
        console.error("Error rendering page:", err)
      }
    }
    renderPage()
  }, [pdfDoc, currentPage, scale])

  const handleDownloadPDF = () => {
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = fileName || "document.pdf"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewPDFInNewTab = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer")
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-red-500" />
            <div>
              <h3 className="font-medium">{fileName || "PDF Document"}</h3>
              <p className="text-sm text-muted-foreground">PDF Document</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewPDFInNewTab}
              className="flex items-center gap-2 bg-transparent"
            >
              <ExternalLink className="h-4 w-4" />
              View in New Tab
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
        <div className="flex items-center gap-3">
          <File className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="font-medium">{fileName || "PDF Document"}</h3>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPDFInNewTab}
            className="flex items-center gap-2 bg-transparent"
          >
            <ExternalLink className="h-4 w-4" />
            New Tab
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-3">
            {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg border p-4 overflow-auto">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" style={{ display: "block" }} />
        </div>
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  const params = useParams()
  const [studentEmail, setStudentEmail] = useState<string | null>(null)
  const courseId = params?.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null)

  // Progress tracking states
  const [userProgress, setUserProgress] = useState<UserCourseProgress | null>(null)
  const userProgressRef = useRef<UserCourseProgress | null>(null)

  useEffect(() => {
    userProgressRef.current = userProgress
  }, [userProgress])

  const [materialStartTime, setMaterialStartTime] = useState<number | null>(null)
  const [manualCompletionMode, setManualCompletionMode] = useState(false)

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [userReview, setUserReview] = useState<CourseReview | null>(null)
  const [hoverRating, setHoverRating] = useState(0)

  // Assessment modal states
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | undefined>(undefined)
  const [isFinalAssessment, setIsFinalAssessment] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)



  // Progress tracking functions
  const initializeUserProgress = async () => {
    if (!studentEmail || !courseId) return

    try {
      const progressRef = doc(db, "userCourseProgress", `${studentEmail}_${courseId}`)

      const progressSnap = await getDoc(progressRef)

      if (progressSnap.exists()) {
        const progressData = progressSnap.data() as UserCourseProgress
        // Add status field if it doesn't exist
        if (!progressData.status) {
          const currentStatus = updateProgressStatus(progressData.overallProgress || 0)
          progressData.status = currentStatus
          // Update the database with the new status field
          await updateDoc(progressRef, { status: currentStatus })
        }
        setUserProgress({ id: progressSnap.id, ...progressData })
      } else {
        // Create initial progress record
        if (!course) return
        const initialProgress: UserCourseProgress = {
          userId: studentEmail!,
          courseId: courseId,
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
          overallProgress: 0,
          completed: false,
          status: "enrolled", // Add this line
          modules: course.modules.map((module) => ({
            moduleId: module.id,
            completed: false,
            materials: module.materials.map((material) => ({
              materialId: material.id,
              completed: false,
            })),
            assignmentCompleted: false,
          })),
          finalAssignmentCompleted: false,
          totalTimeSpent: 0,
          certificateIssued: false,
        }

        await setDoc(progressRef, initialProgress)
        setUserProgress({ id: progressRef.id, ...initialProgress })
      }
    } catch (error) {
      console.error("Error initializing user progress:", error)
    }
  }

  // Review functions
  const fetchUserReview = async () => {
    const reviewsRef = collection(db, "courseReviews")
    const q = query(reviewsRef, where("courseId", "==", courseId), where("userName", "==", studentEmail))

    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      setUserReview({ id: doc.id, ...doc.data() } as CourseReview)
    } else {
      setUserReview(null)
    }
  }

  const handleStarClick = (rating: number) => {
    if (!studentEmail) return

    setSelectedRating(rating)
    setIsReviewModalOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!studentEmail || !courseId || selectedRating === 0) return

    try {
      const reviewData: CourseReview = {
        userId: studentEmail, // using email as ID
        courseId,
        userName: studentEmail, // fallback name
        rating: selectedRating,
        reviewText: reviewText.trim(),
        createdAt: new Date(),
      }

      if (userReview?.id) {
        // Update existing review
        const reviewRef = doc(db, "courseReviews", userReview.id)
        await updateDoc(reviewRef, {
          rating: selectedRating,
          reviewText: reviewText.trim(),
          createdAt: new Date(),
        })
        setUserReview({ ...userReview, ...reviewData })
      } else {
        // Create new review
        const reviewRef = await addDoc(collection(db, "courseReviews"), reviewData)
        setUserReview({ id: reviewRef.id, ...reviewData })
      }

      setIsReviewModalOpen(false)
      console.log("Review submitted successfully!")
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false)
    if (userReview) {
      setSelectedRating(userReview.rating)
      setReviewText(userReview.reviewText)
    }
  }

  const updateLastAccessed = async () => {
    if (!studentEmail || !courseId) return

    try {
      const progressRef = doc(db, "userCourseProgress", `${studentEmail}_${courseId}`)

      await updateDoc(progressRef, {
        lastAccessedAt: new Date(),
      })
    } catch (error) {
      console.error("Error updating last accessed:", error)
    }
  }

  const markMaterialAsCompleted = async (materialId: string, isManual = false) => {
    if (!studentEmail || !userProgress || !courseId) return

    try {
      const updatedModules = userProgress.modules.map((module) => {
        const materialIndex = module.materials.findIndex((m) => m.materialId === materialId)
        if (materialIndex !== -1) {
          const updatedMaterials = [...module.materials]
          updatedMaterials[materialIndex] = {
            ...updatedMaterials[materialIndex],
            completed: true,
            completedAt: new Date(),
          }

          // Check if this module has an assignment
          const courseModule = course?.modules.find((m) => m.id === module.moduleId)
          const hasAssignment = !!courseModule?.assignment

          // Check if all materials in this module are completed
          const allMaterialsCompleted = updatedMaterials.every((m) => m.completed)

          const isModuleCompleted = hasAssignment
            ? allMaterialsCompleted && (module.assignmentCompleted || false)
            : allMaterialsCompleted

          return {
            ...module,
            materials: updatedMaterials,
            completed: isModuleCompleted,
            completedAt: isModuleCompleted ? (module.completedAt || new Date()) : undefined,
          }
        }
        return module
      })

      const overallProgress = calculateOverallProgress(updatedModules, userProgress.finalAssignmentCompleted || false)
      const courseCompleted = overallProgress === 100
      const newStatus = updateProgressStatus(overallProgress)

      const updatedProgress = {
        ...userProgress,
        modules: updatedModules,
        overallProgress,
        completed: courseCompleted,
        completedAt: courseCompleted ? new Date() : userProgress.completedAt || undefined,
        status: newStatus,
      }

      // Clean the data before sending to Firestore - remove undefined values
      const cleanedProgress = {
        modules: updatedProgress.modules.map((module) => ({
          moduleId: module.moduleId,
          completed: module.completed || false,
          completedAt: module.completedAt || null,
          materials: module.materials.map((material) => ({
            materialId: material.materialId,
            completed: material.completed || false,
            completedAt: material.completedAt || null,
            timeSpent: material.timeSpent || 0,
            lastAccessedAt: material.lastAccessedAt || null,
          })),
          assignmentScore: module.assignmentScore || null,
          assignmentCompleted: module.assignmentCompleted || false,
          assignmentCompletedAt: module.assignmentCompletedAt || null,
        })),
        overallProgress: updatedProgress.overallProgress || 0,
        completed: updatedProgress.completed || false,
        completedAt: updatedProgress.completedAt || null,
        status: updatedProgress.status, // Add this line
        lastAccessedAt: new Date(),
      }

      const progressRef = doc(db, "userCourseProgress", `${studentEmail}_${courseId}`)

      await updateDoc(progressRef, cleanedProgress)
      setUserProgress(updatedProgress)

      console.log("Marking completed:", materialId, "For", studentEmail)

      // Issue certificate if course is completed
      if (courseCompleted && !userProgress.certificateIssued) {
        await issueCertificate()
      }
    } catch (error) {
      console.error("Error marking material as completed:", error)
    }
  }

  const updateTimeSpent = async (additionalTime: number) => {
    const currentProgress = userProgressRef.current
    if (!studentEmail || !currentProgress || !courseId) return

    try {
      const updatedProgress = {
        ...currentProgress,
        totalTimeSpent: currentProgress.totalTimeSpent + additionalTime,
      }

      const progressRef = doc(db, "userCourseProgress", `${studentEmail}_${courseId}`)

      await updateDoc(progressRef, {
        totalTimeSpent: updatedProgress.totalTimeSpent,
      })
      setUserProgress(updatedProgress)
    } catch (error) {
      console.error("Error updating time spent:", error)
    }
  }

  const saveAssignmentScore = async (moduleId: string | null, score: number, isFinal = false) => {
    if (!studentEmail || !userProgress || !courseId) return

    try {
      const updatedProgress = { ...userProgress }

      if (isFinal) {
        updatedProgress.finalAssignmentScore = score
        updatedProgress.finalAssignmentCompleted = true
        updatedProgress.finalAssignmentCompletedAt = new Date()
      } else if (moduleId) {
        updatedProgress.modules = userProgress.modules.map((module) => {
          if (module.moduleId === moduleId) {
            const allMaterialsCompleted = module.materials.every((m) => m.completed)
            return {
              ...module,
              assignmentScore: score,
              assignmentCompleted: true,
              assignmentCompletedAt: new Date(),
              completed: allMaterialsCompleted,
              completedAt: allMaterialsCompleted ? new Date() : module.completedAt || undefined,
            }
          }
          return module
        })
      }

      const overallProgress = calculateOverallProgress(
        updatedProgress.modules,
        updatedProgress.finalAssignmentCompleted || false,
      )
      const courseCompleted = overallProgress === 100
      const newStatus = updateProgressStatus(overallProgress)

      updatedProgress.overallProgress = overallProgress
      updatedProgress.completed = courseCompleted
      updatedProgress.status = newStatus
      if (courseCompleted) {
        updatedProgress.completedAt = new Date()
      }

      // Clean the data before sending to Firestore
      const updateData: any = {
        overallProgress: updatedProgress.overallProgress || 0,
        completed: updatedProgress.completed || false,
        completedAt: updatedProgress.completedAt || null,
        status: updatedProgress.status, // Add this line
        lastAccessedAt: new Date(),
      }

      if (isFinal) {
        updateData.finalAssignmentScore = score
        updateData.finalAssignmentCompleted = true
        updateData.finalAssignmentCompletedAt = new Date()
      } else {
        updateData.modules = updatedProgress.modules.map((module) => ({
          moduleId: module.moduleId,
          completed: module.completed || false,
          completedAt: module.completedAt || null,
          materials: module.materials.map((material) => ({
            materialId: material.materialId,
            completed: material.completed || false,
            completedAt: material.completedAt || null,
            timeSpent: material.timeSpent || 0,
            lastAccessedAt: material.lastAccessedAt || null,
          })),
          assignmentScore: module.assignmentScore || null,
          assignmentCompleted: module.assignmentCompleted || false,
          assignmentCompletedAt: module.assignmentCompletedAt || null,
        }))
      }

      const progressRef = doc(db, "userCourseProgress", `${studentEmail}_${courseId}`)

      // Store detailed quiz score
      const quizScoreData: QuizScore = {
        userId: studentEmail!,
        courseId: courseId,
        moduleId: isFinal ? undefined : (moduleId || undefined),
        assignmentId: currentAssignment?.id || "",
        score: score,
        totalQuestions: currentAssignment?.questions?.length || 0,
        correctAnswers: Math.round(
          (score / 100) * (currentAssignment?.questions?.filter((q) => q.type === "mcq").length || 0),
        ),
        answers: answers,
        completedAt: new Date(),
        isFinalAssessment: isFinal,
      }

      // Save to quizScores collection
      await addDoc(collection(db, "quizScores"), quizScoreData)

      await updateDoc(progressRef, updateData)
      setUserProgress(updatedProgress)

      // Issue certificate if course is completed
      if (courseCompleted && !userProgress.certificateIssued) {
        await issueCertificate()
      }
    } catch (error) {
      console.error("Error saving assignment score:", error)
    }
  }

  const calculateOverallProgress = (modules: ModuleProgress[], finalAssignmentCompleted: boolean): number => {
    if (!course) return 0

    const totalModules = modules.length
    const hasFinalAssignment = !!course.finalAssignment

    let completedModules = 0
    modules.forEach((module) => {
      const completedMaterials = module.materials.filter((m) => m.completed).length
      const totalMaterials = module.materials.length
      const hasAssignment = course.modules.find((m) => m.id === module.moduleId)?.assignment

      let moduleProgress = 0
      if (totalMaterials > 0) {
        moduleProgress += (completedMaterials / totalMaterials) * 0.8 // 80% for materials
      }
      if (hasAssignment && module.assignmentCompleted) {
        moduleProgress += 0.2 // 20% for assignment
      } else if (!hasAssignment) {
        moduleProgress = completedMaterials / totalMaterials
      }

      completedModules += moduleProgress
    })

    let overallProgress = (completedModules / totalModules) * (hasFinalAssignment ? 0.9 : 1.0)

    if (hasFinalAssignment && finalAssignmentCompleted) {
      overallProgress += 0.1 // 10% for final assignment
    }

    return Math.round(overallProgress * 100)
  }

  const issueCertificate = async () => {
    if (!studentEmail || !userProgress || !courseId) return

    try {
      const certificateData = {
        userId: studentEmail!,
        courseId: courseId,
        courseName: course?.title,
        studentName: studentEmail,
        completedAt: new Date(),
        finalScore: userProgress.finalAssignmentScore,
        totalTimeSpent: userProgress.totalTimeSpent,
        certificateId: `CERT_${studentEmail}_${courseId}_${Date.now()}`,
      }

      // Save certificate to certificates collection
      const certificateRef = doc(collection(db, "certificates"))
      await setDoc(certificateRef, certificateData)

      // Update user progress
      const progressRef = doc(db, "userCourseProgress", `${studentEmail}_${courseId}`)

      await updateDoc(progressRef, {
        certificateIssued: true,
        certificateIssuedAt: new Date(),
      })

      setUserProgress((prev) =>
        prev
          ? {
            ...prev,
            certificateIssued: true,
            certificateIssuedAt: new Date(),
          }
          : null,
      )

      console.log("Certificate issued successfully!")
    } catch (error) {
      console.error("Error issuing certificate:", error)
    }
  }

  // Helper functions
  const getMaterialProgress = (materialId: string): MaterialProgress | undefined => {
    if (!userProgress) return undefined

    for (const module of userProgress.modules) {
      const material = module.materials.find((m) => m.materialId === materialId)
      if (material) return material
    }
    return undefined
  }

  const getModuleProgress = (moduleId: string): ModuleProgress | undefined => {
    return userProgress?.modules.find((m) => m.moduleId === moduleId)
  }

  const getModuleCompletionPercentage = (moduleId: string): number => {
    const moduleProgress = getModuleProgress(moduleId)
    if (!moduleProgress) return 0

    const module = course?.modules.find((m) => m.id === moduleId)
    if (!module) return 0

    const completedMaterials = moduleProgress.materials.filter((m) => m.completed).length
    const totalMaterials = moduleProgress.materials.length
    const hasAssignment = !!module.assignment

    let progress = 0
    if (totalMaterials > 0) {
      progress += (completedMaterials / totalMaterials) * (hasAssignment ? 0.8 : 1.0)
    }
    if (hasAssignment && moduleProgress.assignmentCompleted) {
      progress += hasAssignment ? 0.2 : 0
    }

    return Math.round(progress * 100)
  }

  // Material tracking
  useEffect(() => {
    if (activeMaterialId) {
      setMaterialStartTime(Date.now())
      updateLastAccessed()
    }

    return () => {
      if (materialStartTime && activeMaterialId) {
        const timeSpent = Math.floor((Date.now() - materialStartTime) / 1000)
        if (timeSpent > 10) {
          // Only count if spent more than 10 seconds
          updateTimeSpent(timeSpent)
        }
      }
    }
  }, [activeMaterialId])

  useEffect(() => {
    if (!courseId || typeof courseId !== "string") return

    const loadData = async () => {
      try {
        setLoading(true)

        // 1. Get user email synchronously
        const email = localStorage.getItem("studentEmail")
        setStudentEmail(email)

        // 2. Start all fetches in parallel
        const coursePromise = getDoc(doc(db, "courses", courseId))

        const reviewPromise = email
          ? getDocs(query(collection(db, "courseReviews"), where("courseId", "==", courseId), where("userName", "==", email)))
          : Promise.resolve(null)

        const progressPromise = email
          ? getDoc(doc(db, "userCourseProgress", `${email}_${courseId}`))
          : Promise.resolve(null)

        // 3. Await all
        const [courseSnap, reviewSnap, progressSnap] = await Promise.all([coursePromise, reviewPromise, progressPromise])

        // 4. Process Course Data
        let fetchedCourse: Course | null = null
        if (courseSnap.exists()) {
          const courseData = courseSnap.data() as Omit<Course, "id">
          fetchedCourse = { id: courseSnap.id, ...courseData }
          setCourse(fetchedCourse)

          if (courseData.modules?.length) {
            setActiveModuleId(courseData.modules[0].id)
            if (courseData.modules[0].materials?.length) {
              setActiveMaterialId(courseData.modules[0].materials[0].id)
            }
          }
        } else {
          console.warn("Course not found")
          setLoading(false)
          return
        }

        // 5. Process Review Data
        if (reviewSnap && !reviewSnap.empty) {
          const doc = reviewSnap.docs[0]
          setUserReview({ id: doc.id, ...doc.data() } as CourseReview)
        } else {
          setUserReview(null)
        }

        // 6. Process Progress Data
        if (progressSnap && fetchedCourse && email) {
          if (progressSnap.exists()) {
            const progressData = progressSnap.data() as UserCourseProgress
            // Migration for status field
            if (!progressData.status) {
              const p = progressData.overallProgress || 0
              const currentStatus = p === 100 ? "completed" : p >= 50 ? "halfway" : p > 0 ? "started" : "enrolled"
              progressData.status = currentStatus
              // Fire and forget update
              updateDoc(progressSnap.ref, { status: currentStatus }).catch(e => console.error("Error updating status:", e))
            }
            setUserProgress({ id: progressSnap.id, ...progressData })
          } else {
            // Initialize new progress
            const initialProgress: UserCourseProgress = {
              userId: email,
              courseId: courseId,
              enrolledAt: new Date(),
              lastAccessedAt: new Date(),
              overallProgress: 0,
              completed: false,
              status: "enrolled",
              modules: fetchedCourse.modules.map((module) => ({
                moduleId: module.id,
                completed: false,
                materials: module.materials.map((material) => ({
                  materialId: material.id,
                  completed: false,
                })),
                assignmentCompleted: false,
              })),
              finalAssignmentCompleted: false,
              totalTimeSpent: 0,
              certificateIssued: false,
            }

            // We await this creation to ensure consistency, though it could be optimistic
            await setDoc(doc(db, "userCourseProgress", `${email}_${courseId}`), initialProgress)
            setUserProgress({ id: `${email}_${courseId}`, ...initialProgress })
          }
        }

      } catch (err) {
        console.error("Failed to fetch data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId])



  const getActiveMaterial = () => {
    if (!course || !activeModuleId || !activeMaterialId) return null
    const activeModule = course.modules.find((module) => module.id === activeModuleId)
    if (!activeModule) return null
    return activeModule.materials.find((material) => material.id === activeMaterialId)
  }

  const activeMaterial = getActiveMaterial()

  const getTotalDuration = () => {
    if (!course) return 0
    if (!course.modules) return course.duration || 0
    return course.modules.reduce((total, module) => {
      if (!module.materials) return total
      const moduleDuration = module.materials.reduce((sum, material) => {
        return sum + (material.duration || 0)
      }, 0)
      return total + moduleDuration
    }, 0)
  }

  const getTotalLectures = () => {
    if (!course) return 0
    if (!course.modules) return 0
    return course.modules.reduce((total, module) => {
      return total + (module.materials?.length || 0)
    }, 0)
  }

  const getActiveModuleIndex = () => {
    if (!course || !activeModuleId) return 0
    const index = course.modules.findIndex((module) => module.id === activeModuleId)
    return index !== -1 ? index : 0
  }

  // Assessment functions
  const handleStartFinalAssessment = () => {
    if (course?.finalAssignment) {
      setCurrentAssignment(course.finalAssignment)
      setIsFinalAssessment(true)
      resetAssessmentState()
      setIsAssessmentModalOpen(true)
    }
  }

  const handleTakeQuiz = (moduleId: string) => {
    const module = course?.modules.find((m) => m.id === moduleId)
    if (module?.assignment) {
      setCurrentAssignment(module.assignment)
      setIsFinalAssessment(false)
      resetAssessmentState()
      setIsAssessmentModalOpen(true)
    }
  }

  const resetAssessmentState = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSubmitted(false)
    setShowResults(false)
  }

  const handleCloseAssessment = () => {
    setIsAssessmentModalOpen(false)
    resetAssessmentState()
  }

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }))
  }

  const handleNextQuestion = () => {
    if (!currentAssignment) return
    const questions = currentAssignment.questions || []
    const isLastQuestion = currentQuestionIndex === questions.length - 1
    if (isLastQuestion) {
      setSubmitted(true)
      setShowResults(true)

      // Save the score
      const score = calculateScore()
      const moduleId = isFinalAssessment
        ? null
        : course?.modules.find((m) => m.assignment?.id === currentAssignment.id)?.id
      saveAssignmentScore(moduleId || null, score, isFinalAssessment)
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  const calculateScore = () => {
    if (!currentAssignment) return 0
    const questions = currentAssignment.questions || []
    if (!questions.length) return 0
    let correctAnswers = 0
    questions.forEach((question) => {
      if (question.type === "mcq" && question.options) {
        const selectedOptionId = answers[question.id]
        const selectedOption = question.options.find((opt) => opt.id === selectedOptionId)
        if (selectedOption?.isCorrect) {
          correctAnswers++
        }
      }
    })
    const mcqQuestions = questions.filter((q) => q.type === "mcq").length
    return mcqQuestions > 0 ? Math.round((correctAnswers / mcqQuestions) * 100) : 0
  }

  const updateProgressStatus = (progress: number): "enrolled" | "started" | "halfway" | "completed" => {
    if (progress === 100) return "completed"
    if (progress >= 50) return "halfway"
    if (progress > 0) return "started"
    return "enrolled"
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <Button onClick={() => window.history.back()}>
          Back to Courses
        </Button>
      </div>
    )
  }

  /*
   * NEW HELPER FUNCTIONS For Active Material Rendering
   */

  const renderCompletionCheckbox = (materialId: string) => (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`complete-${materialId}`}
          checked={getMaterialProgress(materialId)?.completed || false}
          onChange={(e) => {
            if (e.target.checked && !getMaterialProgress(materialId)?.completed) {
              markMaterialAsCompleted(materialId, true)
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <Label htmlFor={`complete-${materialId}`} className="text-sm font-medium">
          Mark as complete
        </Label>
      </div>
      {getMaterialProgress(materialId)?.completed && (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )}
    </div>
  )

  const renderActiveMaterialContent = () => {
    if (!activeMaterial) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed">
          <BookOpen className="h-10 w-10 text-slate-300 mb-4" />
          <p className="text-muted-foreground font-medium">Select a module and material to start learning</p>
        </div>
      )
    }

    // Explicitly reference the active material to ensure narrowing in closures
    const material = activeMaterial

    const renderMaterialBody = () => {
      if (material.type === "text" && material.content) {
        return (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p>{material.content}</p>
            </div>
            {renderCompletionCheckbox(material.id)}
          </div>
        )
      }

      if (material.type === "video" && material.videoUrl) {
        let embedUrl = material.videoUrl
        let useIframe = false

        // Check for YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const youtubeMatch = material.videoUrl.match(youtubeRegex)

        // Check for Vimeo
        const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/
        const vimeoMatch = material.videoUrl.match(vimeoRegex)

        // Check for Google Drive
        const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/
        const driveMatch = material.videoUrl.match(driveRegex)

        if (youtubeMatch && youtubeMatch[1]) {
          embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`
          useIframe = true
        } else if (vimeoMatch && vimeoMatch[1]) {
          embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`
          useIframe = true
        } else if (driveMatch && driveMatch[1]) {
          embedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`
          useIframe = true
        }

        return (
          <div className="space-y-4">
            <div className="aspect-video w-full border rounded-lg overflow-hidden bg-black">
              {useIframe ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={material.videoUrl}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
            {renderCompletionCheckbox(material.id)}
          </div>
        )
      }

      if (material.type === "pdf" && material.pdfUrl) {
        return (
          <div className="space-y-4">
            <div
              className="w-full h-[800px] border rounded-lg overflow-hidden bg-slate-100"
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                src={`${material.pdfUrl}#toolbar=0`}
                className="w-full h-full pointer-events-auto"
                title={material.pdfFileName || "PDF Document"}
              />
            </div>
            {renderCompletionCheckbox(material.id)}
          </div>
        )
      }


      if (material.type === "ppt" && material.pptUrl) {
        return (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <div className="flex items-center gap-3">
                <Presentation className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-medium">{material.pptFileName || "Presentation"}</h3>
                  <p className="text-sm text-muted-foreground">PowerPoint Presentation</p>
                </div>
              </div>
            </div>
            <div className="aspect-video w-full border rounded-lg overflow-hidden bg-slate-100">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(material.pptUrl)}&embedded=true`}
                width="100%"
                height="100%"
                frameBorder="0"
              >
                This is an embedded <a target="_blank" href="https://docs.google.com/gview">Google Docs</a> presentation.
              </iframe>
            </div>
            {renderCompletionCheckbox(material.id)}
          </div>
        )
      }

      if (material.type === "image" && material.imageUrl) {
        return (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <img
                src={material.imageUrl}
                alt={material.imageFileName || material.title}
                className="max-h-[600px] w-auto object-contain rounded-md"
              />
            </div>
            {renderCompletionCheckbox(material.id)}
          </div>
        )
      }

      return (
        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg">
          <File className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <p>Material content not available or format not supported</p>
        </div>
      )
    }

    return (
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <div className="text-sm text-primary font-medium mb-1">Module {getActiveModuleIndex() + 1}</div>
              <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xl">
                <span className="flex items-center gap-2">
                  {material.title}
                </span>
                <div>
                  {getMaterialProgress(material.id)?.completed ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-600">
                      In Progress
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderMaterialBody()}
        </CardContent>
      </Card>
    )
  }

  const renderAssessmentModalContent = () => {
    if (!currentAssignment) return null
    const questions = currentAssignment.questions || []
    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100
    const isAnswered = currentQuestion ? !!answers[currentQuestion.id] : false
    const score = calculateScore()

    if (showResults) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Assessment Results</DialogTitle>
            <DialogDescription>
              {isFinalAssessment ? "Final Assessment Results" : "Module Quiz Results"}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[60vh] px-2">
            <div className="text-center my-4">
              <div className="text-4xl font-bold">{score}%</div>
              <p className="text-muted-foreground">
                {score >= 70 ? "Great job!" : "Review the answers below."}
              </p>
            </div>

            {currentAssignment.questions.map((q, index) => {
              const userAnswerId = answers[q.id]
              const correctOption = q.options?.find((opt) => opt.isCorrect)
              const userAnswer = q.options?.find((opt) => opt.id === userAnswerId)

              return (
                <div key={q.id} className="mb-6 border rounded p-4">
                  <div className="font-medium mb-2">
                    Q{index + 1}: {q.text}
                  </div>

                  {q.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={q.imageUrl}
                        alt="Question Image"
                        className="rounded-lg max-h-[300px] w-auto border border-gray-200"
                      />
                    </div>
                  )}

                  {q.type === "mcq" && q.options && (
                    <ul className="space-y-2">
                      {q.options.map((option) => {
                        const isCorrect = option.isCorrect
                        const isSelected = option.id === userAnswerId
                        return (
                          <li
                            key={option.id}
                            className={`p-2 rounded border ${isCorrect
                              ? "border-green-500 bg-green-50"
                              : isSelected
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                              }`}
                          >
                            <span className="font-medium">{option.text}</span>
                            {isCorrect && <span className="ml-2 text-green-600 text-sm">(Correct)</span>}
                            {isSelected && !isCorrect && (
                              <span className="ml-2 text-red-600 text-sm">(Your Answer)</span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {q.type === "text" && (
                    <div className="mt-2">
                      <p className="text-muted-foreground text-sm">Your answer:</p>
                      <p className="border p-2 rounded bg-slate-100 dark:bg-slate-800">{answers[q.id] || "No answer"}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Fixed footer */}
          <DialogFooter className="mt-4">
            <Button onClick={handleCloseAssessment}>Close</Button>
          </DialogFooter>
        </>
      )
    }


    return (
      <>
        <DialogHeader>
          <DialogTitle>{currentAssignment.title}</DialogTitle>
          <DialogDescription>{currentAssignment.description}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="overflow-y-auto max-h-[60vh] px-2">
          {currentQuestion && (
            <div className="py-4">
              <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
              {currentQuestion.imageUrl && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question Image"
                    className="rounded-lg max-h-[400px] w-auto border border-gray-200 object-contain"
                  />
                </div>
              )}
              {currentQuestion.type === "mcq" && currentQuestion.options && (
                <RadioGroup value={answers[currentQuestion.id] || ""} className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors ${answers[currentQuestion.id] === option.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="text-base cursor-pointer flex items-center">
                          {option.text}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {currentQuestion.type === "text" && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  className="min-h-[150px]"
                />
              )}
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          <Button onClick={handleNextQuestion} disabled={!isAnswered}>
            {isLastQuestion ? "Submit" : "Next"}
          </Button>
        </DialogFooter>
      </>
    )
  }

  const renderReviewModal = () => {
    return (
      <Dialog open={isReviewModalOpen} onOpenChange={handleCloseReviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate this Course</DialogTitle>
            <DialogDescription>Share your experience with other learners</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${star <= (hoverRating || selectedRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {selectedRating > 0 && (
                <span>
                  {selectedRating === 1 && "Poor"}
                  {selectedRating === 2 && "Fair"}
                  {selectedRating === 3 && "Good"}
                  {selectedRating === 4 && "Very Good"}
                  {selectedRating === 5 && "Excellent"}
                </span>
              )}
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <Label htmlFor="review-text">Write a review (optional)</Label>
              <Textarea
                id="review-text"
                placeholder="Share your thoughts about this course..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseReviewModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={selectedRating === 0}>
              {userReview ? "Update Review" : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4" />
          Back to Courses
        </Button>
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-lg mb-4">{course.description}</p>

              {/* Progress Bar */}
              {userProgress && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Course Progress</span>
                    <span className="text-sm text-muted-foreground">{userProgress.overallProgress}% Complete</span>
                  </div>
                  <Progress value={userProgress.overallProgress} className="h-3" />
                  {userProgress.completed && (
                    <div className="flex items-center gap-2 mt-2 text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-medium">Course Completed!</span>
                      {userProgress.certificateIssued && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Certificate Issued
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`
                      ${!userProgress.status || userProgress.status === "enrolled" ? "bg-gray-100 text-gray-800" : ""}
                      ${userProgress.status === "started" ? "bg-blue-100 text-blue-800" : ""}
                      ${userProgress.status === "halfway" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${userProgress.status === "completed" ? "bg-green-100 text-green-800" : ""}
                    `}
                    >
                      {(userProgress.status || "enrolled").charAt(0).toUpperCase() +
                        (userProgress.status || "enrolled").slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Course Status</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-primary/10">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="bg-primary/10">
                  {course.level}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {course.modules.length} Modules
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                {userProgress && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className={`transition-colors hover:scale-110 ${studentEmail ? "cursor-pointer" : "cursor-not-allowed"}`}
                      disabled={!studentEmail}
                    >
                      <Star
                        className={`h-4 w-4 ${userReview && star <= userReview.rating ? "fill-yellow-500 text-yellow-500" : "text-yellow-500"
                          }`}
                      />
                    </button>
                  ))}
                  {userReview && <span className="ml-2 text-xs">Your rating: {userReview.rating}/5</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {renderActiveMaterialContent()}
        </div>

        {/* Right Column - Modules List */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Book className="h-5 w-5" />
              Course Modules
            </h2>
            <div className="space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 custom-scrollbar">
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module, moduleIndex) => {
                  const moduleProgress = getModuleProgress(module.id)
                  const completionPercentage = getModuleCompletionPercentage(module.id)

                  return (
                    <Card key={module.id} className={`border transition-all ${module.id === activeModuleId ? 'border-primary shadow-sm' : 'border-slate-200'}`}>
                      <CardHeader
                        className={`cursor-pointer p-4 ${module.id === activeModuleId
                          ? "bg-primary/5"
                          : "hover:bg-slate-50"
                          }`}
                        onClick={() => {
                          setActiveModuleId((prevId) => (prevId === module.id ? null : module.id))
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-semibold flex items-start gap-2 leading-tight">
                              <span className="flex-1">
                                Module {moduleIndex + 1}: {module.title}
                              </span>
                              {moduleProgress?.completed && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                            </CardTitle>
                            {completionPercentage > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{completionPercentage}%</span>
                                </div>
                                <Progress value={completionPercentage} className="h-1" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground ml-4">
                            {module.materials?.length || 0} lectures • {module.estimatedTime || 0} min
                          </div>
                        </div>
                      </CardHeader>
                      {activeModuleId === module.id && module.materials && (
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            {module.materials.map((material) => {
                              const materialProgress = getMaterialProgress(material.id)
                              return (
                                <div
                                  key={material.id}
                                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${activeMaterialId === material.id ? "bg-primary/10 dark:bg-primary/20 font-medium" : ""
                                    }`}
                                  onClick={() => {
                                    setActiveMaterialId(material.id)
                                    setActiveModuleId(module.id)
                                  }}
                                >
                                  {material.type === "video" ? (
                                    <Video className="h-5 w-5 text-primary" />
                                  ) : material.type === "pdf" ? (
                                    <File className="h-5 w-5 text-primary" />
                                  ) : material.type === "ppt" ? (
                                    <Presentation className="h-5 w-5 text-primary" />
                                  ) : material.type === "image" ? (
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-primary" />
                                  )}
                                  <div className={`flex-1 ${activeMaterialId === material.id ? "font-medium" : ""}`}>
                                    <span className="line-clamp-2 leading-snug text-sm">
                                      {material.title}
                                    </span>
                                  </div>
                                  {materialProgress?.completed && <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                                </div>
                              )
                            })}
                            {module.assignment && (
                              <div
                                className="flex flex-col gap-2 p-3 mt-2 rounded-md bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => handleTakeQuiz(module.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-medium flex items-center gap-2 flex-wrap text-sm">
                                      {module.assignment.title}
                                      {moduleProgress?.assignmentCompleted && (
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Assignment • {module.assignment.questions?.length || 0} questions
                                      {moduleProgress?.assignmentScore && (
                                        <span className="block mt-0.5 text-primary font-medium">
                                          Score: {moduleProgress.assignmentScore}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTakeQuiz(module.id)
                                  }}
                                >
                                  {moduleProgress?.assignmentCompleted ? "Retake Quiz" : "Take Quiz"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">No modules available for this course.</div>
              )}

              {course.finalAssignment && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Final Assessment
                      {userProgress?.finalAssignmentCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{course.finalAssignment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        {course.finalAssignment.questions?.length || 0} questions
                        {userProgress?.finalAssignmentScore && (
                          <span className="ml-2 text-primary font-medium">
                            Score: {userProgress.finalAssignmentScore}%
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={handleStartFinalAssessment}>
                        {userProgress?.finalAssignmentCompleted ? "Retake Assessment" : "Start Assessment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Modal */}
        <Dialog open={isAssessmentModalOpen} onOpenChange={handleCloseAssessment}>
          <DialogContent className="sm:max-w-2xl">{renderAssessmentModalContent()}</DialogContent>
        </Dialog>

        {/* Review Modal */}
        {renderReviewModal()}
      </div>
    </div>
  )
}
