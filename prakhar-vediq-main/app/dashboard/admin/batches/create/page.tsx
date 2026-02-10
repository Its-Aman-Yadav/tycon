"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { scheduleRoombrMeeting } from "@/lib/roombr"
import dayjs from "dayjs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"


function generateISODate(day: string, time: string): string {
  const weekdayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }

  const targetDay = weekdayMap[day.toLowerCase()]
  const today = dayjs()
  const nextDate = today.day() <= targetDay
    ? today.day(targetDay)
    : today.add(1, "week").day(targetDay)

  const [hours, minutes] = time.split(":").map(Number)
  return nextDate.hour(hours).minute(minutes).second(0).millisecond(0).toISOString()
}

function cleanForFirestore(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (_, value) => (value === undefined ? null : value)))
}


// Define the steps for the batch creation process
type Step = "details" | "teachers" | "students" | "schedule" | "review" | "success"

// Define types for our data
type Teacher = {
  id: string
  name: string
  subjects: string[]
  avatar?: string
  email?: string
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

// CSV upload states
type CsvUploadState = "idle" | "uploading" | "processing" | "success" | "error"



export default function CreateBatchPage() {
  const [currentStep, setCurrentStep] = useState<Step>("details")
  const [batchData, setBatchData] = useState({
    name: "",
    course: "",
    mode: "live", // Default mode is always live now
    startDate: "",
    endDate: "",
    scheduleFormat: "fixed",
    teachers: [] as Teacher[],
    students: [] as Student[],
    sessions: [] as Session[],
    sendReminders: true,
  })

  // State for storing data from Firestore
  const [courses, setCourses] = useState<Course[]>([])
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newSubject, setNewSubject] = useState("");
  const [subjectTeacherId, setSubjectTeacherId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("")


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
  const { toast } = useToast()

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch courses
        const coursesSnapshot = await getDocs(collection(db, "courses"))
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }))
        setCourses(coursesData)

        // Fetch teachers - update to use the correct field names from Firestore
        const teachersSnapshot = await getDocs(collection(db, "teachers"))
        const teachersData = teachersSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.fullName || data.name || "Unknown", // Use fullName if available, fallback to name or "Unknown"
            subjects: data.subjects || [],
            email: data.email || "", // ✅ Add this line
            avatar: data.profilePictureURL || data.avatar, // Use profilePictureURL if available, fallback to avatar
          }
        })
        setAllTeachers(teachersData)

        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, "students"))
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().fullName || doc.data().name || "Unknown", // Use fullName if available
          email: doc.data().email,
        }))
        setAllStudents(studentsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

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
        console.log("Selected Teacher:", teacher)
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
    else if (currentStep === "students") {
      setCurrentStep("schedule")
    } else if (currentStep === "schedule") setCurrentStep("review")
    else if (currentStep === "review") setCurrentStep("success")
  }

  // Navigate to the previous step
  const prevStep = () => {
    if (currentStep === "teachers") setCurrentStep("details")
    else if (currentStep === "students") setCurrentStep("teachers")
    else if (currentStep === "schedule") setCurrentStep("students")
    else if (currentStep === "review") {
      setCurrentStep("schedule")
    }
  }

  // Handle CSV file upload
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

        // Process the CSV data
        setCsvUploadState("processing")
        setCsvUploadProgress(50)

        // Parse CSV
        const results = parseCSV(csvText)
        setCsvUploadProgress(70)

        // Add students from CSV
        const { addedStudents, stats } = processStudentsFromCSV(results)

        // Update the batch data with new students
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

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // After 3 seconds, reset the upload state
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

  // Parse CSV text into array of objects
  const parseCSV = (csvText: string) => {
    // Split by lines
    const lines = csvText.split(/\r\n|\n/)
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row")
    }

    // Parse header row
    const headers = lines[0].split(",").map((header) => header.trim().toLowerCase())

    // Validate required columns
    if (!headers.includes("name")) {
      throw new Error("CSV file must contain a 'name' column")
    }

    // Parse data rows
    const results = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue // Skip empty lines

      const values = line.split(",").map((value) => value.trim())

      // Create object with column values
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ""
      })

      results.push(obj)
    }

    return results
  }

  // Process students from CSV data
  const processStudentsFromCSV = (csvData: Record<string, string>[]) => {
    const stats = {
      total: csvData.length,
      added: 0,
      duplicates: 0,
      invalid: 0,
    }

    const addedStudents: Student[] = []

    // Process each row
    csvData.forEach((row) => {
      // Skip if no name
      if (!row.name) {
        stats.invalid++
        return
      }

      // Generate a unique ID for the student
      const id = `csv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Check if student already exists in the batch
      const isDuplicate = batchData.students.some(
        (s) =>
          s.name.toLowerCase() === row.name.toLowerCase() ||
          (row.email && s.email && s.email.toLowerCase() === row.email.toLowerCase()),
      )

      if (isDuplicate) {
        stats.duplicates++
        return
      }

      // Add the student
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


  // ✅ Updated createBatch function to use teacher info for Roombr host
  const createBatch = async () => {
    try {
      if (!batchData.sessions.length) {
        throw new Error("No session defined for Roombr meeting.")
      }

      const session = batchData.sessions[0]
      const firstTeacher = batchData.teachers[0]

      if (!firstTeacher || !firstTeacher.name) {
        throw new Error("At least one teacher must be assigned with a name")
      }

      // Split teacher name
      const nameParts = firstTeacher.name.trim().split(" ")
      const firstname = nameParts[0] || "Teacher"
      const lastname = nameParts.slice(1).join(" ") || ""

      const roombrPayload = {
        title: `${batchData.name}`,
        description: "Batch class session",
        duration: 45,
        meeting_type: "CONFERENCE",
        attendees: [],
        video_enabled: true,
        auto_record: true,
        is_public: true,
        is_user_room: true,
        start_date: generateISODate(session.day, session.startTime),
        repeat: {
          type: "Once",
          every: 1,
          ends: { never: false, after: 0 },
          weekDays: [],
          monthlyRepeatData: {
            monthlyRepeatType: "byDate",
            date: 0,
            weekNumber: 0,
            weekDay: 0,
          },
        },
        scheduled_type: "CLASS",
        host: {
          user_id: "1",
          firstname,
          lastname,
        },
        creator_id: firstTeacher.id,
        user_room_id: "1",
        tags: [],
        layouts: {
          recording: { enabled: true },
          meeting: {
            view: "speaker",
            board: "show",
            list: "show",
          },
          controls: {
            autoHideControls: true,
            autoOpenBoard: true,
          },
        },
      }

      const roombrResponse = await scheduleRoombrMeeting(roombrPayload)
      const sanitizedRoombrData = cleanForFirestore(roombrResponse.fullData)

      // Clean the full API response to make it Firestore-safe
      const fullRoombrData = JSON.parse(JSON.stringify(roombrResponse.fullData))

      const {
        meeting_id: meetingId,
        passcode,
        attendees,
        meeting_link,
        link
      } = fullRoombrData || {}


      console.log("✅ Roombr Meeting Scheduled:", {
        meetingId,
        passcode,
        attendees,
      })

      const batchToSave = {
        ...batchData,
        courseName: courses.find((c) => c.id === batchData.course)?.title || "",
        teacherIds: batchData.teachers.map((t) => t.id),
        teacherNames: batchData.teachers.map((t) => t.name),
        studentIds: batchData.students.map((s) => s.id),
        studentNames: batchData.students.map((s) => s.name),
        meetingId,
        passcode,
        attendees,
        roombrData: fullRoombrData, // ✅ Store entire response under `roombrData`
        createdAt: serverTimestamp(),
        status: "active",

      }


      await addDoc(collection(db, "batches"), cleanForFirestore(batchToSave))

      // Collect teacher and student emails
      const teacherEmails = batchData.teachers.map((t) => t.email).filter(Boolean)
      const studentEmails = batchData.students.map((s) => s.email).filter(Boolean)
      const allRecipients = [...new Set([...teacherEmails, ...studentEmails])]

      // 🪵 Log the collected emails for debugging
      console.log("📧 Teacher Emails:", teacherEmails.length ? teacherEmails : "None found")
      console.log("🎓 Student Emails:", studentEmails.length ? studentEmails : "None found")
      console.log("👥 All Recipients to Notify:", allRecipients.length ? allRecipients : "No recipients to notify")

      if (allRecipients.length > 0) {
        try {
          await fetch("/api/send-batch-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipients: allRecipients,
              batchName: batchData.name,
              courseName: batchData.course,
              startDate: batchData.startDate,
              endDate: batchData.endDate,
              sessions: batchData.sessions,
            }),
          })
          console.log("✅ Notification emails sent to all batch members.")
        } catch (emailErr) {
          console.error("Failed to send batch creation emails:", emailErr)
        }
      }



      toast({ title: "Success", description: "Batch created successfully!" })
      setCurrentStep("success")
    } catch (error) {
      console.error("Error creating batch:", error)
      toast({
        title: "Error",
        description: "Failed to create batch. Please try again.",
        variant: "destructive",
      })
    }
  }




  // Reset the form and start over
  const createAnotherBatch = () => {
    setBatchData({
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
    })
    setCurrentStep("details")
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

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="p-6">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#006400] border-t-transparent mx-auto"></div>
            <p>Loading data...</p>
          </div>
        </Card>
      </div>
    )
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

      {/* Sidebar - with prominent styling */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r-4 border-[#006400] bg-white shadow-xl md:flex">
        {/* Sidebar header with logo */}
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
          <h2 className="mb-6 text-lg font-semibold">Create New Batch</h2>
          <div className="space-y-4">
            {[
              { step: "details" as Step, label: "Batch Details", icon: <FileText className="h-4 w-4" /> },
              { step: "teachers" as Step, label: "Assign Teachers", icon: <GraduationCap className="h-4 w-4" /> },
              { step: "students" as Step, label: "Add Students", icon: <Users className="h-4 w-4" /> },
              { step: "schedule" as Step, label: "Schedule Classes", icon: <Calendar className="h-4 w-4" /> },
              { step: "review" as Step, label: "Review & Create", icon: <Check className="h-4 w-4" /> },
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
          {/* Step 1: Batch Details */}
          {currentStep === "details" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Batch Details</h2>
                <p className="text-gray-600">Enter the basic information for the new batch</p>
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
                  <Label htmlFor="course">Select or Enter Course</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {batchData.course || "Select or enter course"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search or type a new course..."
                          value={inputValue}
                          onValueChange={setInputValue}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left"
                              onClick={() => {
                                setBatchData({ ...batchData, course: inputValue })
                              }}
                            >
                              Use "<span className="font-semibold">{inputValue}</span>" as custom course
                            </Button>
                          </CommandEmpty>

                          {courses.map((course) => (
                            <CommandItem
                              key={course.id}
                              value={course.title}
                              onSelect={() => {
                                setBatchData({ ...batchData, course: course.title })
                                setInputValue(course.title) // optional: sync input with selection
                              }}
                            >
                              {course.title}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                <h2 className="text-2xl font-bold">Assign Teachers</h2>
                <p className="text-gray-600">Select teachers who will be responsible for this batch</p>
              </div>

              <div className="mb-4">
                <Label htmlFor="teacherSearch">Search Teachers</Label>
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
                                // If image fails to load, show initials instead
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
                          <svg
                            className="h-4 w-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
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
                <h2 className="text-2xl font-bold">Add Employee</h2>
                <p className="text-gray-600">Select students to enroll in this batch</p>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="font-medium">Manual Selection</div>
                  <div className="relative">
                    <Input placeholder="Search students..." className="pl-10" />
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

                  {/* Hidden file input */}
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCsvUpload} />

                  {/* CSV upload status */}
                  {csvUploadState === "idle" ? (
                    <div
                      className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-[#006400] cursor-pointer"
                      onClick={handleBrowseFiles}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0]

                          // Create a new file input event
                          const dataTransfer = new DataTransfer()
                          dataTransfer.items.add(file)

                          if (fileInputRef.current) {
                            fileInputRef.current.files = dataTransfer.files

                            // Trigger change event
                            const event = new Event("change", { bubbles: true })
                            fileInputRef.current.dispatchEvent(event)
                          }
                        }
                      }}
                    >
                      <Upload className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="mb-1 text-sm text-gray-600">Drag & drop CSV file here</p>
                      <p className="text-xs text-gray-500">or</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={handleBrowseFiles}>
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

          {/* Step 4: Schedule (Only for Live Mode) */}
          {currentStep === "schedule" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Live Class Schedule</h2>
                <p className="text-gray-600">Configure the schedule for live classes</p>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Class Sessions</div>
                  <Button variant="outline" size="sm" className="text-[#006400]" onClick={addSession}>
                    <Plus className="mr-1 h-4 w-4" /> Add Session
                  </Button>
                </div>

                {batchData.sessions.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                    <Calendar className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">No sessions scheduled yet</p>
                    <Button variant="outline" size="sm" className="mt-2 text-[#006400]" onClick={addSession}>
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
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
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
                              onChange={(e) => {
                                const startTime = e.target.value
                                updateSession(index, "startTime", startTime)

                                // Auto-calculate endTime as 45 minutes after startTime
                                const [hours, minutes] = startTime.split(":").map(Number)
                                const end = new Date()
                                end.setHours(hours)
                                end.setMinutes(minutes + 45)

                                const endHours = String(end.getHours()).padStart(2, "0")
                                const endMinutes = String(end.getMinutes()).padStart(2, "0")
                                const endTime = `${endHours}:${endMinutes}`

                                updateSession(index, "endTime", endTime)
                              }}
                            />

                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`end-time-${index}`}>End Time</Label>
                            <Input
                              id={`end-time-${index}`}
                              type="time"
                              value={session.endTime}
                              readOnly
                              disabled
                              className="cursor-not-allowed opacity-70"
                            />

                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

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

          {/* Step 5: Review & Create */}
          {currentStep === "review" && (
            <Card className="mx-auto max-w-3xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Review & Create</h2>
                <p className="text-gray-600">Review the batch details before creating</p>
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
                  <Button onClick={createBatch} className="bg-[#006400] hover:bg-[#005000]">
                    Create Batch
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
                <h2 className="mb-2 text-2xl font-bold">Batch Successfully Created!</h2>
                <p className="mb-6 text-gray-600">
                  Batch "{batchData.name || "New Batch"}" has been created successfully.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/admin/batches">View All Batches</a>
                  </Button>
                  <Button onClick={createAnotherBatch} className="bg-[#006400] hover:bg-[#005000]">
                    Create Another Batch
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
