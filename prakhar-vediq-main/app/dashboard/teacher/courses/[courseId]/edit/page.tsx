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
} from "lucide-react"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
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

// Define types for our course structure
type MaterialType = "text" | "video"
type Material = {
    id: string
    type: MaterialType
    title: string
    content?: string
    videoUrl?: string
    videoFile?: File
    videoFileName?: string
    duration?: number
    isUploading?: boolean
}

type QuestionType = "mcq" | "text"
type Option = {
    id: string
    text: string
    isCorrect: boolean
}

type Question = {
    id: string
    type: QuestionType
    text: string
    options?: Option[]
    answer?: string
}

type Assignment = {
    id: string
    title: string
    description: string
    questions: Question[]
}

type Module = {
    id: string
    title: string
    description: string
    estimatedTime: number
    materials: Material[]
    assignment: Assignment | null
}

type CourseData = {
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
}

interface EditCoursePageProps {
    params: Promise<{ courseId: string }>
}


export default function EditCoursePage({ params }: EditCoursePageProps) {
    const [courseId, setCourseId] = useState<string>("")
    const [activeTab, setActiveTab] = useState("basic")
    const [activeModuleTab, setActiveModuleTab] = useState<string | null>(null)
    const [activeMaterialTab, setActiveMaterialTab] = useState<string>("text")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()
    const router = useRouter()

    // Initialize course data with default values
    const [courseData, setCourseData] = useState<CourseData>({
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
    })

    // State for editing module
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
    const [editingModuleData, setEditingModuleData] = useState<Partial<Module>>({})

    // State for editing material
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
    const [editingMaterialData, setEditingMaterialData] = useState<Partial<Material>>({})

    // State for editing question
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
    const [editingQuestionData, setEditingQuestionData] = useState<Partial<Question>>({})

    // Load course data on component mount
    useEffect(() => {
        const loadCourseData = async () => {
            try {
                const { courseId } = await params
                setCourseId(courseId)

                const courseRef = doc(db, "courses", courseId)
                const courseSnap = await getDoc(courseRef)

                if (courseSnap.exists()) {
                    const data = courseSnap.data() as CourseData
                    setCourseData(data)
                    if (data.modules && data.modules.length > 0) {
                        setActiveModuleTab(data.modules[0].id)
                    }
                } else {
                    toast({
                        title: "Course not found",
                        description: "The course you're trying to edit doesn't exist.",
                        variant: "destructive",
                    })
                    router.push("/dashboard/teacher/courses")
                }
            } catch (error) {
                console.error("Error loading course:", error)
                toast({
                    title: "Error",
                    description: "Failed to load course data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadCourseData()
    }, [params, toast, router])



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
            estimatedTime: 60,
            materials: [],
            assignment: null,
        }
        setCourseData((prev) => ({
            ...prev,
            modules: [...prev.modules, newModule],
        }))
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
            title: `New ${type === "text" ? "Text" : "Video"} Material`,
            ...(type === "text" ? { content: "" } : { videoUrl: "", duration: 0 }),
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

        setEditingMaterialId(newMaterialId)
        setEditingMaterialData(newMaterial)
    }

    // Function to update a material directly in the course data
    const updateMaterial = (moduleId: string, materialId: string, field: keyof Material, value: any) => {
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

        const module = courseData.modules.find((m) => m.id === moduleId)
        if (!module) return

        const materialIndex = module.materials.findIndex((m) => m.id === editingMaterialId)
        if (materialIndex === -1) return

        const updatedMaterials = [...module.materials]
        updatedMaterials[materialIndex] = {
            ...module.materials[materialIndex],
            ...editingMaterialData,
        }

        setCourseData((prev) => ({
            ...prev,
            modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, materials: updatedMaterials } : m)),
        }))

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
            if (!courseData.finalAssignment) {
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
                setCourseData((prev) => ({
                    ...prev,
                    finalAssignment: {
                        ...prev.finalAssignment!,
                        questions: [...prev.finalAssignment!.questions, newQuestion],
                    },
                }))
            }
        } else {
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

        setEditingQuestionId(newQuestion.id)
        setEditingQuestionData(newQuestion)
    }

    // Function to update a question
    const updateQuestion = (moduleId: string | "final", questionId: string, field: keyof Question, value: any) => {
        if (moduleId === "final") {
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
            if (!courseData.finalAssignment) return
            setCourseData((prev) => ({
                ...prev,
                finalAssignment: {
                    ...prev.finalAssignment!,
                    questions: prev.finalAssignment!.questions.filter((question) => question.id !== questionId),
                },
            }))
        } else {
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

    // Function to update course in Firestore
    const updateCourseInFirestore = async (status: "draft" | "published") => {
        try {
            setIsSubmitting(true)

            const courseDataForFirestore = {
                ...courseData,
                status,
                updatedAt: serverTimestamp(),
            }

            const cleanedData = JSON.parse(
                JSON.stringify(courseDataForFirestore, (key, value) => {
                    if (key === "videoFile" || value instanceof File) {
                        return undefined
                    }
                    return value
                }),
            )

            const courseRef = doc(db, "courses", courseId)
            await updateDoc(courseRef, cleanedData)

            toast({
                title: status === "published" ? "Course Updated & Published!" : "Course Updated!",
                description: `Your course has been successfully ${status === "published" ? "updated and published" : "updated"
                    }.`,
            })

            router.push(`/dashboard/teacher/courses`)
            return courseId
        } catch (error) {
            console.error("Error updating course:", error)
            toast({
                title: "Error",
                description: "There was an error updating your course. Please try again.",
                variant: "destructive",
            })
            return null
        } finally {
            setIsSubmitting(false)
        }
    }

    // Function to handle updating and publishing the course
    const handleUpdateAndPublish = async () => {
        await updateCourseInFirestore("published")
    }

    // Function to save as draft
    const handleUpdateAsDraft = async () => {
        await updateCourseInFirestore("draft")
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading course data...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Course</h1>
                        <p className="text-gray-600">Update your course content and settings</p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="bg-[#006400]" onClick={handleUpdateAndPublish} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update & Publish"
                            )}
                        </Button>
                    </div>

                </div>

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
                        </CardContent>
                    </Card>
                )}

                {/* Modules & Materials Tab */}
                {activeTab === "modules" && (
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
                                            <TabsList className="w-full flex-wrap">
                                                {courseData.modules.map((module, index) => (
                                                    <TabsTrigger key={module.id} value={module.id} className="flex-1">
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
                                                                                    ) : (
                                                                                        <Film className="h-4 w-4 text-purple-500" />
                                                                                    )}
                                                                                    <span className="font-medium">
                                                                                        {material.title} ({material.type})
                                                                                    </span>
                                                                                    {material.type === "video" && material.videoUrl && (
                                                                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                                                            Video uploaded
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
                                                                                        </TabsList>
                                                                                        <TabsContent value="text" className="mt-4">
                                                                                            <div>
                                                                                                <Label htmlFor={`material-content-${material.id}`}>Text Content</Label>
                                                                                                <Textarea
                                                                                                    id={`material-content-${material.id}`}
                                                                                                    className="min-h-[200px]"
                                                                                                    value={editingMaterialData.content || ""}
                                                                                                    onChange={(e) =>
                                                                                                        setEditingMaterialData({
                                                                                                            ...editingMaterialData,
                                                                                                            content: e.target.value,
                                                                                                        })
                                                                                                    }
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
                                                                                                                        setEditingMaterialData({
                                                                                                                            ...editingMaterialData,
                                                                                                                            videoFile: file,
                                                                                                                            videoFileName: file.name,
                                                                                                                            isUploading: true,
                                                                                                                        })

                                                                                                                        const storageRef = ref(
                                                                                                                            storage,
                                                                                                                            `videos/${Date.now()}-${file.name}`,
                                                                                                                        )

                                                                                                                        await uploadBytes(storageRef, file)

                                                                                                                        const downloadURL = await getDownloadURL(storageRef)

                                                                                                                        setEditingMaterialData((prev) => ({
                                                                                                                            ...prev,
                                                                                                                            videoFile: file,
                                                                                                                            videoFileName: file.name,
                                                                                                                            videoUrl: downloadURL,
                                                                                                                            isUploading: false,
                                                                                                                        }))

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
                                                                                    </Tabs>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="mt-4 rounded-md border border-dashed border-gray-300 p-8 text-center">
                                                                    <p className="text-gray-500">
                                                                        No materials added yet. Add text or video materials to this module.
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
                )}

                {/* Assignments Tab */}
                {activeTab === "assignments" && (
                    <Card>
                        <CardContent className="pt-6">
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
                                                                            <Button variant="outline" size="sm" onClick={() => addQuestion(module.id, "text")}>
                                                                                Add Text Question
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
                                                                <Button variant="outline" size="sm" onClick={() => addQuestion("final", "text")}>
                                                                    Add Text Question
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
                                                                        {question.type === "mcq" && (
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
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500">No questions added yet. Add MCQ or text questions.</p>
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
                )}

                {/* Media Tab */}
                {activeTab === "media" && (
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
                                                        const storageRef = ref(storage, `thumbnails/${Date.now()}-${file.name}`)
                                                        await uploadBytes(storageRef, file)
                                                        const downloadURL = await getDownloadURL(storageRef)
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
                                    <div className="rounded-md bg-blue-50 p-4">
                                        <h3 className="flex items-center gap-2 font-medium text-blue-800">
                                            <CheckCircle className="h-5 w-5" />
                                            Course ready for update!
                                        </h3>
                                        <p className="mt-1 text-sm text-blue-700">Review your changes before updating the course.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
            </div>
        </div>
    )
}


