"use client"
import { useState, useEffect } from "react"
import {
  BookOpen,
  CheckCircle,
  FileText,
  Film,
  ListChecks,
  Plus,
  Save,
  Trash,
  Upload,
  Video,
  Loader2,
  File as FileIcon,
  Image as ImageIcon,
  Presentation,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react"
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"


// Define types for our course structure
export type MaterialType = "text" | "video" | "pdf" | "ppt" | "image"
export type Material = {
  id: string
  type: MaterialType
  title: string
  content?: string
  videoUrl?: string
  videoFile?: File
  videoFileName?: string
  duration?: number
  pdfUrl?: string
  pdfFile?: File
  pdfFileName?: string
  pptUrl?: string
  pptFile?: File
  pptFileName?: string
  imageUrl?: string
  imageFile?: File
  imageFileName?: string
  isUploading?: boolean
}

export type QuestionType = "mcq" | "text"
export type Option = {
  id: string
  text: string
  isCorrect: boolean
}

export type Question = {
  id: string
  type: QuestionType
  text: string
  imageUrl?: string // URL of the uploaded image
  isUploading?: boolean // UI state for upload progress
  options?: Option[]
  answer?: string
}

export type Assignment = {
  id: string
  title: string
  description: string
  questions: Question[]
}

export type Module = {
  id: string
  title: string
  description: string
  estimatedTime: number // in minutes
  materials: Material[]
  assignment: Assignment | null
}

export type CourseData = {
  title: string
  description: string
  category: string
  isFree: boolean
  level: string
  type: string
  duration: number
  price: number
  modules: Module[]
  finalAssignment: Assignment | null
  createdAt?: any
  updatedAt?: any
  authorId?: string
  status?: "draft" | "published"
  visibility?: "public" | "private" | "password"
  enrollmentLimit?: number
  prerequisites?: string[]
  thumbnailUrl?: string
  promoVideoUrl?: string
  assignedTeachers?: { id: string; name: string; email: string }[]
  assignedTeacherIds?: string[]
}

interface Teacher {
  id: string
  name: string
  email: string
}

interface CourseCreationFormProps {
  initialData?: CourseData
  courseId?: string
  isEditMode?: boolean
}

export function CourseCreationForm({
  initialData,
  courseId,
  isEditMode = false,
}: CourseCreationFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [activeModuleTab, setActiveModuleTab] = useState<string | null>(null)
  const [activeMaterialTab, setActiveMaterialTab] = useState<string>("text")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  // ✅ State for dialog & text input
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null)

  // Teachers State
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [openCombobox, setOpenCombobox] = useState(false)

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"))
        const teachersList: Teacher[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          teachersList.push({
            id: doc.id,
            name: data.fullName || data.name || "Unknown",
            email: data.email || "",
          })
        })
        setTeachers(teachersList)
      } catch (error) {
        console.error("Error fetching teachers:", error)
      }
    }
    fetchTeachers()
  }, [])

  // ✅ Open dialog for a specific module
  const openBulkUploadDialog = (moduleId: string) => {
    setCurrentModuleId(moduleId)
    setBulkText("")
    setBulkUploadOpen(true)
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)

    const newQuestions = lines
      .slice(1) // Skip header
      .map((line) => {
        const [text, opt1, opt2, opt3, opt4, correctIndexStr] = line.split(",").map((s) => s.trim())
        const correctIndex = parseInt(correctIndexStr)
        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) return null

        const questionId = crypto.randomUUID()
        return {
          id: questionId,
          type: "mcq",
          text,
          options: [opt1, opt2, opt3, opt4].map((opt, i) => ({
            id: crypto.randomUUID(),
            text: opt,
            isCorrect: i === correctIndex,
          })),
        }
      })
      .filter(Boolean)

    if (currentModuleId === "final") {
      setCourseData((prev) => {
        if (!prev.finalAssignment) return prev
        return {
          ...prev,
          finalAssignment: {
            ...prev.finalAssignment,
            questions: [...prev.finalAssignment.questions, ...(newQuestions as any[])],
          },
        }
      })
      setBulkUploadOpen(false)
    } else if (currentModuleId) {
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== currentModuleId || !m.assignment) return m
          return {
            ...m,
            assignment: {
              ...m.assignment,
              questions: [...m.assignment.questions, ...(newQuestions as any[])],
            },
          }
        }),
      }))
      setBulkUploadOpen(false)
    }
  }


  // ✅ Handle paste + parse
  const handleBulkUpload = (moduleId: string) => {
    const lines = bulkText.split("\n").map(line => line.trim()).filter(Boolean)

    const newQuestions = lines.map((line) => {
      const parts = line.split("||").map(p => p.trim())
      if (parts.length !== 6) return null

      const [text, opt1, opt2, opt3, opt4, correctIndexStr] = parts
      const correctIndex = parseInt(correctIndexStr)
      if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) return null

      const questionId = crypto.randomUUID()

      return {
        id: questionId,
        type: "mcq",
        text,
        options: [opt1, opt2, opt3, opt4].map((opt, i) => ({
          id: crypto.randomUUID(),
          text: opt,
          isCorrect: i === correctIndex,
        })),
      }
    }).filter(Boolean)

    if (moduleId === "final") {
      setCourseData((prev) => {
        if (!prev.finalAssignment) return prev
        return {
          ...prev,
          finalAssignment: {
            ...prev.finalAssignment,
            questions: [...prev.finalAssignment.questions, ...(newQuestions as any[])],
          },
        }
      })
    } else {
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId || !m.assignment) return m
          return {
            ...m,
            assignment: {
              ...m.assignment,
              questions: [...m.assignment.questions, ...(newQuestions as any[])],
            },
          }
        }),
      }))
    }

    setBulkUploadOpen(false)
  }


  // Initialize course data with default values
  const [courseData, setCourseData] = useState<CourseData>(
    initialData || {
      title: "",
      description: "",
      category: "",
      level: "",
      type: "Recorded",
      duration: 0,
      price: 0,
      isFree: false,
      modules: [],
      finalAssignment: null,
      status: "draft",
      visibility: "public",
      prerequisites: [],
      assignedTeachers: [],
      assignedTeacherIds: [],
    },
  )

  // State for editing module
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingModuleData, setEditingModuleData] = useState<Partial<Module>>({})

  // State for editing material
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
  const [editingMaterialData, setEditingMaterialData] = useState<Partial<Material>>({})

  // State for editing question
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editingQuestionData, setEditingQuestionData] = useState<Partial<Question>>({})

  // Function to update basic course info
  const updateCourseInfo = (field: keyof CourseData, value: any) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }



  // Function to add a new module
  const addModule = () => {
    const newModuleId = `module-${Date.now()}`
    const newModule: Module = {
      id: newModuleId,
      title: `New Module`,
      description: "",
      estimatedTime: 60, // Default 60 minutes
      materials: [],
      assignment: null,
    }
    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }))
    // Set this as the active module tab
    setActiveModuleTab(newModuleId)
  }

  // Function to update a module
  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => (module.id === moduleId ? { ...module, [field]: value } : module)),
    }))
  }

  // Function to delete a module
  const deleteModule = (moduleId: string) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== moduleId),
    }))
    // If the deleted module was active, set active to null
    if (activeModuleTab === moduleId) {
      setActiveModuleTab(null)
    }
  }



  // Function to add a new material to a module
  const addMaterial = (moduleId: string, type: MaterialType) => {
    const module = courseData.modules.find((m) => m.id === moduleId)
    if (!module) return

    const newMaterialId = `material-${moduleId}-${module.materials.length + 1}`
    const newMaterial: Material = {
      id: newMaterialId,
      type,
      title: `New ${type === "text" ? "Text" : type === "video" ? "Video" : type === "pdf" ? "PDF" : type === "ppt" ? "PPT" : "Image"} Material`,
      ...(type === "text"
        ? { content: "" }
        : type === "video"
          ? { videoUrl: "", duration: 0 }
          : type === "pdf"
            ? { pdfUrl: "" }
            : type === "ppt"
              ? { pptUrl: "" }
              : { imageUrl: "" }),
    }

    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
            ...module,
            materials: [...module.materials, newMaterial],
          }
          : module,
      ),
    }))

    // Start editing the new material
    setEditingMaterialId(newMaterialId)
    setEditingMaterialData(newMaterial)
  }

  // Function to update a material directly in the course data
  const updateMaterial = (moduleId: string, materialId: string, field: keyof Material, value: any) => {
    console.log(`Directly updating material ${materialId}, field: ${field}, value:`, value)
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
            ...module,
            materials: module.materials.map((material) =>
              material.id === materialId ? { ...material, [field]: value } : material,
            ),
          }
          : module,
      ),
    }))
  }

  // Function to save edited material
  const saveEditedMaterial = (moduleId: string) => {
    if (!editingMaterialId || !editingMaterialData) return

    console.log("Saving material with data:", editingMaterialData)

    // Find the module and material we're editing
    const module = courseData.modules.find((m) => m.id === moduleId)
    if (!module) return

    const materialIndex = module.materials.findIndex((m) => m.id === editingMaterialId)
    if (materialIndex === -1) return

    // Create a new materials array with the updated material
    const updatedMaterials = [...module.materials]
    updatedMaterials[materialIndex] = {
      ...module.materials[materialIndex],
      ...editingMaterialData,
    }

    // Update the course data with the new materials array
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, materials: updatedMaterials } : m)),
    }))

    // Log the updated material for debugging
    console.log("Updated material:", updatedMaterials[materialIndex])

    // Reset editing state
    setEditingMaterialId(null)
    setEditingMaterialData({})
  }

  // Function to delete a material
  const deleteMaterial = (moduleId: string, materialId: string) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
            ...module,
            materials: module.materials.filter((material) => material.id !== materialId),
          }
          : module,
      ),
    }))
  }

  // Function to create a new assignment for a module
  const createModuleAssignment = (moduleId: string) => {
    const module = courseData.modules.find((m) => m.id === moduleId)
    if (!module) return

    const newAssignment: Assignment = {
      id: `assignment-${moduleId}`,
      title: `${module.title} Assignment`,
      description: "Complete this assignment to test your understanding of the module.",
      questions: [],
    }

    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
            ...module,
            assignment: newAssignment,
          }
          : module,
      ),
    }))
  }

  // Function to add a question to an assignment
  const addQuestion = (moduleId: string | "final", type: QuestionType) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type,
      text: "",
      ...(type === "mcq" ? { options: [] } : { answer: "" }),
    }

    if (moduleId === "final") {
      // Add to final assignment
      if (!courseData.finalAssignment) {
        // Create final assignment if it doesn't exist
        setCourseData((prev) => ({
          ...prev,
          finalAssignment: {
            id: "final-assignment",
            title: "Final Course Assessment",
            description: "Demonstrate your understanding of all course materials",
            questions: [newQuestion],
          },
        }))
      } else {
        // Add to existing final assignment
        setCourseData((prev) => ({
          ...prev,
          finalAssignment: {
            ...prev.finalAssignment!,
            questions: [...prev.finalAssignment!.questions, newQuestion],
          },
        }))
      }
    } else {
      // Add to module assignment
      const module = courseData.modules.find((m) => m.id === moduleId)
      if (!module || !module.assignment) return

      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId && module.assignment
            ? {
              ...module,
              assignment: {
                ...module.assignment,
                questions: [...module.assignment.questions, newQuestion],
              },
            }
            : module,
        ),
      }))
    }

    // Start editing the new question
    setEditingQuestionId(newQuestion.id)
    setEditingQuestionData(newQuestion)
  }

  // Function to update a question
  const updateQuestion = (moduleId: string | "final", questionId: string, field: keyof Question, value: any) => {
    if (moduleId === "final") {
      // Update in final assignment
      if (!courseData.finalAssignment) return

      setCourseData((prev) => ({
        ...prev,
        finalAssignment: {
          ...prev.finalAssignment!,
          questions: prev.finalAssignment!.questions.map((question) =>
            question.id === questionId ? { ...question, [field]: value } : question,
          ),
        },
      }))
    } else {
      // Update in module assignment
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId && module.assignment
            ? {
              ...module,
              assignment: {
                ...module.assignment,
                questions: module.assignment.questions.map((question) =>
                  question.id === questionId ? { ...question, [field]: value } : question,
                ),
              },
            }
            : module,
        ),
      }))
    }
  }

  // Function to add an option to an MCQ question
  const addOption = (moduleId: string | "final", questionId: string) => {
    const newOption: Option = {
      id: `option-${Date.now()}`,
      text: "",
      isCorrect: false,
    }

    if (moduleId === "final") {
      // Add to final assignment
      if (!courseData.finalAssignment) return

      setCourseData((prev) => ({
        ...prev,
        finalAssignment: {
          ...prev.finalAssignment!,
          questions: prev.finalAssignment!.questions.map((question) =>
            question.id === questionId && question.type === "mcq"
              ? {
                ...question,
                options: [...(question.options || []), newOption],
              }
              : question,
          ),
        },
      }))
    } else {
      // Add to module assignment
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId && module.assignment
            ? {
              ...module,
              assignment: {
                ...module.assignment,
                questions: module.assignment.questions.map((question) =>
                  question.id === questionId && question.type === "mcq"
                    ? {
                      ...question,
                      options: [...(question.options || []), newOption],
                    }
                    : question,
                ),
              },
            }
            : module,
        ),
      }))
    }
  }

  // Function to update an option
  const updateOption = (
    moduleId: string | "final",
    questionId: string,
    optionId: string,
    field: keyof Option,
    value: any,
  ) => {
    if (moduleId === "final") {
      // Update in final assignment
      if (!courseData.finalAssignment) return

      setCourseData((prev) => ({
        ...prev,
        finalAssignment: {
          ...prev.finalAssignment!,
          questions: prev.finalAssignment!.questions.map((question) =>
            question.id === questionId && question.type === "mcq" && question.options
              ? {
                ...question,
                options: question.options.map((option) =>
                  option.id === optionId ? { ...option, [field]: value } : option,
                ),
              }
              : question,
          ),
        },
      }))
    } else {
      // Update in module assignment
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId && module.assignment
            ? {
              ...module,
              assignment: {
                ...module.assignment,
                questions: module.assignment.questions.map((question) =>
                  question.id === questionId && question.type === "mcq" && question.options
                    ? {
                      ...question,
                      options: question.options.map((option) =>
                        option.id === optionId ? { ...option, [field]: value } : option,
                      ),
                    }
                    : question,
                ),
              },
            }
            : module,
        ),
      }))
    }
  }

  // Function to delete a question
  const deleteQuestion = (moduleId: string | "final", questionId: string) => {
    if (moduleId === "final") {
      // Delete from final assignment
      if (!courseData.finalAssignment) return

      setCourseData((prev) => ({
        ...prev,
        finalAssignment: {
          ...prev.finalAssignment!,
          questions: prev.finalAssignment!.questions.filter((question) => question.id !== questionId),
        },
      }))
    } else {
      // Delete from module assignment
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId && module.assignment
            ? {
              ...module,
              assignment: {
                ...module.assignment,
                questions: module.assignment.questions.filter((question) => question.id !== questionId),
              },
            }
            : module,
        ),
      }))
    }
  }

  // Function to delete an option
  const deleteOption = (moduleId: string | "final", questionId: string, optionId: string) => {
    if (moduleId === "final") {
      // Delete from final assignment
      if (!courseData.finalAssignment) return

      setCourseData((prev) => ({
        ...prev,
        finalAssignment: {
          ...prev.finalAssignment!,
          questions: prev.finalAssignment!.questions.map((question) =>
            question.id === questionId && question.type === "mcq" && question.options
              ? {
                ...question,
                options: question.options.filter((option) => option.id !== optionId),
              }
              : question,
          ),
        },
      }))
    } else {
      // Delete from module assignment
      setCourseData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId && module.assignment
            ? {
              ...module,
              assignment: {
                ...module.assignment,
                questions: module.assignment.questions.map((question) =>
                  question.id === questionId && question.type === "mcq" && question.options
                    ? {
                      ...question,
                      options: question.options.filter((option) => option.id !== optionId),
                    }
                    : question,
                ),
              },
            }
            : module,
        ),
      }))
    }
  }

  // Handle Question Image Upload
  const handleQuestionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    moduleId: string | "final",
    questionId: string,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Set uploading state
    updateQuestion(moduleId, questionId, "isUploading", true)

    try {
      const storageRef = ref(storage, `questions/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      updateQuestion(moduleId, questionId, "imageUrl", downloadURL)

      toast({
        title: "Image uploaded",
        description: "Question image uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading question image:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      updateQuestion(moduleId, questionId, "isUploading", false)
    }
  }

  // Debug function to log course data
  useEffect(() => {
    // Log the course data whenever it changes
    console.log("Current course data:", courseData)
  }, [courseData])

  // Function to save course to Firestore
  const saveCourseToFirestore = async (status: "draft" | "published") => {
    try {
      setIsSubmitting(true)

      // Prepare the course data for Firestore
      const courseDataForFirestore = {
        ...courseData,
        status,
        updatedAt: serverTimestamp(),
        // Only set createdAt if it's a new course
        ...(isEditMode ? {} : { createdAt: serverTimestamp() }),
        // In a real app, you would get the authorId from authentication
        authorId: "user123", // Replace with actual user ID from auth
      }

      // Log the data before cleaning
      console.log("Course data before cleaning:", JSON.stringify(courseDataForFirestore, null, 2))

      // Remove any File objects that can't be stored in Firestore
      const cleanedData = JSON.parse(
        JSON.stringify(courseDataForFirestore, (key, value) => {
          // Skip File objects and circular references
          if (
            key === "videoFile" ||
            key === "pdfFile" ||
            key === "pptFile" ||
            key === "imageFile" ||
            key === "isUploading"
          ) {
            return undefined
          }
          // Check if value is a File object more safely
          if (value && typeof value === "object" && value.constructor && value.constructor.name === "File") {
            return undefined
          }
          return value
        }),
      )

      // Log the cleaned data to verify URLs are present
      console.log("Cleaned course data:", JSON.stringify(cleanedData, null, 2))

      if (isEditMode && courseId) {
        const courseRef = doc(db, "courses", courseId)
        await updateDoc(courseRef, cleanedData)
        toast({
          title: status === "published" ? "Course Updated & Published!" : "Course Updated!",
          description: `Your course has been successfully ${status === "published" ? "updated and published" : "updated"}.`,
        })
        // Redirect to a course management page or course view page
        router.push(`/dashboard/admin/courses`)
        return courseId
      } else {
        // Add the course to Firestore
        const coursesRef = collection(db, "courses")
        const docRef = await addDoc(coursesRef, cleanedData)

        toast({
          title: status === "published" ? "Course Published!" : "Course Saved as Draft",
          description: `Your course has been successfully ${status === "published" ? "published" : "saved as draft"}.`,
        })

        // Redirect to a course management page or course view page
        router.push(`/dashboard/admin/courses`)

        return docRef.id
      }
    } catch (error) {
      console.error("Error saving course:", error)
      toast({
        title: "Error",
        description: "There was an error saving your course. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle publishing the course
  const handlePublishCourse = async () => {
    await saveCourseToFirestore("published")
  }

  // Function to save as draft
  const handleSaveAsDraft = async () => {
    await saveCourseToFirestore("draft")
  }

  return (
    <div className="space-y-6">
      {/* Form Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "basic",
            label: "Basic Info",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            id: "modules",
            label: "Modules & Materials",
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            id: "assignments",
            label: "Assignments",
            icon: <ListChecks className="h-4 w-4" />,
          },
          { id: "media", label: "Media", icon: <Video className="h-4 w-4" /> },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            className={`flex items-center gap-2 ${activeTab === tab.id ? "bg-[#006400] text-white" : "text-gray-600"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Advanced JavaScript Programming"
                  value={courseData.title}
                  onChange={(e) => updateCourseInfo("title", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this course"
                  className="min-h-[120px]"
                  value={courseData.description}
                  onChange={(e) => updateCourseInfo("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={courseData.category} onValueChange={(value) => updateCourseInfo("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="app-development">App Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="videography">Videography</SelectItem>
                      <SelectItem value="writing">Creative Writing</SelectItem>
                      <SelectItem value="language-learning">Language Learning</SelectItem>
                      <SelectItem value="personal-development">Personal Development</SelectItem>
                      <SelectItem value="health-fitness">Health & Fitness</SelectItem>
                      <SelectItem value="academics">Academics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select value={courseData.level} onValueChange={(value) => updateCourseInfo("level", value)}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Course Type</Label>
                <div className="flex flex-col space-y-2 pt-2">
                  <RadioGroup
                    value={courseData.type}
                    onValueChange={(value) => updateCourseInfo("type", value)}
                    className="flex flex-col space-y-1 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recorded" id="recorded" />
                      <Label htmlFor="recorded" className="font-normal">
                        Recorded
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="livesessions" id="livesessions" />
                      <Label htmlFor="livesessions" className="font-normal">
                        Live Sessions
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="duration">Total Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="e.g. 12"
                    value={courseData.duration || ""}
                    onChange={(e) => updateCourseInfo("duration", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price: INR</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 49.99"
                      value={courseData.isFree ? "0" : courseData.price || ""}
                      onChange={(e) => updateCourseInfo("price", Number.parseFloat(e.target.value) || 0)}
                      disabled={courseData.isFree}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isFree"
                        checked={courseData.isFree}
                        onCheckedChange={(checked) => {
                          updateCourseInfo("isFree", checked === true)
                          if (checked) updateCourseInfo("price", 0)
                        }}
                      />
                      <Label htmlFor="isFree" className="text-sm cursor-pointer">
                        Set as Free
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="mb-2 mt-5 block">Assign Teachers</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {courseData.assignedTeachers?.map((teacher) => (
                    <Badge key={teacher.id} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                      {teacher.name}
                      <button
                        type="button"
                        className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                        onClick={() => {
                          const updatedTeachers = courseData.assignedTeachers?.filter((t) => t.id !== teacher.id) || []
                          const updatedIds = courseData.assignedTeacherIds?.filter((id) => id !== teacher.id) || []
                          updateCourseInfo("assignedTeachers", updatedTeachers)
                          updateCourseInfo("assignedTeacherIds", updatedIds)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {(!courseData.assignedTeachers || courseData.assignedTeachers.length === 0) && (
                    <span className="text-sm text-gray-500 italic">No teachers assigned yet</span>
                  )}
                </div>

                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between md:w-[400px]">
                      Select teacher...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search teachers..." />
                      <CommandList>
                        <CommandEmpty>No teacher found.</CommandEmpty>
                        <CommandGroup>
                          {teachers.map((teacher) => (
                            <CommandItem
                              key={teacher.id}
                              value={teacher.name}
                              onSelect={() => {
                                const currentTeachers = courseData.assignedTeachers || []
                                const currentIds = courseData.assignedTeacherIds || []

                                if (currentIds.includes(teacher.id)) {
                                  // Remove teacher
                                  const updatedTeachers = currentTeachers.filter((t) => t.id !== teacher.id)
                                  const updatedIds = currentIds.filter((id) => id !== teacher.id)
                                  updateCourseInfo("assignedTeachers", updatedTeachers)
                                  updateCourseInfo("assignedTeacherIds", updatedIds)
                                } else {
                                  // Add teacher
                                  updateCourseInfo("assignedTeachers", [...currentTeachers, teacher])
                                  updateCourseInfo("assignedTeacherIds", [...currentIds, teacher.id])
                                }
                                // Keep the combobox open for multi-select
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${courseData.assignedTeacherIds?.includes(teacher.id) ? "opacity-100" : "opacity-0"
                                  }`}
                              />
                              <div className="flex flex-col">
                                <span>{teacher.name}</span>
                                <span className="text-xs text-gray-500">{teacher.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>


          </CardContent>
        </Card >
      )
      }

      {/* Modules & Materials Tab */}
      {
        activeTab === "modules" && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Course Modules</h3>
                  <Button className="bg-[#006400]" onClick={addModule}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                  </Button>
                </div>

                {courseData.modules.length > 0 ? (
                  <div className="space-y-4">
                    <Tabs
                      value={activeModuleTab || courseData.modules[0].id}
                      onValueChange={setActiveModuleTab}
                      className="w-full"
                    >
                      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                        {courseData.modules.map((module, index) => (
                          <TabsTrigger
                            key={module.id}
                            value={module.id}
                            className="data-[state=active]:bg-[#006400] data-[state=active]:text-white border border-gray-200 bg-white"
                          >
                            Module {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {courseData.modules.map((module, moduleIndex) => (
                        <TabsContent key={module.id} value={module.id} className="mt-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Label htmlFor={`module-title-${module.id}`}>Module Title</Label>
                                <Input
                                  id={`module-title-${module.id}`}
                                  value={module.title}
                                  onChange={(e) => updateModule(module.id, "title", e.target.value)}
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                className="ml-2 text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
                                onClick={() => deleteModule(module.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>

                            <div>
                              <Label htmlFor={`module-description-${module.id}`}>Module Description</Label>
                              <Textarea
                                id={`module-description-${module.id}`}
                                value={module.description}
                                onChange={(e) => updateModule(module.id, "description", e.target.value)}
                              />
                            </div>

                            <div>
                              <Label htmlFor={`module-time-${module.id}`}>Estimated Completion Time (minutes)</Label>
                              <Input
                                id={`module-time-${module.id}`}
                                type="number"
                                min="1"
                                value={module.estimatedTime}
                                onChange={(e) =>
                                  updateModule(module.id, "estimatedTime", Number.parseInt(e.target.value) || 0)
                                }
                              />
                            </div>

                            <Separator className="my-4" />

                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-base font-medium">Module Materials</h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMaterial(module.id, "text")}
                                    className="flex items-center"
                                  >
                                    <FileText className="mr-1 h-4 w-4" /> Add Text
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMaterial(module.id, "video")}
                                    className="flex items-center"
                                  >
                                    <Film className="mr-1 h-4 w-4" /> Add Video
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMaterial(module.id, "pdf")}
                                    className="flex items-center"
                                  >
                                    <FileIcon className="mr-1 h-4 w-4" /> Add PDF
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMaterial(module.id, "ppt")}
                                    className="flex items-center"
                                  >
                                    <Presentation className="mr-1 h-4 w-4" /> Add PPT
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addMaterial(module.id, "image")}
                                    className="flex items-center"
                                  >
                                    <ImageIcon className="mr-1 h-4 w-4" /> Add Image
                                  </Button>
                                </div>
                              </div>

                              {module.materials.length > 0 ? (
                                <div className="mt-4 space-y-4">
                                  {module.materials.map((material) => (
                                    <div key={material.id} className="rounded-md border border-gray-200 p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {material.type === "text" ? (
                                            <FileText className="h-4 w-4 text-blue-500" />
                                          ) : material.type === "video" ? (
                                            <Film className="h-4 w-4 text-purple-500" />
                                          ) : material.type === "pdf" ? (
                                            <FileIcon className="h-4 w-4 text-red-500" />
                                          ) : material.type === "ppt" ? (
                                            <Presentation className="h-4 w-4 text-orange-500" />
                                          ) : (
                                            <ImageIcon className="h-4 w-4 text-pink-500" />
                                          )}
                                          <span className="font-medium">
                                            {material.title} ({material.type})
                                          </span>
                                          {material.type === "video" && material.videoUrl && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                              Video uploaded
                                            </span>
                                          )}
                                          {material.type === "pdf" && material.pdfUrl && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                              PDF uploaded
                                            </span>
                                          )}
                                          {material.type === "ppt" && material.pptUrl && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                              PPT uploaded
                                            </span>
                                          )}
                                          {material.type === "image" && material.imageUrl && (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                              Image uploaded
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex gap-2">
                                          {editingMaterialId === material.id ? (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => saveEditedMaterial(module.id)}
                                            >
                                              <Save className="mr-1 h-4 w-4" /> Save
                                            </Button>
                                          ) : (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditingMaterialId(material.id)
                                                setEditingMaterialData({
                                                  ...material,
                                                })
                                                setActiveMaterialTab(material.type)
                                              }}
                                            >
                                              Edit
                                            </Button>
                                          )}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
                                            onClick={() => deleteMaterial(module.id, material.id)}
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>

                                      {editingMaterialId === material.id && (
                                        <div className="mt-4 space-y-4">
                                          <div>
                                            <Label htmlFor={`material-title-${material.id}`}>Material Title</Label>
                                            <Input
                                              id={`material-title-${material.id}`}
                                              value={editingMaterialData.title || ""}
                                              onChange={(e) =>
                                                setEditingMaterialData({
                                                  ...editingMaterialData,
                                                  title: e.target.value,
                                                })
                                              }
                                            />
                                          </div>

                                          <Tabs
                                            value={activeMaterialTab}
                                            onValueChange={setActiveMaterialTab}
                                            className="w-full"
                                          >
                                            <TabsList className="w-full">
                                              <TabsTrigger value="text" className="flex-1">
                                                Text Content
                                              </TabsTrigger>
                                              <TabsTrigger value="video" className="flex-1">
                                                Video Content
                                              </TabsTrigger>
                                              <TabsTrigger value="pdf" className="flex-1">
                                                PDF Content
                                              </TabsTrigger>
                                              <TabsTrigger value="ppt" className="flex-1">
                                                PPT Content
                                              </TabsTrigger>
                                              <TabsTrigger value="image" className="flex-1">
                                                Image Content
                                              </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="text" className="mt-4">
                                              <div>
                                                <Label htmlFor={`material-content-${material.id}`}>Text Content</Label>
                                                <Textarea
                                                  id={`material-content-${material.id}`}
                                                  className="min-h-[200px]"
                                                  value={editingMaterialData.content ?? material.content ?? ""}
                                                  onChange={(e) => {
                                                    const val = e.target.value
                                                    setEditingMaterialData((prev) => ({
                                                      ...prev,
                                                      content: val,
                                                    }))
                                                    updateMaterial(module.id, material.id, "content", val)
                                                  }}
                                                  onBlur={(e) => {
                                                    updateMaterial(module.id, material.id, "content", e.target.value)
                                                  }}
                                                />
                                              </div>
                                            </TabsContent>

                                            <TabsContent value="video" className="mt-4">
                                              <div className="space-y-4">
                                                <div>
                                                  <Label>Upload Video</Label>
                                                  <div className="mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                                                    <Upload className="h-10 w-10 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">
                                                      Drag and drop a video, or{" "}
                                                      <span className="text-[#006400] cursor-pointer">browse</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                      Max file size: 500MB. Supported formats: MP4, MOV
                                                    </p>
                                                    <input
                                                      type="file"
                                                      className="hidden"
                                                      accept="video/*"
                                                      id={`video-upload-${editingMaterialId}`}
                                                      onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                          try {
                                                            const file = e.target.files[0]
                                                            // Update UI to show loading state
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              videoFile: file,
                                                              videoFileName: file.name,
                                                              isUploading: true,
                                                            })

                                                            // Create a reference to the file in Firebase Storage
                                                            const storageRef = ref(
                                                              storage,
                                                              `videos/${Date.now()}-${file.name}`,
                                                            )

                                                            // Upload the file to Firebase Storage
                                                            await uploadBytes(storageRef, file)

                                                            // Get the download URL
                                                            const downloadURL = await getDownloadURL(storageRef)

                                                            console.log("Video uploaded, URL:", downloadURL)

                                                            setEditingMaterialData((prev) => ({
                                                              ...prev,
                                                              videoFile: file,
                                                              videoFileName: file.name,
                                                              videoUrl: downloadURL,
                                                              isUploading: false,
                                                            }))

                                                            // Immediately push it to courseData as well
                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "videoUrl",
                                                              downloadURL,
                                                            )
                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "videoFileName",
                                                              file.name,
                                                            )

                                                            toast({
                                                              title: "Video uploaded",
                                                              description: "Your video has been uploaded successfully.",
                                                            })
                                                          } catch (error) {
                                                            console.error("Error uploading video:", error)
                                                            // Reset uploading state
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              isUploading: false,
                                                            })
                                                            toast({
                                                              title: "Upload failed",
                                                              description:
                                                                "There was an error uploading your video. Please try again.",
                                                              variant: "destructive",
                                                            })
                                                          }
                                                        }
                                                      }}
                                                    />
                                                    {editingMaterialData.isUploading && (
                                                      <div className="mt-2 flex items-center justify-center">
                                                        <Loader2 className="h-5 w-5 animate-spin text-[#006400]" />
                                                        <span className="ml-2 text-sm text-gray-600">
                                                          Uploading video...
                                                        </span>
                                                      </div>
                                                    )}
                                                    <Label
                                                      htmlFor={`video-upload-${editingMaterialId}`}
                                                      className="mt-4 cursor-pointer rounded-md bg-[#006400] px-4 py-2 text-sm font-medium text-white hover:bg-[#005000]"
                                                    >
                                                      Select Video
                                                    </Label>
                                                  </div>
                                                  {editingMaterialData.videoFileName && (
                                                    <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 p-2">
                                                      <Film className="h-4 w-4 text-[#006400]" />
                                                      <span className="text-sm">{editingMaterialData.videoFileName}</span>
                                                      {editingMaterialData.videoUrl && (
                                                        <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                          URL ready
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                  {editingMaterialData.videoUrl && (
                                                    <div className="mt-2">
                                                      <Label className="text-sm font-medium">Video Preview</Label>
                                                      <div className="mt-1 rounded-md border border-gray-200 overflow-hidden">
                                                        <video
                                                          src={editingMaterialData.videoUrl}
                                                          controls
                                                          className="w-full h-auto max-h-[200px]"
                                                        />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                                <div>
                                                  <Label htmlFor={`material-duration-${editingMaterialId}`}>
                                                    Video Duration (minutes)
                                                  </Label>
                                                  <Input
                                                    id={`material-duration-${editingMaterialId}`}
                                                    type="number"
                                                    min="1"
                                                    value={editingMaterialData.duration || ""}
                                                    onChange={(e) =>
                                                      setEditingMaterialData({
                                                        ...editingMaterialData,
                                                        duration: Number.parseInt(e.target.value) || 0,
                                                      })
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </TabsContent>

                                            <TabsContent value="pdf" className="mt-4">
                                              <div className="space-y-4">
                                                <div>
                                                  <Label>Upload PDF</Label>
                                                  <div className="mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                                                    <Upload className="h-10 w-10 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">
                                                      Drag and drop a PDF, or{" "}
                                                      <span className="text-[#006400] cursor-pointer">browse</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                      Max file size: 50MB. Supported format: PDF
                                                    </p>
                                                    <input
                                                      type="file"
                                                      className="hidden"
                                                      accept="application/pdf"
                                                      id={`pdf-upload-${editingMaterialId}`}
                                                      onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                          try {
                                                            const file = e.target.files[0]
                                                            // Update UI to show loading state
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              pdfFile: file,
                                                              pdfFileName: file.name,
                                                              isUploading: true,
                                                            })

                                                            // Create a reference to the file in Firebase Storage
                                                            const storageRef = ref(
                                                              storage,
                                                              `pdfs/${Date.now()}-${file.name}`,
                                                            )

                                                            // Upload the file to Firebase Storage
                                                            await uploadBytes(storageRef, file)

                                                            // Get the download URL
                                                            const downloadURL = await getDownloadURL(storageRef)

                                                            console.log("PDF uploaded, URL:", downloadURL)

                                                            setEditingMaterialData((prev) => ({
                                                              ...prev,
                                                              pdfFile: file,
                                                              pdfFileName: file.name,
                                                              pdfUrl: downloadURL,
                                                              isUploading: false,
                                                            }))

                                                            // Immediately push it to courseData as well
                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "pdfUrl",
                                                              downloadURL,
                                                            )
                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "pdfFileName",
                                                              file.name,
                                                            )

                                                            toast({
                                                              title: "PDF uploaded",
                                                              description: "Your PDF has been uploaded successfully.",
                                                            })
                                                          } catch (error) {
                                                            console.error("Error uploading PDF:", error)
                                                            // Reset uploading state
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              isUploading: false,
                                                            })
                                                            toast({
                                                              title: "Upload failed",
                                                              description:
                                                                "There was an error uploading your PDF. Please try again.",
                                                              variant: "destructive",
                                                            })
                                                          }
                                                        }
                                                      }}
                                                    />
                                                    {editingMaterialData.isUploading && (
                                                      <div className="mt-2 flex items-center justify-center">
                                                        <Loader2 className="h-5 w-5 animate-spin text-[#006400]" />
                                                        <span className="ml-2 text-sm text-gray-600">
                                                          Uploading PDF...
                                                        </span>
                                                      </div>
                                                    )}
                                                    <Label
                                                      htmlFor={`pdf-upload-${editingMaterialId}`}
                                                      className="mt-4 cursor-pointer rounded-md bg-[#006400] px-4 py-2 text-sm font-medium text-white hover:bg-[#005000]"
                                                    >
                                                      Select PDF
                                                    </Label>
                                                  </div>
                                                  {editingMaterialData.pdfFileName && (
                                                    <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 p-2">
                                                      <FileIcon className="h-4 w-4 text-[#006400]" />
                                                      <span className="text-sm">{editingMaterialData.pdfFileName}</span>
                                                      {editingMaterialData.pdfUrl && (
                                                        <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                          URL ready
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                  {editingMaterialData.pdfUrl && (
                                                    <div className="mt-2">
                                                      <Label className="text-sm font-medium">PDF Preview</Label>
                                                      <div className="mt-1 rounded-md border border-gray-200 p-4">
                                                        <div className="flex items-center gap-2">
                                                          <FileIcon className="h-6 w-6 text-red-500" />
                                                          <div>
                                                            <p className="text-sm font-medium">
                                                              {editingMaterialData.pdfFileName}
                                                            </p>
                                                            <a
                                                              href={editingMaterialData.pdfUrl}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-xs text-[#006400] hover:underline"
                                                            >
                                                              View PDF
                                                            </a>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </TabsContent>

                                            <TabsContent value="ppt" className="mt-4">
                                              <div className="space-y-4">
                                                <div>
                                                  <Label>Upload PPT</Label>
                                                  <div className="mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                                                    <Upload className="h-10 w-10 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">
                                                      Drag and drop a PPT, or{" "}
                                                      <span className="text-[#006400] cursor-pointer">browse</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                      Max file size: 50MB. Supported formats: PPT, PPTX
                                                    </p>
                                                    <input
                                                      type="file"
                                                      className="hidden"
                                                      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                                      id={`ppt-upload-${editingMaterialId}`}
                                                      onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                          try {
                                                            const file = e.target.files[0]
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              pptFile: file,
                                                              pptFileName: file.name,
                                                              isUploading: true,
                                                            })

                                                            const storageRef = ref(
                                                              storage,
                                                              `ppts/${Date.now()}-${file.name}`,
                                                            )

                                                            await uploadBytes(storageRef, file)
                                                            const downloadURL = await getDownloadURL(storageRef)

                                                            setEditingMaterialData((prev) => ({
                                                              ...prev,
                                                              pptFile: file,
                                                              pptFileName: file.name,
                                                              pptUrl: downloadURL,
                                                              isUploading: false,
                                                            }))

                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "pptUrl",
                                                              downloadURL,
                                                            )
                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "pptFileName",
                                                              file.name,
                                                            )

                                                            toast({
                                                              title: "PPT uploaded",
                                                              description: "Your PPT has been uploaded successfully.",
                                                            })
                                                          } catch (error) {
                                                            console.error("Error uploading PPT:", error)
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              isUploading: false,
                                                            })
                                                            toast({
                                                              title: "Upload failed",
                                                              description:
                                                                "There was an error uploading your PPT. Please try again.",
                                                              variant: "destructive",
                                                            })
                                                          }
                                                        }
                                                      }}
                                                    />
                                                    {editingMaterialData.isUploading && (
                                                      <div className="mt-2 flex items-center justify-center">
                                                        <Loader2 className="h-5 w-5 animate-spin text-[#006400]" />
                                                        <span className="ml-2 text-sm text-gray-600">
                                                          Uploading PPT...
                                                        </span>
                                                      </div>
                                                    )}
                                                    <Label
                                                      htmlFor={`ppt-upload-${editingMaterialId}`}
                                                      className="mt-4 cursor-pointer rounded-md bg-[#006400] px-4 py-2 text-sm font-medium text-white hover:bg-[#005000]"
                                                    >
                                                      Select PPT
                                                    </Label>
                                                  </div>
                                                  {editingMaterialData.pptFileName && (
                                                    <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 p-2">
                                                      <Presentation className="h-4 w-4 text-[#006400]" />
                                                      <span className="text-sm">{editingMaterialData.pptFileName}</span>
                                                      {editingMaterialData.pptUrl && (
                                                        <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                          URL ready
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                  {editingMaterialData.pptUrl && (
                                                    <div className="mt-2">
                                                      <Label className="text-sm font-medium">PPT Preview</Label>
                                                      <div className="mt-1 rounded-md border border-gray-200 p-4">
                                                        <div className="flex items-center gap-2">
                                                          <Presentation className="h-6 w-6 text-orange-500" />
                                                          <div>
                                                            <p className="text-sm font-medium">
                                                              {editingMaterialData.pptFileName}
                                                            </p>
                                                            <a
                                                              href={editingMaterialData.pptUrl}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-xs text-[#006400] hover:underline"
                                                            >
                                                              View PPT
                                                            </a>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </TabsContent>

                                            <TabsContent value="image" className="mt-4">
                                              <div className="space-y-4">
                                                <div>
                                                  <Label>Upload Image</Label>
                                                  <div className="mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                                                    <Upload className="h-10 w-10 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">
                                                      Drag and drop an Image, or{" "}
                                                      <span className="text-[#006400] cursor-pointer">browse</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                      Max file size: 10MB. Supported formats: JPG, PNG, WEBP
                                                    </p>
                                                    <input
                                                      type="file"
                                                      className="hidden"
                                                      accept="image/*"
                                                      id={`image-upload-${editingMaterialId}`}
                                                      onChange={async (e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                          try {
                                                            const file = e.target.files[0]
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              imageFile: file,
                                                              imageFileName: file.name,
                                                              isUploading: true,
                                                            })

                                                            const storageRef = ref(
                                                              storage,
                                                              `images/${Date.now()}-${file.name}`,
                                                            )

                                                            await uploadBytes(storageRef, file)
                                                            const downloadURL = await getDownloadURL(storageRef)

                                                            setEditingMaterialData((prev) => ({
                                                              ...prev,
                                                              imageFile: file,
                                                              imageFileName: file.name,
                                                              imageUrl: downloadURL,
                                                              isUploading: false,
                                                            }))

                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "imageUrl",
                                                              downloadURL,
                                                            )
                                                            updateMaterial(
                                                              module.id,
                                                              editingMaterialId,
                                                              "imageFileName",
                                                              file.name,
                                                            )

                                                            toast({
                                                              title: "Image uploaded",
                                                              description: "Your Image has been uploaded successfully.",
                                                            })
                                                          } catch (error) {
                                                            console.error("Error uploading Image:", error)
                                                            setEditingMaterialData({
                                                              ...editingMaterialData,
                                                              isUploading: false,
                                                            })
                                                            toast({
                                                              title: "Upload failed",
                                                              description:
                                                                "There was an error uploading your Image. Please try again.",
                                                              variant: "destructive",
                                                            })
                                                          }
                                                        }
                                                      }}
                                                    />
                                                    {editingMaterialData.isUploading && (
                                                      <div className="mt-2 flex items-center justify-center">
                                                        <Loader2 className="h-5 w-5 animate-spin text-[#006400]" />
                                                        <span className="ml-2 text-sm text-gray-600">
                                                          Uploading Image...
                                                        </span>
                                                      </div>
                                                    )}
                                                    <Label
                                                      htmlFor={`image-upload-${editingMaterialId}`}
                                                      className="mt-4 cursor-pointer rounded-md bg-[#006400] px-4 py-2 text-sm font-medium text-white hover:bg-[#005000]"
                                                    >
                                                      Select Image
                                                    </Label>
                                                  </div>
                                                  {editingMaterialData.imageFileName && (
                                                    <div className="mt-2 flex items-center gap-2 rounded-md bg-gray-50 p-2">
                                                      <ImageIcon className="h-4 w-4 text-[#006400]" />
                                                      <span className="text-sm">{editingMaterialData.imageFileName}</span>
                                                      {editingMaterialData.imageUrl && (
                                                        <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                          URL ready
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                  {editingMaterialData.imageUrl && (
                                                    <div className="mt-2">
                                                      <Label className="text-sm font-medium">Image Preview</Label>
                                                      <div className="mt-1 rounded-md border border-gray-200 overflow-hidden">
                                                        <img
                                                          src={editingMaterialData.imageUrl}
                                                          alt="Preview"
                                                          className="w-full h-auto max-h-[200px] object-contain"
                                                        />
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </TabsContent>
                                          </Tabs>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="mt-4 rounded-md border border-dashed border-gray-300 p-8 text-center">
                                  <p className="text-gray-500">
                                    No materials added yet. Add text, video, PDF, PPT, or Image materials to this module.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
                    <p className="text-gray-500">No modules added yet. Click "Add Module" to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Assignments Tab */}
      {
        activeTab === "assignments" && (
          <Card>
            <CardContent className="pt-6">

              {bulkUploadOpen && (
                <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Upload Multiple MCQs</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Tabs defaultValue="paste" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="paste">Paste MCQs</TabsTrigger>
                          <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                        </TabsList>

                        {/* Paste MCQs */}
                        <TabsContent value="paste" className="mt-4 space-y-2">
                          <p className="text-sm text-gray-600">
                            Format: <code>Question || Option1 || Option2 || Option3 || Option4 || CorrectIndex</code>
                          </p>
                          <Textarea
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            rows={8}
                            placeholder="E.g. What is 2+2? || 3 || 4 || 5 || 6 || 1"
                          />
                        </TabsContent>

                        {/* Upload CSV */}
                        <TabsContent value="csv" className="mt-4 space-y-2">
                          <p className="text-sm text-gray-600">Upload a CSV with this header:</p>
                          <pre className="bg-gray-100 text-sm p-2 rounded">question,opt1,opt2,opt3,opt4,correctIndex</pre>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              const sampleContent = `question,opt1,opt2,opt3,opt4,correctIndex
What is 2+2?,3,4,5,6,1
Capital of France?,Berlin,Madrid,Paris,Rome,2
Which is a fruit?,Carrot,Apple,Potato,Onion,1`
                              const blob = new Blob([sampleContent], { type: "text/csv;charset=utf-8;" })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement("a")
                              link.href = url
                              link.setAttribute("download", "sample_questions.csv")
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                          >
                            Download Sample CSV
                          </Button>

                          <Input type="file" accept=".csv" onChange={(e) => handleCsvUpload(e)} />

                        </TabsContent>
                      </Tabs>
                    </div>

                  </DialogContent>
                </Dialog>
              )}


              <div className="space-y-6">
                <Tabs defaultValue="module" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="module" className="flex-1">
                      Module Assignments
                    </TabsTrigger>
                    <TabsTrigger value="final" className="flex-1">
                      Final Course Assignment
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="module" className="mt-4 space-y-6">
                    {courseData.modules.length > 0 ? (
                      <div className="space-y-6">
                        {courseData.modules.map((module) => (
                          <div key={module.id} className="rounded-md border border-gray-200 p-4">
                            <h3 className="text-lg font-medium">{module.title}</h3>
                            {module.assignment ? (
                              <div className="mt-4 space-y-4">
                                <div>
                                  <Label htmlFor={`assignment-title-${module.id}`}>Assignment Title</Label>
                                  <Input
                                    id={`assignment-title-${module.id}`}
                                    value={module.assignment.title}
                                    onChange={(e) =>
                                      setCourseData((prev) => ({
                                        ...prev,
                                        modules: prev.modules.map((m) =>
                                          m.id === module.id && m.assignment
                                            ? {
                                              ...m,
                                              assignment: {
                                                ...m.assignment,
                                                title: e.target.value,
                                              },
                                            }
                                            : m,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`assignment-desc-${module.id}`}>Assignment Description</Label>
                                  <Textarea
                                    id={`assignment-desc-${module.id}`}
                                    value={module.assignment.description}
                                    onChange={(e) =>
                                      setCourseData((prev) => ({
                                        ...prev,
                                        modules: prev.modules.map((m) =>
                                          m.id === module.id && m.assignment
                                            ? {
                                              ...m,
                                              assignment: {
                                                ...m.assignment,
                                                description: e.target.value,
                                              },
                                            }
                                            : m,
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Questions</h4>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm" onClick={() => addQuestion(module.id, "mcq")}>
                                        Add MCQ
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => openBulkUploadDialog(module.id)}>
                                        Upload MCQs
                                      </Button>

                                    </div>
                                  </div>
                                  {module.assignment.questions.length > 0 ? (
                                    <div className="space-y-4">
                                      {module.assignment.questions.map((question, qIndex) => (
                                        <div key={question.id} className="rounded-md border border-gray-200 p-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">
                                                Question {qIndex + 1} (
                                                {question.type === "mcq" ? "Multiple Choice" : "Text"})
                                              </span>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
                                              onClick={() => deleteQuestion(module.id, question.id)}
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          </div>
                                          <div className="mt-2">
                                            <Label htmlFor={`question-text-${question.id}`}>Question</Label>
                                            <Textarea
                                              id={`question-text-${question.id}`}
                                              value={question.text}
                                              onChange={(e) =>
                                                updateQuestion(module.id, question.id, "text", e.target.value)
                                              }
                                            />
                                          </div>

                                          {/* Question Image Upload */}
                                          <div className="mt-4">
                                            <Label className="text-sm text-gray-600">Question Image (Optional)</Label>
                                            {question.imageUrl ? (
                                              <div className="relative mt-2 w-full max-w-sm rounded-md border border-gray-200 overflow-hidden group">
                                                <img
                                                  src={question.imageUrl}
                                                  alt="Question"
                                                  className="w-full h-auto object-cover"
                                                />
                                                <Button
                                                  variant="destructive"
                                                  size="icon"
                                                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  onClick={() => updateQuestion(module.id, question.id, "imageUrl", "")}
                                                >
                                                  <Trash className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-3 mt-2">
                                                <div className="relative">
                                                  <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full hidden"
                                                    id={`q-image-${question.id}`}
                                                    onChange={(e) => handleQuestionImageUpload(e, module.id, question.id)}
                                                    disabled={question.isUploading}
                                                  />
                                                  <Label
                                                    htmlFor={`q-image-${question.id}`}
                                                    className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md cursor-pointer transition-colors ${question.isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                  >
                                                    <ImageIcon className="h-4 w-4" />
                                                    {question.isUploading ? "Uploading..." : "Upload Image"}
                                                  </Label>
                                                </div>
                                                {question.isUploading && <Loader2 className="h-4 w-4 animate-spin text-[#006400]" />}
                                              </div>
                                            )}
                                          </div>

                                          {question.type === "mcq" && (
                                            <div className="mt-4">
                                              <div className="flex items-center justify-between">
                                                <Label>Options</Label>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => addOption(module.id, question.id)}
                                                >
                                                  Add Option
                                                </Button>
                                              </div>
                                              {question.options && question.options.length > 0 ? (
                                                <div className="mt-2 space-y-2">
                                                  {question.options.map((option) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                      <Checkbox
                                                        id={`option-correct-${option.id}`}
                                                        checked={option.isCorrect}
                                                        onCheckedChange={(checked) =>
                                                          updateOption(
                                                            module.id,
                                                            question.id,
                                                            option.id,
                                                            "isCorrect",
                                                            checked === true,
                                                          )
                                                        }
                                                      />
                                                      <Input
                                                        value={option.text}
                                                        onChange={(e) =>
                                                          updateOption(
                                                            module.id,
                                                            question.id,
                                                            option.id,
                                                            "text",
                                                            e.target.value,
                                                          )
                                                        }
                                                        className="flex-1"
                                                      />
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500"
                                                        onClick={() => deleteOption(module.id, question.id, option.id)}
                                                      >
                                                        <Trash className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : (
                                                <p className="mt-2 text-sm text-gray-500">
                                                  No options added. Add at least two options.
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No questions added yet. Add MCQ or text questions.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 flex justify-center">
                                <Button
                                  variant="outline"
                                  onClick={() => createModuleAssignment(module.id)}
                                  className="w-full"
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Create Assignment for this Module
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
                        <p className="text-gray-500">
                          No modules available. Add modules in the "Modules & Materials" tab first.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="final" className="mt-4">
                    <div className="rounded-md border border-gray-200 p-4">
                      <h3 className="text-lg font-medium">Final Course Assignment</h3>
                      {courseData.finalAssignment ? (
                        <div className="mt-4 space-y-4">
                          <div>
                            <Label htmlFor="final-assignment-title">Assignment Title</Label>
                            <Input
                              id="final-assignment-title"
                              value={courseData.finalAssignment.title}
                              onChange={(e) =>
                                setCourseData((prev) => ({
                                  ...prev,
                                  finalAssignment: {
                                    ...prev.finalAssignment!,
                                    title: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="final-assignment-desc">Assignment Description</Label>
                            <Textarea
                              id="final-assignment-desc"
                              value={courseData.finalAssignment.description}
                              onChange={(e) =>
                                setCourseData((prev) => ({
                                  ...prev,
                                  finalAssignment: {
                                    ...prev.finalAssignment!,
                                    description: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Questions</h4>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => addQuestion("final", "mcq")}>
                                  Add MCQ
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openBulkUploadDialog("final")}>
                                  Upload MCQs
                                </Button>
                              </div>
                            </div>
                            {courseData.finalAssignment.questions.length > 0 ? (
                              <div className="space-y-4">
                                {courseData.finalAssignment.questions.map((question, qIndex) => (
                                  <div key={question.id} className="rounded-md border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          Question {qIndex + 1} ({question.type === "mcq" ? "Multiple Choice" : "Text"})
                                        </span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent"
                                        onClick={() => deleteQuestion("final", question.id)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="mt-2">
                                      <Label htmlFor={`final-question-text-${question.id}`}>Question</Label>
                                      <Textarea
                                        id={`final-question-text-${question.id}`}
                                        value={question.text}
                                        onChange={(e) => updateQuestion("final", question.id, "text", e.target.value)}
                                      />
                                    </div>

                                    {/* Final Assignment Image Upload */}
                                    <div className="mt-4">
                                      <Label className="text-sm text-gray-600">Question Image (Optional)</Label>
                                      {question.imageUrl ? (
                                        <div className="relative mt-2 w-full max-w-sm rounded-md border border-gray-200 overflow-hidden group">
                                          <img
                                            src={question.imageUrl}
                                            alt="Question"
                                            className="w-full h-auto object-cover"
                                          />
                                          <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => updateQuestion("final", question.id, "imageUrl", "")}
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 mt-2">
                                          <div className="relative">
                                            <Input
                                              type="file"
                                              accept="image/*"
                                              className="w-full hidden"
                                              id={`final-q-image-${question.id}`}
                                              onChange={(e) => handleQuestionImageUpload(e, "final", question.id)}
                                              disabled={question.isUploading}
                                            />
                                            <Label
                                              htmlFor={`final-q-image-${question.id}`}
                                              className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-md cursor-pointer transition-colors ${question.isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                              <ImageIcon className="h-4 w-4" />
                                              {question.isUploading ? "Uploading..." : "Upload Image"}
                                            </Label>
                                          </div>
                                          {question.isUploading && <Loader2 className="h-4 w-4 animate-spin text-[#006400]" />}
                                        </div>
                                      )}
                                    </div>
                                    {
                                      question.type === "mcq" && (
                                        <div className="mt-4">
                                          <div className="flex items-center justify-between">
                                            <Label>Options</Label>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => addOption("final", question.id)}
                                            >
                                              Add Option
                                            </Button>
                                          </div>
                                          {question.options && question.options.length > 0 ? (
                                            <div className="mt-2 space-y-2">
                                              {question.options.map((option) => (
                                                <div key={option.id} className="flex items-center gap-2">
                                                  <Checkbox
                                                    id={`final-option-correct-${option.id}`}
                                                    checked={option.isCorrect}
                                                    onCheckedChange={(checked) =>
                                                      updateOption(
                                                        "final",
                                                        question.id,
                                                        option.id,
                                                        "isCorrect",
                                                        checked === true,
                                                      )
                                                    }
                                                  />
                                                  <Input
                                                    value={option.text}
                                                    onChange={(e) =>
                                                      updateOption("final", question.id, option.id, "text", e.target.value)
                                                    }
                                                    className="flex-1"
                                                  />
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500"
                                                    onClick={() => deleteOption("final", question.id, option.id)}
                                                  >
                                                    <Trash className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="mt-2 text-sm text-gray-500">
                                              No options added. Add at least two options.
                                            </p>
                                          )}
                                        </div>
                                      )
                                    }
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No questions added yet. Add MCQ</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex justify-center">
                          <Button variant="outline" onClick={() => addQuestion("final", "mcq")} className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create Final Assignment
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Media Tab */}
      {
        activeTab === "media" && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <Label>Course Thumbnail</Label>
                  <div className="mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Drag and drop an image, or{" "}
                      <label htmlFor="thumbnail-upload" className="text-[#006400] cursor-pointer">
                        browse
                      </label>
                    </p>
                    <p className="text-xs text-gray-400">Recommended size: 1280x720px (16:9 ratio)</p>
                    <input
                      type="file"
                      id="thumbnail-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const file = e.target.files[0]
                            // Create a reference to the file in Firebase Storage
                            const storageRef = ref(storage, `thumbnails/${Date.now()}-${file.name}`)
                            // Upload the file to Firebase Storage
                            await uploadBytes(storageRef, file)
                            // Get the download URL
                            const downloadURL = await getDownloadURL(storageRef)
                            // Update the course data with the Firebase Storage URL
                            updateCourseInfo("thumbnailUrl", downloadURL)
                            toast({
                              title: "Thumbnail uploaded",
                              description: "Your thumbnail has been uploaded successfully.",
                            })
                          } catch (error) {
                            console.error("Error uploading thumbnail:", error)
                            toast({
                              title: "Upload failed",
                              description: "There was an error uploading your thumbnail. Please try again.",
                              variant: "destructive",
                            })
                          }
                        }
                      }}
                    />
                    <Label
                      htmlFor="thumbnail-upload"
                      className="mt-4 cursor-pointer rounded-md bg-[#006400] px-4 py-2 text-sm font-medium text-white hover:bg-[#005000]"
                    >
                      Select Image
                    </Label>
                  </div>
                  {courseData.thumbnailUrl && (
                    <div className="mt-4 w-full max-w-xs">
                      <img
                        src={courseData.thumbnailUrl || "/placeholder.svg"}
                        alt="Course thumbnail"
                        className="rounded-md border border-gray-200 w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="rounded-md bg-green-50 p-4">
                    <h3 className="flex items-center gap-2 font-medium text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Your course is ready to publish!
                    </h3>
                    <p className="mt-1 text-sm text-green-700">Review your course details before publishing.</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button className="bg-[#006400]" onClick={handlePublishCourse} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        isEditMode ? "Update Course" : "Publish Course"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const tabs = ["basic", "modules", "assignments", "media"]
            const currentIndex = tabs.indexOf(activeTab)
            if (currentIndex > 0) {
              setActiveTab(tabs[currentIndex - 1])
            }
          }}
          disabled={activeTab === "basic"}
        >
          Previous
        </Button>
        {activeTab !== "media" && (
          <Button
            className="bg-[#006400]"
            onClick={() => {
              const tabs = ["basic", "modules", "assignments", "media"]
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1])
              }
            }}
          >
            Next
          </Button>
        )}
      </div>
    </div >
  )
}
