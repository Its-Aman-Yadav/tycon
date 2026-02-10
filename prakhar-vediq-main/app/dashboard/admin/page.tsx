"use client"

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, addDoc, where } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, BookOpen, Clock, Target, Star, Calendar, Activity, RefreshCw, AlertCircle, Loader2, MessageSquare, Eye } from 'lucide-react'
import { AdminLayout } from "@/components/layout/admin-layout"
import { db } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X } from 'lucide-react'

// Updated interfaces to match Firestore structure
interface Material {
  completed: boolean
  completedAt: any
  lastAccessedAt: any
  materialId: string
  timeSpent: number
}

interface Module {
  assignmentCompleted: boolean
  assignmentCompletedAt: any
  assignmentScore: number | null
  completed: boolean
  completedAt: any
  materials: Material[]
  moduleId: string
}

interface UserCourseProgress {
  id: string
  certificateIssued: boolean
  completed: boolean
  completedAt: any
  courseId: string
  enrolledAt: any
  finalAssignmentCompleted: boolean
  finalAssignmentScore?: number  // Add this field
  lastAccessedAt: any
  modules: Module[]
  overallProgress: number
  status: string
  totalTimeSpent: number
  userId: string
  // Additional fields we'll fetch
  userName?: string
  userEmail?: string
  courseName?: string
  userAvatar?: string
}

interface CourseCompletionData {
  courseName: string
  totalEnrolled: number
  completed: number
  averageCompletion: number
  averageTimeSpent: number
}

interface DropOffData {
  stage: string
  count: number
  percentage: number
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Course {
  id: string
  title: string
  description?: string
}

interface CourseReview {
  id: string
  courseId: string
  rating: number
  reviewText: string
  userId: string
  userName: string
  createdAt: any
}

interface CourseRatingData {
  courseId: string
  courseName: string
  averageRating: number
  totalReviews: number
  reviews: CourseReview[]
}

interface EnrollmentRequest {
  userId: string
  courseId: string
  status: string
  createdAt: any
}

interface StudentData {
  fullName: string
  email: string
  education?: {
    grade?: string
    highestQualification?: string
    institution?: string
    yearOfCompletion?: string
  }
}

interface CourseData {
  title: string
}


export default function KPIAnalysisDashboard() {
  // State management
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([])
  const [courseStats, setCourseStats] = useState<CourseCompletionData[]>([])
  const [dropOffData, setDropOffData] = useState<DropOffData[]>([])
  const [quizScores, setQuizScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([])
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [courseReviews, setCourseReviews] = useState<CourseRatingData[]>([])
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false)
  const [selectedCourseReviews, setSelectedCourseReviews] = useState<CourseReview[]>([])
  const [selectedCourseName, setSelectedCourseName] = useState<string>('')


  // New dialog states for "View All" functionality
  const [isAllCoursesDialogOpen, setIsAllCoursesDialogOpen] = useState(false)
  const [isAllLearnersDialogOpen, setIsAllLearnersDialogOpen] = useState(false)
  const [isAllFeedbackDialogOpen, setIsAllFeedbackDialogOpen] = useState(false)

  // Fetch user data by ID or Email
  const fetchUserData = async (userId: string): Promise<User | null> => {
    try {
      // 1. Try regular doc lookup (assuming userId is a UID)
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as User
      }

      // 2. If not found, and userId looks like an email, try query by email field
      if (userId.includes('@')) {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('email', '==', userId))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]
          return {
            id: userDoc.id,
            ...userDoc.data()
          } as User
        }
      }

      return null
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      return null
    }
  }

  // Fetch course data by ID
  const fetchCourseData = async (courseId: string): Promise<Course | null> => {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId))
      if (courseDoc.exists()) {
        return {
          id: courseDoc.id,
          ...courseDoc.data()
        } as Course
      }
      return null
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error)
      return null
    }
  }

  // Firestore data fetching functions
  const fetchUserCourseProgress = async (): Promise<UserCourseProgress[]> => {
    try {
      const progressRef = collection(db, 'userCourseProgress')
      const q = query(progressRef, orderBy('lastAccessedAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const progressData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserCourseProgress))

      // Fetch additional user and course data
      const enrichedData = (await Promise.all(
        progressData.map(async (progress) => {
          const courseId = progress.courseId?.trim() || ''
          const userId = progress.userId?.trim() || ''

          const [userData, courseData] = await Promise.all([
            fetchUserData(userId),
            fetchCourseData(courseId)
          ])

          // Filter out if course or user doesn't exist
          if (!courseData || !userData) {
            return null
          }

          return {
            ...progress,
            userName: userData.name,
            userEmail: userData.email,
            courseName: courseData.title,
            userAvatar: userData.avatar
          }
        })
      )).filter(item => item !== null) as UserCourseProgress[]

      return enrichedData
    } catch (error) {
      console.error('Error fetching user course progress:', error)
      throw error
    }
  }

  const fetchCourseCompletionStats = async (progressData: UserCourseProgress[]): Promise<CourseCompletionData[]> => {
    try {
      const courseStats = new Map<string, {
        totalEnrolled: number
        completed: number
        totalCompletion: number
        totalTimeSpent: number
      }>()

      progressData.forEach(data => {
        const courseName = data.courseName || 'Unknown Course'

        if (!courseStats.has(courseName)) {
          courseStats.set(courseName, {
            totalEnrolled: 0,
            completed: 0,
            totalCompletion: 0,
            totalTimeSpent: 0
          })
        }

        const stats = courseStats.get(courseName)!
        stats.totalEnrolled++

        // Ensure values are numbers to avoid string concatenation
        const progressValue = Number(data.overallProgress) || 0
        const timeSpentValue = Number(data.totalTimeSpent) || 0

        stats.totalCompletion += progressValue
        stats.totalTimeSpent += timeSpentValue

        if (data.completed || progressValue >= 100) {
          stats.completed++
        }
      })

      return Array.from(courseStats.entries()).map(([courseName, stats]) => ({
        courseName,
        totalEnrolled: stats.totalEnrolled,
        completed: stats.completed,
        // Prevent division by zero
        averageCompletion: stats.totalEnrolled > 0 ? Math.round(stats.totalCompletion / stats.totalEnrolled) : 0,
        averageTimeSpent: stats.totalEnrolled > 0 ? Math.round(stats.totalTimeSpent / stats.totalEnrolled) : 0
      }))
    } catch (error) {
      console.error('Error processing course completion stats:', error)
      throw error
    }
  }

  const fetchDropOffAnalytics = async (progressData: UserCourseProgress[]): Promise<DropOffData[]> => {
    try {
      let enrolled = 0
      let started = 0
      let halfway = 0
      let completed = 0

      progressData.forEach(data => {
        enrolled++

        if (data.overallProgress > 0) started++
        if (data.overallProgress >= 50) halfway++
        if (data.completed || data.overallProgress >= 100) completed++
      })

      return [
        { stage: 'Enrolled', count: enrolled, percentage: 100 },
        { stage: 'Started', count: started, percentage: Math.round((started / enrolled) * 100) },
        { stage: 'Reached Halfway', count: halfway, percentage: Math.round((halfway / enrolled) * 100) },
        { stage: 'Completed', count: completed, percentage: Math.round((completed / enrolled) * 100) }
      ]
    } catch (error) {
      console.error('Error processing drop-off analytics:', error)
      throw error
    }
  }

  const fetchQuizScoreDistribution = async (progressData: UserCourseProgress[]) => {
    try {
      const distribution = {
        '0-30': 0,
        '31-60': 0,
        '61-80': 0,
        '81-100': 0
      }

      progressData.forEach(data => {
        // Use finalAssignmentScore if available
        if (data.finalAssignmentScore !== undefined && data.finalAssignmentScore !== null) {
          const score = data.finalAssignmentScore

          if (score <= 30) distribution['0-30']++
          else if (score <= 60) distribution['31-60']++
          else if (score <= 80) distribution['61-80']++
          else distribution['81-100']++
        } else {
          // Fallback to module assignment scores if finalAssignmentScore is not available
          const completedAssignments = data.modules.filter(module =>
            module.assignmentCompleted && module.assignmentScore !== null
          )

          if (completedAssignments.length > 0) {
            const avgScore = completedAssignments.reduce((sum, module) =>
              sum + (module.assignmentScore || 0), 0
            ) / completedAssignments.length

            if (avgScore <= 30) distribution['0-30']++
            else if (avgScore <= 60) distribution['31-60']++
            else if (avgScore <= 80) distribution['61-80']++
            else distribution['81-100']++
          } else {
            // If no scores available, categorize based on overall progress
            const progress = data.overallProgress || 0
            if (progress <= 30) distribution['0-30']++
            else if (progress <= 60) distribution['31-60']++
            else if (progress <= 80) distribution['61-80']++
            else distribution['81-100']++
          }
        }
      })

      return [
        { range: '0-30', count: distribution['0-30'], color: 'bg-red-500' },
        { range: '31-60', count: distribution['31-60'], color: 'bg-orange-500' },
        { range: '61-80', count: distribution['61-80'], color: 'bg-yellow-500' },
        { range: '81-100', count: distribution['81-100'], color: 'bg-green-500' }
      ]
    } catch (error) {
      console.error('Error processing quiz score distribution:', error)
      throw error
    }
  }

  // Calculate module time data from real data
  const calculateModuleTimeData = (progressData: UserCourseProgress[]) => {
    const moduleTimeMap = new Map<string, { totalTime: number, count: number }>()

    progressData.forEach(data => {
      data.modules.forEach(module => {
        const totalModuleTime = module.materials.reduce((sum, material) =>
          sum + (material.timeSpent || 0), 0
        )

        if (totalModuleTime > 0) {
          const moduleKey = module.moduleId
          if (!moduleTimeMap.has(moduleKey)) {
            moduleTimeMap.set(moduleKey, { totalTime: 0, count: 0 })
          }
          const stats = moduleTimeMap.get(moduleKey)!
          stats.totalTime += totalModuleTime
          stats.count++
        }
      })
    })

    return Array.from(moduleTimeMap.entries()).slice(0, 3).map(([moduleId, stats], index) => ({
      name: `Module ${index + 1}`,
      actual: Math.round(stats.totalTime / stats.count / 60), // Convert to minutes
      target: 15 // Default target
    }))
  }

  // Calculate weekly users data
  const calculateWeeklyUsersData = (progressData: UserCourseProgress[]) => {
    const now = new Date()
    const weeklyData = []

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const activeUsers = progressData.filter(data => {
        if (!data.lastAccessedAt) return false
        const lastAccessed = data.lastAccessedAt.toDate()
        return lastAccessed >= weekStart && lastAccessed < weekEnd
      }).length

      weeklyData.push({
        week: `Week ${4 - i}`,
        users: activeUsers
      })
    }

    return weeklyData
  }

  // Calculate peak activity times from real data
  const calculateActivityHeatmapData = (progressData: UserCourseProgress[]) => {
    // Initialize activity matrix for 7 days x 7 hours
    const activityMatrix = {
      "Mon": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 },
      "Tue": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 },
      "Wed": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 },
      "Thu": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 },
      "Fri": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 },
      "Sat": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 },
      "Sun": { "9AM": 0, "10AM": 0, "11AM": 0, "12PM": 0, "1PM": 0, "2PM": 0, "3PM": 0 }
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hourSlots = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM"]

    // Process each user's last accessed time
    progressData.forEach(data => {
      if (data.lastAccessedAt) {
        try {
          const accessDate = data.lastAccessedAt.toDate()
          const dayName = dayNames[accessDate.getDay()]
          const hour = accessDate.getHours()

          // Map hours to our time slots (9AM = 9, 10AM = 10, etc.)
          let timeSlot = ""
          if (hour >= 9 && hour < 10) timeSlot = "9AM"
          else if (hour >= 10 && hour < 11) timeSlot = "10AM"
          else if (hour >= 11 && hour < 12) timeSlot = "11AM"
          else if (hour >= 12 && hour < 13) timeSlot = "12PM"
          else if (hour >= 13 && hour < 14) timeSlot = "1PM"
          else if (hour >= 14 && hour < 15) timeSlot = "2PM"
          else if (hour >= 15 && hour < 16) timeSlot = "3PM"

          // Increment activity count for this day/time slot
          if (timeSlot && activityMatrix[dayName as keyof typeof activityMatrix]) {
            activityMatrix[dayName as keyof typeof activityMatrix][timeSlot as keyof typeof activityMatrix["Mon"]]++
          }
        } catch (error) {
          console.error('Error processing lastAccessedAt:', error)
        }
      }
    })

    // Convert to the expected format and normalize values (0-100 scale)
    const maxActivity = Math.max(
      ...Object.values(activityMatrix).flatMap(day => Object.values(day))
    )

    return Object.entries(activityMatrix).map(([day, hours]) => ({
      day,
      "9AM": maxActivity > 0 ? Math.round((hours["9AM"] / maxActivity) * 100) : 0,
      "10AM": maxActivity > 0 ? Math.round((hours["10AM"] / maxActivity) * 100) : 0,
      "11AM": maxActivity > 0 ? Math.round((hours["11AM"] / maxActivity) * 100) : 0,
      "12PM": maxActivity > 0 ? Math.round((hours["12PM"] / maxActivity) * 100) : 0,
      "1PM": maxActivity > 0 ? Math.round((hours["1PM"] / maxActivity) * 100) : 0,
      "2PM": maxActivity > 0 ? Math.round((hours["2PM"] / maxActivity) * 100) : 0,
      "3PM": maxActivity > 0 ? Math.round((hours["3PM"] / maxActivity) * 100) : 0
    }))
  }

  const fetchEnrollmentRequests = async () => {
    try {
      const enrollmentRef = collection(db, "enrollmentRequests")
      const q = query(enrollmentRef, where("status", "==", "pending"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const rawRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as EnrollmentRequest)
      }))

      const enrichedRequests = await Promise.all(
        rawRequests.map(async (request) => {
          const { userId, courseId } = request

          // 🔍 Fetch student details from `students` collection
          const studentRef = doc(db, "students", userId)
          const studentSnap = await getDoc(studentRef)

          const studentData = studentSnap.exists() ? (studentSnap.data() as StudentData) : null

          // 🔍 Fetch course details from `courses` collection
          const courseRef = doc(db, "courses", courseId)
          const courseSnap = await getDoc(courseRef)

          const courseData = courseSnap.exists() ? (courseSnap.data() as CourseData) : null

          return {
            ...request,
            userName: studentData?.fullName || `User ${userId.slice(-4)}`,
            userEmail: studentData?.email || "No email",
            courseTitle: courseData?.title || `Course ${courseId.slice(-4)}`,
            grade: studentData?.education?.grade || "N/A",
            qualification: studentData?.education?.highestQualification || "N/A",
            institution: studentData?.education?.institution || "N/A",
            yearOfCompletion: studentData?.education?.yearOfCompletion || "N/A",
          }
        })
      )

      setEnrollmentRequests(enrichedRequests)
    } catch (error) {
      console.error("Error fetching enrollment requests:", error)
    }
  }
  // Fetch course reviews and calculate averages
  const fetchCourseReviews = async (): Promise<CourseRatingData[]> => {
    try {
      const reviewsRef = collection(db, 'courseReviews')
      const q = query(reviewsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CourseReview))

      // Group reviews by courseId and calculate averages
      const courseReviewMap = new Map<string, {
        reviews: CourseReview[]
        totalRating: number
        courseName: string
      }>()

      for (const review of reviews) {
        if (!courseReviewMap.has(review.courseId)) {
          // Fetch course name
          const courseData = await fetchCourseData(review.courseId)
          courseReviewMap.set(review.courseId, {
            reviews: [],
            totalRating: 0,
            courseName: courseData?.title || `Course ${review.courseId.slice(-4)}`
          })
        }

        const courseData = courseReviewMap.get(review.courseId)!
        courseData.reviews.push(review)
        courseData.totalRating += review.rating
      }

      return Array.from(courseReviewMap.entries()).map(([courseId, data]) => ({
        courseId,
        courseName: data.courseName,
        averageRating: Math.round((data.totalRating / data.reviews.length) * 10) / 10,
        totalReviews: data.reviews.length,
        reviews: data.reviews
      }))
    } catch (error) {
      console.error('Error fetching course reviews:', error)
      throw error
    }
  }

  // Handle enrollment status update
  const handleUpdateEnrollmentStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(requestId)

      // Update the enrollment request status in Firestore
      await updateDoc(doc(db, 'enrollmentRequests', requestId), {
        status,
        updatedAt: new Date()
      })

      // If approved, create user course progress entry
      if (status === 'approved') {
        const request = enrollmentRequests.find(r => r.id === requestId)
        if (request) {
          await addDoc(collection(db, 'userCourseProgress'), {
            userId: request.userId,
            courseId: request.courseId,
            enrolledAt: new Date(),
            overallProgress: 0,
            completed: false,
            status: 'enrolled',
            modules: [],
            totalTimeSpent: 0,
            certificateIssued: false,
            finalAssignmentCompleted: false,
            lastAccessedAt: new Date()
          })
        }
      }

      // Remove from local state
      setEnrollmentRequests(prev => prev.filter(r => r.id !== requestId))

    } catch (error) {
      console.error('Error updating enrollment status:', error)
    } finally {
      setProcessingId(null)
    }
  }

  // Handle viewing course reviews
  const handleViewReviews = (courseReviews: CourseReview[], courseName: string) => {
    setSelectedCourseReviews(courseReviews)
    setSelectedCourseName(courseName)
    setIsReviewsDialogOpen(true)
  }

  // Format date helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    try {
      return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const progressData = await fetchUserCourseProgress()
      const completionStats = await fetchCourseCompletionStats(progressData)
      const dropOffStats = await fetchDropOffAnalytics(progressData)
      const quizDistribution = await fetchQuizScoreDistribution(progressData)

      // Fetch enrollment requests
      await fetchEnrollmentRequests()

      const reviewsData = await fetchCourseReviews()
      setCourseReviews(reviewsData)

      setUserProgress(progressData)
      setCourseStats(completionStats)
      setDropOffData(dropOffStats)
      setQuizScores(quizDistribution)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Dashboard data loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Error Loading Data</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Transform Firestore data for display - limit to last 5
  const courseCompletionData = courseStats.slice(-5).map(course => ({
    name: course.courseName,
    completion: course.averageCompletion,
    color: course.averageCompletion >= 80 ? "bg-green-500" :
      course.averageCompletion >= 60 ? "bg-yellow-500" : "bg-red-500"
  }))

  const learnerProgressData = userProgress.slice(0, 5).map(progress => ({
    name: progress.userName || 'Unknown User',
    email: progress.userEmail || 'No email',
    course: progress.courseName || 'Unknown Course',
    completion: progress.overallProgress || 0,
    lastAccessed: progress.lastAccessedAt ?
      new Date(progress.lastAccessedAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
      'Never',
    avatar: progress.userAvatar || "/placeholder-user.jpg",
  }))

  // Calculate dynamic data
  const moduleTimeData = calculateModuleTimeData(userProgress)
  const weeklyUsersData = calculateWeeklyUsersData(userProgress)
  const activityHeatmapData = calculateActivityHeatmapData(userProgress)

  // Calculate session attendance based on real data
  const avgCompletion = courseStats.length > 0
    ? Math.round(courseStats.reduce((sum, course) => sum + course.averageCompletion, 0) / courseStats.length)
    : 0

  // Mock data for features that need additional implementation
  const sentimentTags = ["Practical", "Engaging", "Well-structured", "Interactive"]

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">


        {/* Course Engagement Metrics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Course Engagement Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Completion Rate */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Course Completion Rate
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAllCoursesDialogOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseCompletionData.length > 0 ? (
                  courseCompletionData.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{course.name}</span>
                        <span className="text-muted-foreground">{course.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${course.color}`} style={{ width: `${course.completion}%` }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No course data available</p>
                )}
              </CardContent>
            </Card>

            {/* Enrollment Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Enrollment Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{enrollmentRequests.length}</div>
                  <div className="text-sm text-muted-foreground">Pending Requests</div>
                </div>
                <Button
                  onClick={() => setIsEnrollmentDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  Review Requests
                </Button>
              </CardContent>
            </Card>

            {/* Drop-off Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                  Drop-off Points (Funnel)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dropOffData.length > 0 ? (
                  dropOffData.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-muted-foreground">{stage.count} learners</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${stage.percentage >= 80
                            ? "bg-green-500"
                            : stage.percentage >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}
                          style={{ width: `${stage.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No drop-off data available</p>
                )}
              </CardContent>
            </Card>

            {/* Session Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={`${avgCompletion}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{avgCompletion}%</div>
                      <div className="text-xs text-muted-foreground">Average</div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Completed ({avgCompletion}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Remaining ({100 - avgCompletion}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learner Progress Analytics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Learner Progress Analytics</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Individual Learner Progress */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Individual Learner Progress</CardTitle>
                    <CardDescription>Track individual student performance across courses</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAllLearnersDialogOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learnerProgressData.length > 0 ? (
                    learnerProgressData.map((learner, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{learner.name}</div>
                            <div className="text-sm text-muted-foreground">{learner.email}</div>
                            <div className="text-sm text-blue-600">{learner.course}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{learner.completion}% Complete</div>
                          <div className="text-sm text-muted-foreground">Last: {learner.lastAccessed}</div>
                          <Progress value={learner.completion} className="w-24 mt-1" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No learner progress data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Scores Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizScores.length > 0 ? (
                  quizScores.map((score, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{score.range}%</span>
                        <span className="text-muted-foreground">{score.count} learners</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${score.color}`}
                          style={{ width: `${Math.min((score.count / Math.max(...quizScores.map(s => s.count))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No score data available</p>
                )}
              </CardContent>
            </Card>

            {/* Course Feedback & Ratings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Course Feedback & Ratings
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAllFeedbackDialogOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseReviews.length > 0 ? (
                    courseReviews.slice(0, 5).map((course, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{course.courseName}</div>
                            <div className="flex items-center gap-1">
                              <div className="text-yellow-500 font-bold">★ {course.averageRating}</div>
                              <span className="text-xs text-muted-foreground">({course.totalReviews} reviews)</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReviews(course.reviews, course.courseName)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-yellow-500">★ --</div>
                      <div className="text-sm text-muted-foreground">No reviews yet</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage & Access Trends */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Usage & Access Trends</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Users Per Week */}
            <Card>
              <CardHeader>
                <CardTitle>Active Users Per Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyUsersData.map((week, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">{week.week}</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="h-6 rounded-full bg-purple-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((week.users / Math.max(...weeklyUsersData.map(w => w.users))) * 100, 10)}%` }}
                          >
                            <span className="text-white text-xs font-medium">{week.users}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Activity Times Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Times</CardTitle>
                <CardDescription>Activity levels by day and time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-1 text-xs">
                    <div></div>
                    <div className="text-center">9AM</div>
                    <div className="text-center">10AM</div>
                    <div className="text-center">11AM</div>
                    <div className="text-center">12PM</div>
                    <div className="text-center">1PM</div>
                    <div className="text-center">2PM</div>
                    <div className="text-center">3PM</div>
                  </div>
                  {activityHeatmapData.map((day, index) => (
                    <div key={index} className="grid grid-cols-8 gap-1">
                      <div className="text-xs font-medium py-1">{day.day}</div>
                      <div
                        className={`h-6 rounded ${day["9AM"] > 60 ? "bg-green-500" : day["9AM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-6 rounded ${day["10AM"] > 60 ? "bg-green-500" : day["10AM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-6 rounded ${day["11AM"] > 60 ? "bg-green-500" : day["11AM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-6 rounded ${day["12PM"] > 60 ? "bg-green-500" : day["12PM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-6 rounded ${day["1PM"] > 60 ? "bg-green-500" : day["1PM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-6 rounded ${day["2PM"] > 60 ? "bg-green-500" : day["2PM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                      <div
                        className={`h-6 rounded ${day["3PM"] > 60 ? "bg-green-500" : day["3PM"] > 30 ? "bg-yellow-500" : "bg-gray-300"}`}
                      ></div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded"></div>
                      <span>Low (0-30%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Medium (31-60%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>High (61%+)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
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

                    <TableHead>Qualification</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Requested On</TableHead>




                    <TableHead className="text-right">Actions</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.courseTitle || request.courseId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.userName || request.userId}</span>
                          <span className="text-sm text-muted-foreground">{request.userEmail || "No email"}</span>
                        </div>
                      </TableCell>

                      <TableCell>{request.qualification || "—"}</TableCell>
                      <TableCell>{request.institution || "—"}</TableCell>


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

      {/* Reviews Dialog */}
      <Dialog open={isReviewsDialogOpen} onOpenChange={setIsReviewsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Reviews - {selectedCourseName}</DialogTitle>
            <DialogDescription>Student feedback and reviews for this course.</DialogDescription>
          </DialogHeader>
          {selectedCourseReviews.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No reviews found for this course.</div>
          ) : (
            <div className="max-h-[60vh] overflow-auto space-y-4">
              {selectedCourseReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{review.userName}</div>
                        <div className="flex items-center gap-1">
                          <div className="text-yellow-500">★ {review.rating}</div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{review.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* All Courses Dialog */}
      <Dialog open={isAllCoursesDialogOpen} onOpenChange={setIsAllCoursesDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Course Completion Rates</DialogTitle>
            <DialogDescription>Complete overview of all course completion statistics.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto space-y-4">
            {courseStats.map((course, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{course.courseName}</span>
                  <span className="text-muted-foreground">{course.averageCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${course.averageCompletion >= 80 ? "bg-green-500" :
                      course.averageCompletion >= 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                    style={{ width: `${course.averageCompletion}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Enrolled: {course.totalEnrolled}</span>
                  <span>Completed: {course.completed}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* All Learners Dialog */}
      <Dialog open={isAllLearnersDialogOpen} onOpenChange={setIsAllLearnersDialogOpen}>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>All Learner Progress</DialogTitle>
            <DialogDescription>Complete overview of all student performance across courses.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Accessed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userProgress.map((progress, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={progress.userAvatar || "/placeholder-user.jpg"} />
                          <AvatarFallback>
                            {(progress.userName || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{progress.userName}</div>
                          <div className="text-xs text-muted-foreground">{progress.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{progress.courseName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress.overallProgress || 0} className="w-20" />
                        <span className="text-sm">{progress.overallProgress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {progress.lastAccessedAt ?
                        new Date(progress.lastAccessedAt.toDate()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) :
                        'Never'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Feedback Dialog */}
      <Dialog open={isAllFeedbackDialogOpen} onOpenChange={setIsAllFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Course Feedback & Ratings</DialogTitle>
            <DialogDescription>Complete overview of all course ratings and feedback.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto space-y-4">
            {courseReviews.map((course, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{course.courseName}</div>
                    <div className="flex items-center gap-1">
                      <div className="text-yellow-500 font-bold">★ {course.averageRating}</div>
                      <span className="text-sm text-muted-foreground">({course.totalReviews} reviews)</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewReviews(course.reviews, course.courseName)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    View Reviews
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
