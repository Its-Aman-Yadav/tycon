"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  GraduationCap,
  Plus,
  Upload,
  Users,
  Video,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react"
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useParams } from "next/navigation"

// Define the steps for the batch editing process
type Step = "details" | "teachers" | "students" | "schedule" | "review" | "success"

// Define types for our data
type Teacher = {
  id: string
  name: string
  email?: string
  subjects: string[]
  avatar?: string
}

type Student = {
  id: string
  name: string
  email?: string
}

type Course = {
  id: string
  title: string
}

type Session = {
  day: string
  startTime: string
  endTime: string
  recurring: boolean
}

type BatchData = {
  id?: string
  name: string
  course: string
  mode: string
  startDate: string
  endDate: string
  scheduleFormat: string
  teachers: Teacher[]
  students: Student[]
  sessions: Session[]
  sendReminders: boolean
  meetingLink: string
}

// CSV upload states
type CsvUploadState = "idle" | "uploading" | "processing" | "success" | "error"

export default function EditBatchPage() {
  const [currentStep, setCurrentStep] = useState<Step>("details")
  const [batchData, setBatchData] = useState<BatchData>({
    name: "",
    course: "",
    mode: "live",
    startDate: "",
    endDate: "",
    scheduleFormat: "fixed",
    teachers: [],
    students: [],
    sessions: [],
    sendReminders: true,
    meetingLink: "",
  })

  // State for storing data from Firestore
  const [courses, setCourses] = useState<Course[]>([])
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [batchNotFound, setBatchNotFound] = useState(false)

  // CSV upload states
  const [csvUploadState, setCsvUploadState] = useState<CsvUploadState>("idle")
  const [csvUploadProgress, setCsvUploadProgress] = useState(0)
  const [csvUploadError, setCsvUploadError] = useState("")
  const [csvUploadResults, setCsvUploadResults] = useState<{
    total: number
    added: number
    duplicates: number
    invalid: number
  }>({ total: 0, added: 0, duplicates: 0, invalid: 0 })

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const params = useParams()
  const batchId = params?.id as string
  const { toast } = useToast()

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!batchId) {
        setBatchNotFound(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Fetch the specific batch
        const batchDoc = await getDoc(doc(db, "batches", batchId))
        if (!batchDoc.exists()) {
          setBatchNotFound(true)
          setIsLoading(false)
          return
        }

        const batchDataFromDb = batchDoc.data()

        // Fetch courses
        const coursesSnapshot = await getDocs(collection(db, "courses"))
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }))
        setCourses(coursesData)

        // Fetch teachers
        const teachersSnapshot = await getDocs(collection(db, "teachers"))
        const teachersData = teachersSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.fullName || data.name || "Unknown",
            email: data.email || data.contactEmail || "",
            subjects: data.subjects || [],
            avatar: data.profilePictureURL || data.avatar,
          }
        })
        setAllTeachers(teachersData)

        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, "students"))
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().fullName || doc.data().name || "Unknown",
          email: doc.data().email,
        }))
        setAllStudents(studentsData)

        // Map the batch data to our state structure
        const selectedTeachers = teachersData.filter((teacher) => batchDataFromDb.teacherIds?.includes(teacher.id))
        const selectedStudents = studentsData.filter((student) => batchDataFromDb.studentIds?.includes(student.id))

        setBatchData({
          id: batchId,
          name: batchDataFromDb.name || "",
          course: batchDataFromDb.courseId || "",
          mode: batchDataFromDb.mode || "live",
          startDate: batchDataFromDb.startDate || "",
          endDate: batchDataFromDb.endDate || "",
          scheduleFormat: batchDataFromDb.scheduleFormat || "fixed",
          teachers: selectedTeachers,
          students: selectedStudents,
          sessions: batchDataFromDb.sessions || [],
          sendReminders: batchDataFromDb.sendReminders ?? true,
          meetingLink: batchDataFromDb.meetingLink || "",
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load batch data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [batchId, toast])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBatchData({ ...batchData, [name]: value })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setBatchData({ ...batchData, [name]: value })
  }

  // Toggle teacher selection
  const toggleTeacher = (teacher: Teacher) => {
    setBatchData((prev) => {
      const isSelected = prev.teachers.some((t) => t.id === teacher.id)
      if (isSelected) {
        return { ...prev, teachers: prev.teachers.filter((t) => t.id !== teacher.id) }
      } else {
        return { ...prev, teachers: [...prev.teachers, teacher] }
      }
    })
  }

  // Toggle student selection
  const toggleStudent = (student: Student) => {
    setBatchData((prev) => {
      const isSelected = prev.students.some((s) => s.id === student.id)
      if (isSelected) {
        return { ...prev, students: prev.students.filter((s) => s.id !== student.id) }
      } else {
        return { ...prev, students: [...prev.students, student] }
      }
    })
  }

  // Add a session to the schedule
  const addSession = () => {
    setBatchData((prev) => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          day: "monday",
          startTime: "09:00",
          endTime: "10:30",
          recurring: true,
        },
      ],
    }))
  }

  // Update a session in the schedule
  const updateSession = (index: number, field: string, value: string | boolean) => {
    setBatchData((prev) => {
      const updatedSessions = [...prev.sessions]
      updatedSessions[index] = { ...updatedSessions[index], [field]: value }
      return { ...prev, sessions: updatedSessions }
    })
  }

  // Remove a session from the schedule
  const removeSession = (index: number) => {
    setBatchData((prev) => {
      const updatedSessions = [...prev.sessions]
      updatedSessions.splice(index, 1)
      return { ...prev, sessions: updatedSessions }
    })
  }

  // Navigate to the next step
  const nextStep = () => {
    if (currentStep === "details") setCurrentStep("teachers")
    else if (currentStep === "teachers") setCurrentStep("students")
    else if (currentStep === "students") setCurrentStep("schedule")
    else if (currentStep === "schedule") setCurrentStep("review")
    else if (currentStep === "review") setCurrentStep("success")
  }

  // Navigate to the previous step
  const prevStep = () => {
    if (currentStep === "teachers") setCurrentStep("details")
    else if (currentStep === "students") setCurrentStep("teachers")
    else if (currentStep === "schedule") setCurrentStep("students")
    else if (currentStep === "review") setCurrentStep("schedule")
  }

  // Handle CSV file upload (same as create page)
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvUploadState("uploading")
    setCsvUploadProgress(10)
    setCsvUploadError("")

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        setCsvUploadProgress(30)
        const csvText = event.target?.result as string
        setCsvUploadState("processing")
        setCsvUploadProgress(50)

        const results = parseCSV(csvText)
        setCsvUploadProgress(70)

        const { addedStudents, stats } = processStudentsFromCSV(results)

        setBatchData((prev) => ({
          ...prev,
          students: [...prev.students, ...addedStudents],
        }))

        setCsvUploadResults(stats)
        setCsvUploadProgress(100)
        setCsvUploadState("success")

        toast({
          title: "CSV Upload Successful",
          description: `Added ${stats.added} students from CSV file.`,
        })

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        setTimeout(() => {
          setCsvUploadState("idle")
        }, 3000)
      } catch (error) {
        console.error("Error processing CSV:", error)
        setCsvUploadState("error")
        setCsvUploadError(error instanceof Error ? error.message : "Failed to process CSV file")
        toast({
          title: "CSV Upload Failed",
          description: "There was an error processing your CSV file. Please check the format and try again.",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      setCsvUploadState("error")
      setCsvUploadError("Failed to read the file")
      toast({
        title: "CSV Upload Failed",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      })
    }

    reader.readAsText(file)
  }

  // Parse CSV text into array of objects (same as create page)
  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/)
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row")
    }

    const headers = lines[0].split(",").map((header) => header.trim().toLowerCase())

    if (!headers.includes("name")) {
      throw new Error("CSV file must contain a 'name' column")
    }

    const results = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",").map((value) => value.trim())
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ""
      })
      results.push(obj)
    }

    return results
  }

  // Process students from CSV data (same as create page)
  const processStudentsFromCSV = (csvData: Record<string, string>[]) => {
    const stats = {
      total: csvData.length,
      added: 0,
      duplicates: 0,
      invalid: 0,
    }

    const addedStudents: Student[] = []

    csvData.forEach((row) => {
      if (!row.name) {
        stats.invalid++
        return
      }

      const id = `csv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      const isDuplicate = batchData.students.some(
        (s) =>
          s.name.toLowerCase() === row.name.toLowerCase() ||
          (row.email && s.email && s.email.toLowerCase() === row.email.toLowerCase()),
      )

      if (isDuplicate) {
        stats.duplicates++
        return
      }

      addedStudents.push({
        id,
        name: row.name,
        email: row.email,
      })
      stats.added++
    })

    return { addedStudents, stats }
  }

  // Handle browse files button click
  const handleBrowseFiles = () => {
    fileInputRef.current?.click()
  }

  // Handle meeting link input
  const handleMeetingLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBatchData({ ...batchData, meetingLink: e.target.value })
  }

  // Update the batch in Firestore
  const updateBatch = async () => {
    if (!batchId) return

    setIsSaving(true)
    try {
      // Prepare updated batch data
      const batchToUpdate = {
        name: batchData.name,
        courseId: batchData.course,
        courseName: courses.find((c) => c.id === batchData.course)?.title || "",
        mode: batchData.mode,
        startDate: batchData.startDate,
        endDate: batchData.endDate,
        scheduleFormat: batchData.scheduleFormat,
        teacherIds: batchData.teachers.map((t) => t.id),
        teacherNames: batchData.teachers.map((t) => t.name),
        studentIds: batchData.students.map((s) => s.id),
        studentNames: batchData.students.map((s) => s.name),
        sessions: batchData.sessions,
        sendReminders: batchData.sendReminders,
        meetingLink: batchData.meetingLink,
        updatedAt: serverTimestamp(),
      }

      // ✅ Update Firestore
      await updateDoc(doc(db, "batches", batchId), batchToUpdate)
      console.log("✅ Batch updated successfully:", batchToUpdate)

      // ✅ Collect recipients
      const teacherEmails = batchData.teachers.map((t) => t.email).filter(Boolean)
      const studentEmails = batchData.students.map((s) => s.email).filter(Boolean)
      const allRecipients = [...teacherEmails, ...studentEmails]

      console.log("📧 Teacher Emails:", teacherEmails.length ? teacherEmails : "None found")
      console.log("🎓 Student Emails:", studentEmails.length ? studentEmails : "None found")
      console.log("👥 All Recipients to Notify:", allRecipients)

      // ✅ Send notification email
      if (allRecipients.length > 0) {
        try {
          const res = await fetch("/api/send-batch-update-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: allRecipients,
              batchName: batchData.name,               // ✅ required
              courseName: courses.find((c) => c.id === batchData.course)?.title || "",
              startDate: batchData.startDate,
              endDate: batchData.endDate,
              mode: batchData.mode,
              meetingLink: batchData.meetingLink,
              sessions: batchData.sessions,            // optional but useful
            }),

          })

          const data = await res.json()
          console.log("📨 Notification sent successfully:", data)
          toast({
            title: "Emails Sent",
            description: "Notifications sent to all batch members.",
          })
        } catch (err) {
          console.error("❌ Failed to send notification:", err)
          toast({
            title: "Partial Success",
            description: "Batch updated, but email notifications failed.",
            variant: "destructive",
          })
        }
      } else {
        console.log("⚠️ No recipients found to notify.")
      }

      // ✅ Show success toast and move to success screen
      toast({
        title: "Success",
        description: "Batch updated successfully!",
      })
      setCurrentStep("success")
    } catch (error) {
      console.error("❌ Error updating batch:", error)
      toast({
        title: "Error",
        description: "Failed to update batch. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }


  // Get the step number for display
  const getStepNumber = (step: Step): number => {
    const steps: Step[] = ["details", "teachers", "students", "schedule", "review"]
    return steps.indexOf(step) + 1
  }

  // Check if a step is complete
  const isStepComplete = (step: Step): boolean => {
    const currentStepNumber = getStepNumber(currentStep)
    const stepNumber = getStepNumber(step)
    return stepNumber < currentStepNumber
  }

  // Check if a step is active
  const isStepActive = (step: Step): boolean => {
    return step === currentStep
  }

  // Generate sample CSV template content
  const generateSampleCsv = () => {
    return "name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com"
  }

  // Download sample CSV template
  const downloadSampleCsv = () => {
    const csvContent = generateSampleCsv()
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "student_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="p-6">
          <div className="text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#006400] mx-auto" />
            <p>Loading batch data...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Show error state if batch not found
  if (batchNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold mb-2">Batch Not Found</h2>
            <p className="text-gray-600 mb-4">The batch you're trying to edit doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push("/dashboard/admin/batches")} className="bg-[#006400] hover:bg-[#005000]">
              Back to Batches
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-white shadow-md"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r-4 border-[#006400] bg-white shadow-xl md:flex">
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between bg-[#006400] px-4">
          <h1 className="text-xl font-bold text-white">Knowhive LMS</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-[#005000]"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Steps progress */}
        <div className="flex-1 p-4">
          <h2 className="mb-6 text-lg font-semibold">Edit Batch</h2>
          <div className="space-y-4">
            {[
              { step: "details" as Step, label: "Batch Details", icon: <FileText className="h-4 w-4" /> },
              { step: "teachers" as Step, label: "Assign Instrcutors", icon: <GraduationCap className="h-4 w-4" /> },
              { step: "students" as Step, label: "Add Employees", icon: <Users className="h-4 w-4" /> },
              { step: "schedule" as Step, label: "Schedule Classes", icon: <Calendar className="h-4 w-4" /> },
              { step: "review" as Step, label: "Review & Update", icon: <Check className="h-4 w-4" /> },
            ].map(({ step, label, icon }) => {
              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 rounded-md p-2 ${isStepActive(step)
                    ? "bg-[#e6f0e6] text-[#006400]"
                    : isStepComplete(step)
                      ? "text-gray-500"
                      : "text-gray-400"
                    }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${isStepActive(step)
                      ? "bg-[#006400] text-white"
                      : isStepComplete(step)
                        ? "bg-[#e6f0e6] text-[#006400]"
                        : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {isStepComplete(step) ? <Check className="h-4 w-4" /> : icon}
                  </div>
                  <span className="font-medium">{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <div className="container mx-auto px-4 py-8 pt-16 md:pt-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button onClick={() => router.push("/dashboard/admin/batches")} className="hover:text-[#006400]">
                Batches
              </button>
              <span>/</span>
              <span className="text-gray-900">Edit Batch</span>
            </nav>
          </div>

          {/* Step 1: Batch Details */}
          {currentStep === "details" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Edit Batch Details</h2>
                <p className="text-gray-600">Update the basic information for this batch</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Morning Batch 2023"
                    value={batchData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Select Course</Label>
                  <Select value={batchData.course} onValueChange={(value) => handleSelectChange("course", value)}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={batchData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={batchData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleFormat">Schedule Format</Label>
                  <Select
                    value={batchData.scheduleFormat}
                    onValueChange={(value) => handleSelectChange("scheduleFormat", value)}
                  >
                    <SelectTrigger id="scheduleFormat">
                      <SelectValue placeholder="Select schedule format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Days (e.g., Mon-Wed-Fri)</SelectItem>
                      <SelectItem value="custom">Custom Time Slots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Step 1 of 5</span>
                  <Button onClick={nextStep} className="bg-[#006400] hover:bg-[#005000]">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Assign Teachers */}
          {currentStep === "teachers" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Assign Trainer</h2>
                <p className="text-gray-600">Update teachers who will be responsible for this batch</p>
              </div>
              <div className="mb-4">
                <Label htmlFor="teacherSearch">Search Instructor</Label>
                <div className="relative">
                  <Input id="teacherSearch" placeholder="Search by name..." className="pl-10" />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {allTeachers.map((teacher) => {
                  const isSelected = batchData.teachers.some((t) => t.id === teacher.id)
                  return (
                    <div
                      key={teacher.id}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${isSelected
                        ? "border-[#006400] bg-[#e6f0e6]"
                        : "border-gray-200 hover:border-[#006400] hover:bg-[#f5f9f5]"
                        }`}
                      onClick={() => toggleTeacher(teacher)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {teacher.avatar ? (
                            <img
                              src={teacher.avatar || "/placeholder.svg"}
                              alt={teacher.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                                e.currentTarget.parentElement!.innerHTML = teacher.name.charAt(0).toUpperCase()
                              }}
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-500">
                              {teacher.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects &&
                              teacher.subjects.map((subject) => (
                                <span key={subject} className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-700">
                                  {subject}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${isSelected ? "bg-[#006400] text-white" : "border border-gray-300"
                              }`}
                          >
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {batchData.teachers.length > 0 && (
                <div className="mb-6 rounded-lg bg-[#e6f0e6] p-4">
                  <div className="mb-2 font-medium text-[#006400]">Selected Teachers ({batchData.teachers.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {batchData.teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm">
                        {teacher.name}
                        <button
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTeacher(teacher)
                          }}
                        >
                          <X className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Step 2 of 5</span>
                  <Button onClick={nextStep} className="bg-[#006400] hover:bg-[#005000]">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Add Students */}
          {currentStep === "students" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Manage Employees</h2>
                <p className="text-gray-600">Update students enrolled in this batch</p>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="font-medium">Manual Selection</div>
                  <div className="relative">
                    <Input placeholder="Search employees..." className="pl-10" />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-lg border">
                    {allStudents.map((student) => {
                      const isSelected = batchData.students.some((s) => s.id === student.id)
                      return (
                        <div
                          key={student.id}
                          className={`flex cursor-pointer items-center justify-between border-b p-3 last:border-b-0 ${isSelected ? "bg-[#e6f0e6]" : "hover:bg-gray-50"
                            }`}
                          onClick={() => toggleStudent(student)}
                        >
                          <div className="flex flex-col">
                            <span>{student.name}</span>
                            {student.email && <span className="text-xs text-gray-500">{student.email}</span>}
                          </div>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded ${isSelected ? "bg-[#006400] text-white" : "border border-gray-300"
                              }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="font-medium">Bulk Upload</div>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCsvUpload} />
                  {csvUploadState === "idle" ? (
                    <div
                      className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-[#006400] cursor-pointer"
                      onClick={handleBrowseFiles}
                    >
                      <Upload className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="mb-1 text-sm text-gray-600">Drag & drop CSV file here</p>
                      <p className="text-xs text-gray-500">or</p>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={handleBrowseFiles}>
                        Browse Files
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-gray-300 p-4">
                      {(csvUploadState === "uploading" || csvUploadState === "processing") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {csvUploadState === "uploading" ? "Uploading..." : "Processing..."}
                            </span>
                            <span className="text-xs text-gray-500">{csvUploadProgress}%</span>
                          </div>
                          <Progress value={csvUploadProgress} className="h-2" />
                        </div>
                      )}
                      {csvUploadState === "error" && (
                        <div className="space-y-3">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{csvUploadError || "Failed to process CSV file"}</AlertDescription>
                          </Alert>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setCsvUploadState("idle")}>
                              Try Again
                            </Button>
                          </div>
                        </div>
                      )}
                      {csvUploadState === "success" && (
                        <div className="space-y-3">
                          <Alert className="border-[#006400] bg-[#e6f0e6]">
                            <Check className="h-4 w-4 text-[#006400]" />
                            <AlertTitle className="text-[#006400]">Success</AlertTitle>
                            <AlertDescription>
                              <div className="text-sm text-gray-700">
                                <p>CSV file processed successfully!</p>
                                <ul className="mt-2 list-inside list-disc">
                                  <li>Total rows: {csvUploadResults.total}</li>
                                  <li>Added: {csvUploadResults.added}</li>
                                  {csvUploadResults.duplicates > 0 && (
                                    <li>Duplicates skipped: {csvUploadResults.duplicates}</li>
                                  )}
                                  {csvUploadResults.invalid > 0 && <li>Invalid entries: {csvUploadResults.invalid}</li>}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setCsvUploadState("idle")}>
                              Upload Another
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-center text-sm text-gray-500">
                    <button className="text-[#006400] hover:underline" onClick={downloadSampleCsv}>
                      Download sample template
                    </button>
                  </div>
                </div>
              </div>
              {batchData.students.length > 0 && (
                <div className="mb-6 rounded-lg bg-[#e6f0e6] p-4">
                  <div className="mb-2 font-medium text-[#006400]">Selected Students ({batchData.students.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {batchData.students.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm">
                        {student.name}
                        <button
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStudent(student)
                          }}
                        >
                          <X className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    {batchData.students.length > 5 && (
                      <div className="rounded-full bg-white px-3 py-1 text-sm">
                        +{batchData.students.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Step 3 of 5</span>
                  <Button onClick={nextStep} className="bg-[#006400] hover:bg-[#005000]">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Schedule */}
          {currentStep === "schedule" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Update Class Schedule</h2>
                <p className="text-gray-600">Modify the schedule for live classes</p>
              </div>
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Class Sessions</div>
                  <Button variant="outline" size="sm" className="text-[#006400] bg-transparent" onClick={addSession}>
                    <Plus className="mr-1 h-4 w-4" /> Add Session
                  </Button>
                </div>
                {batchData.sessions.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <Calendar className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">No sessions scheduled yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-[#006400] bg-transparent"
                      onClick={addSession}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Your First Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {batchData.sessions.map((session, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="font-medium">Session {index + 1}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                            onClick={() => removeSession(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor={`day-${index}`}>Day</Label>
                            <Select value={session.day} onValueChange={(value) => updateSession(index, "day", value)}>
                              <SelectTrigger id={`day-${index}`}>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                                <SelectItem value="sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`start-time-${index}`}>Start Time</Label>
                            <Input
                              id={`start-time-${index}`}
                              type="time"
                              value={session.startTime}
                              onChange={(e) => updateSession(index, "startTime", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-time-${index}`}>End Time</Label>
                            <Input
                              id={`end-time-${index}`}
                              type="time"
                              value={session.endTime}
                              onChange={(e) => updateSession(index, "endTime", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center">
                          <input
                            type="checkbox"
                            id={`recurring-${index}`}
                            className="h-4 w-4 rounded border-gray-300 text-[#006400] focus:ring-[#006400]"
                            checked={session.recurring}
                            onChange={(e) => updateSession(index, "recurring", e.target.checked)}
                          />
                          <label htmlFor={`recurring-${index}`} className="ml-2 text-sm text-gray-700">
                            Recurring weekly
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="rounded-lg border p-4">
                  <div className="mb-3 font-medium">Meeting Settings</div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="meeting-link">Meeting Link</Label>
                      <Input
                        id="meeting-link"
                        placeholder="e.g., Zoom or Google Meet URL"
                        value={batchData.meetingLink}
                        onChange={handleMeetingLinkChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Step 4 of 5</span>
                  <Button onClick={nextStep} className="bg-[#006400] hover:bg-[#005000]">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Step 5: Review & Update */}
          {currentStep === "review" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Review & Update</h2>
                <p className="text-gray-600">Review the updated batch details before saving</p>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Batch Name</div>
                      <div className="text-lg font-medium">{batchData.name || "Untitled Batch"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Course</div>
                      <div className="text-lg font-medium">
                        {courses.find((c) => c.id === batchData.course)?.title || "No course selected"}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Mode</div>
                      <div className="flex items-center">
                        <Video className="mr-1 h-4 w-4 text-[#006400]" />
                        <span>Live Classes</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Start Date</div>
                      <div>{batchData.startDate || "Not set"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">End Date</div>
                      <div>{batchData.endDate || "Not set"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Teachers</div>
                      <div className="flex flex-wrap gap-1">
                        {batchData.teachers.length > 0 ? (
                          batchData.teachers.map((teacher) => (
                            <span
                              key={teacher.id}
                              className="inline-flex items-center rounded-full bg-[#e6f0e6] px-2 py-0.5 text-xs text-[#006400]"
                            >
                              {teacher.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No teachers assigned</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Students</div>
                      <div>
                        {batchData.students.length > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-[#e6f0e6] px-2 py-0.5 text-xs text-[#006400]">
                            {batchData.students.length} students enrolled
                          </span>
                        ) : (
                          <span className="text-gray-500">No students enrolled</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-500">Meeting Link</div>
                    <div className="break-all">
                      {batchData.meetingLink ? (
                        <a
                          href={batchData.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#006400] hover:underline"
                        >
                          {batchData.meetingLink}
                        </a>
                      ) : (
                        <span className="text-gray-500">No meeting link provided</span>
                      )}
                    </div>
                  </div>
                </div>
                {batchData.sessions.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 font-medium">Scheduled Sessions</div>
                    <div className="space-y-2">
                      {batchData.sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-2">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-[#006400]" />
                            <span className="capitalize">{session.day}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <div>
                            {session.recurring ? (
                              <span className="rounded-full bg-[#e6f0e6] px-2 py-0.5 text-xs text-[#006400]">
                                Recurring
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                                One-time
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 flex flex-wrap justify-between gap-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={updateBatch} disabled={isSaving} className="bg-[#006400] hover:bg-[#005000]">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Batch"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Success State */}
          {currentStep === "success" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#e6f0e6]">
                  <Check className="h-10 w-10 text-[#006400]" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">Batch Successfully Updated!</h2>
                <p className="mb-6 text-gray-600">
                  Batch "{batchData.name || "Updated Batch"}" has been updated successfully.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" onClick={() => router.push("/dashboard/admin/batches")}>
                    View All Batches
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/admin/batches/${batchId}`)}
                    className="bg-[#006400] hover:bg-[#005000]"
                  >
                    View Batch Details
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
