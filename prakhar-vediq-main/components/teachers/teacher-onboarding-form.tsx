"use client"

import type React from "react"
import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { ArrowLeft, ArrowRight, Check, Clock, Plus, User, X } from "lucide-react"
import { getDocs, query, where, doc, updateDoc } from "firebase/firestore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

type Step = "basic" | "expertise"

interface Subject {
  id: string
  name: string
}

interface Batch {
  id: string
  name: string
  course: string
  schedule: string
}



export function TeacherOnboardingForm() {
  const [currentStep, setCurrentStep] = useState<Step>("basic")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [teacherData, setTeacherData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    profilePicture: null as File | null,
    profilePictureURL: "",
    teacherType: "",
    subjects: [] as string[],
    educationalQualification: "",
    professionalExperience: "",

    availability: {
      monday: { morning: false, afternoon: false, evening: false },
      tuesday: { morning: false, afternoon: false, evening: false },
      wednesday: { morning: false, afternoon: false, evening: false },
      thursday: { morning: false, afternoon: false, evening: false },
      friday: { morning: false, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    },
    teachingMode: "both",
    createdAt: new Date(),
  })

  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Sample data
  const subjects: Subject[] = [
    { id: "math", name: "Mathematics" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "english", name: "English" },
    { id: "history", name: "History" },
    { id: "geography", name: "Geography" },
    { id: "computer", name: "Computer Science" },
    { id: "art", name: "Art & Design" },
    { id: "music", name: "Music" },
  ]

  const batches: Batch[] = [
    { id: "batch1", name: "Batch A", course: "Physics 101", schedule: "Mon, Wed 10:00 AM" },
    { id: "batch2", name: "Batch B", course: "Mathematics", schedule: "Tue, Thu 2:00 PM" },
    { id: "batch3", name: "Batch C", course: "Computer Science", schedule: "Fri 3:00 PM" },
    { id: "batch4", name: "Batch D", course: "English Literature", schedule: "Mon, Wed 1:00 PM" },
    { id: "batch5", name: "Batch E", course: "Chemistry", schedule: "Tue, Thu 11:00 AM" },
  ]

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setTeacherData({ ...teacherData, profilePicture: file })
      setProfilePicturePreview(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTeacherData({ ...teacherData, [name]: value })

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setTeacherData({ ...teacherData, [name]: value })

    // Clear error when user selects
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const toggleSubject = (subjectId: string) => {
    setTeacherData((prev) => {
      const subjects = prev.subjects.includes(subjectId)
        ? prev.subjects.filter((id) => id !== subjectId)
        : [...prev.subjects, subjectId]
      return { ...prev, subjects }
    })

    // Clear subjects error if any
    if (formErrors.subjects) {
      setFormErrors({
        ...formErrors,
        subjects: "",
      })
    }
  }

  const toggleAvailability = (day: string, timeSlot: string) => {
    setTeacherData((prev) => {
      const daySlots = { ...prev.availability[day], [timeSlot]: !prev.availability[day][timeSlot] }
      const availability = { ...prev.availability, [day]: daySlots }
      return { ...prev, availability }
    })
  }

  const toggleAllAvailability = () => {
    // Check if any slot is not selected
    const hasUnselectedSlot = Object.values(teacherData.availability).some((daySlots) =>
      Object.values(daySlots).some((isAvailable) => !isAvailable),
    )

    // If any slot is not selected, select all. Otherwise, deselect all.
    const newValue = hasUnselectedSlot

    setTeacherData((prev) => {
      const availability = { ...prev.availability }
      Object.keys(availability).forEach((day) => {
        Object.keys(availability[day]).forEach((slot) => {
          availability[day][slot] = newValue
        })
      })
      return { ...prev, availability }
    })
  }

  const validateBasicInfo = () => {
    const errors: Record<string, string> = {}

    if (!teacherData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!teacherData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(teacherData.email)) {
      errors.email = "Email is invalid"
    }

    if (!teacherData.password.trim()) {
      errors.password = "Password is required"
    }


    if (!teacherData.educationalQualification.trim()) {
      errors.educationalQualification = "Educational qualification is required"
    }
    if (!teacherData.professionalExperience.trim()) {
      errors.professionalExperience = "Professional experience is required"
    }


    if (!teacherData.mobile.trim()) {
      errors.mobile = "Mobile number is required"
    }

    if (!teacherData.teacherType) {
      errors.teacherType = "Teacher type is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateExpertise = () => {
    const errors: Record<string, string> = {}

    if (teacherData.subjects.length === 0) {
      errors.subjects = "At least one subject must be selected"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (currentStep === "basic") {
      if (validateBasicInfo()) {
        setCurrentStep("expertise")
      }
    } else if (currentStep === "expertise") {
      if (validateExpertise()) {
        handleSubmit()
      }
    }
  }

  const prevStep = () => {
    if (currentStep === "expertise") setCurrentStep("basic")
  }

  const uploadProfilePicture = async (): Promise<string> => {
    if (!teacherData.profilePicture) return ""

    try {
      const storageRef = ref(storage, `teacher-profiles/${Date.now()}-${teacherData.profilePicture.name}`)
      await uploadBytes(storageRef, teacherData.profilePicture)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      throw error
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Step 1: Prepare data for Firestore
      const teacherDataToSave: any = {
        fullName: teacherData.fullName,
        email: teacherData.email,
        password: teacherData.password,
        mobile: teacherData.mobile,
        teacherType: teacherData.teacherType,
        subjects: teacherData.subjects,
        availability: teacherData.availability,
        teachingMode: teacherData.teachingMode,
        createdAt: new Date().toISOString(),
        educationalQualification: teacherData.educationalQualification,
        professionalExperience: teacherData.professionalExperience,

      }

      // Step 2: Upload profile picture if it exists
      if (teacherData.profilePicture) {
        const storageRef = ref(storage, `teacher-profiles/${Date.now()}-${teacherData.profilePicture.name}`)
        await uploadBytes(storageRef, teacherData.profilePicture)
        const downloadURL = await getDownloadURL(storageRef)
        teacherDataToSave.profilePictureURL = downloadURL
      }



      // ✅ Only ONE document creation
      const teachersCollection = collection(db, "teachers")
      const docRef = await addDoc(teachersCollection, teacherDataToSave)



      // ✅ Update the same document with its own ID
      const teacherRef = doc(db, "teachers", docRef.id)
      await updateDoc(teacherRef, { uid: docRef.id })
      await fetch("/api/send-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: teacherData.email,
          name: teacherData.fullName,
          password: teacherData.password,
        }),
      });


      console.log("✅ Teacher added and email sent:", teacherData.email);
      setSuccess(true);

      console.log("✅ Teacher added with ID:", docRef.id)
      setSuccess(true)
    } catch (error) {
      console.error("🔥 Error saving teacher data:", error)
      alert("An error occurred while saving the teacher data. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  const resetForm = () => {
    setTeacherData({
      fullName: "",
      email: "",
      password: "",
      mobile: "",
      profilePicture: null,
      profilePictureURL: "",
      teacherType: "",
      subjects: [],
      availability: {
        monday: { morning: false, afternoon: false, evening: false },
        tuesday: { morning: false, afternoon: false, evening: false },
        wednesday: { morning: false, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: false, afternoon: false, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
      },
      teachingMode: "both",
      createdAt: new Date(),
    })
    setProfilePicturePreview(null)
    setCurrentStep("basic")
    setSuccess(false)
    setFormErrors({})
  }

  const getStepNumber = (step: Step): number => {
    const steps: Step[] = ["basic", "expertise"]
    return steps.indexOf(step) + 1
  }

  const isStepComplete = (step: Step): boolean => {
    const currentStepNumber = getStepNumber(currentStep)
    const stepNumber = getStepNumber(step)
    return stepNumber < currentStepNumber
  }

  const isStepActive = (step: Step): boolean => {
    return step === currentStep
  }

  if (success) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-[#e6f0e6] p-3">
              <Check className="h-12 w-12 text-[#006400]" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Teacher Successfully Onboarded!</h2>
            <p className="mb-6 text-gray-500">{teacherData.fullName} has been added to the system.</p>
            <div className="flex gap-3">
              <Button onClick={resetForm} className="bg-[#006400] hover:bg-[#005000]">
                <Plus className="mr-2 h-4 w-4" /> Onboard Another Teacher
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Return to Dashboard</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-64 order-2 lg:order-1">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: "basic" as Step, label: "Basic Information", icon: <User className="h-4 w-4" /> },
                {
                  step: "expertise" as Step,
                  label: "Expertise & Availability",
                  icon: <Clock className="h-4 w-4" />,
                },
              ].map(({ step, label, icon }) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${isStepActive(step)
                    ? "bg-[#e6f0e6] text-[#006400]"
                    : isStepComplete(step)
                      ? "text-gray-500"
                      : "text-gray-400"
                    }`}
                  onClick={() => {
                    // Only allow navigation to completed steps or the current step
                    if (isStepComplete(step) || isStepActive(step)) {
                      setCurrentStep(step)
                    }
                  }}
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 order-1 lg:order-2">
        {/* Step 1: Basic Information */}
        {currentStep === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the teacher's personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left: Profile Picture */}
                <div className="w-full md:w-32 flex flex-col items-center gap-2">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profilePicturePreview || ""} alt="Profile picture" />
                    <AvatarFallback className="text-2xl bg-[#e6f0e6] text-[#006400]">
                      {teacherData.fullName
                        ? teacherData.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                        : "TP"}
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="profilePicture" className="cursor-pointer text-sm text-[#006400] hover:underline">
                    Upload Photo
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </div>

                {/* Right: Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="e.g., John Smith"
                      value={teacherData.fullName}
                      onChange={handleInputChange}
                      className={formErrors.fullName ? "border-red-500" : ""}
                    />
                    {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="e.g., john.smith@example.com"
                      value={teacherData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={teacherData.password}
                      onChange={handleInputChange}
                      className={formErrors.password ? "border-red-500" : ""}
                    />
                    {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      placeholder="e.g., +1 (555) 123-4567"
                      value={teacherData.mobile}
                      onChange={handleInputChange}
                      className={formErrors.mobile ? "border-red-500" : ""}
                    />
                    {formErrors.mobile && <p className="text-red-500 text-sm mt-1">{formErrors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherType">Teacher Type</Label>
                    <Select
                      value={teacherData.teacherType}
                      onValueChange={(value) => handleSelectChange("teacherType", value)}
                    >
                      <SelectTrigger id="teacherType" className={formErrors.teacherType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select teacher type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.teacherType && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.teacherType}</p>
                    )}
                  </div>

                  {/* NEW: Educational Qualification */}
                  <div className="space-y-2">
                    <Label htmlFor="educationalQualification">Educational Qualification</Label>
                    <Input
                      id="educationalQualification"
                      name="educationalQualification"
                      placeholder="e.g., M.Sc. in Physics"
                      value={teacherData.educationalQualification}
                      onChange={handleInputChange}
                      className={formErrors.educationalQualification ? "border-red-500" : ""}
                    />
                    {formErrors.educationalQualification && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.educationalQualification}</p>
                    )}
                  </div>

                  {/* NEW: Professional Experience */}
                  <div className="space-y-2">
                    <Label htmlFor="professionalExperience">Professional Experience</Label>
                    <Input
                      id="professionalExperience"
                      name="professionalExperience"
                      placeholder="e.g., 5 years teaching at ABC School"
                      value={teacherData.professionalExperience}
                      onChange={handleInputChange}
                      className={formErrors.professionalExperience ? "border-red-500" : ""}
                    />
                    {formErrors.professionalExperience && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.professionalExperience}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <div className="text-sm text-gray-500">Step {getStepNumber(currentStep)} of 2</div>
              <Button onClick={nextStep} className="bg-[#006400] hover:bg-[#005000]">
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}


        {/* Step 2: Subject Expertise & Availability */}
        {currentStep === "expertise" && (
          <Card>
            <CardHeader>
              <CardTitle>Subject Expertise & Availability</CardTitle>
              <CardDescription>Define the teacher's specialties and weekly schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Subject Expertise</Label>
                  <div className="space-y-3">
                    <Select
                      value={teacherData.subjects.length > 0 ? teacherData.subjects[0] : ""}
                      onValueChange={(value) => {
                        if (value && !teacherData.subjects.includes(value)) {
                          setTeacherData((prev) => ({
                            ...prev,
                            subjects: [...prev.subjects.filter((s) => subjects.some((sub) => sub.id === s)), value],
                          }))
                        }
                      }}
                    >
                      <SelectTrigger className={formErrors.subjects ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add custom subject"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            const customSubject = e.currentTarget.value.trim()
                            const customSubjectId = `${customSubject.toLowerCase().replace(/\s+/g, "-")}`
                            if (!teacherData.subjects.includes(customSubjectId)) {
                              setTeacherData((prev) => ({
                                ...prev,
                                subjects: [...prev.subjects, customSubjectId],
                              }))
                            }
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          if (input && input.value.trim()) {
                            const customSubject = input.value.trim()
                            const customSubjectId = `custom-${customSubject.toLowerCase().replace(/\s+/g, "-")}`
                            if (!teacherData.subjects.includes(customSubjectId)) {
                              setTeacherData((prev) => ({
                                ...prev,
                                subjects: [...prev.subjects, customSubjectId],
                              }))
                            }
                            input.value = ""
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacherData.subjects.map((subjectId) => {
                        const subject = subjects.find((s) => s.id === subjectId)
                        const isCustom = subjectId.startsWith("custom-")
                        const displayName = subject
                          ? subject.name
                          : isCustom
                            ? subjectId.replace("custom-", "").replace(/-/g, " ")
                            : subjectId

                        return (
                          <Badge
                            key={subjectId}
                            variant="default"
                            className="bg-[#006400] hover:bg-[#005000] cursor-pointer"
                          >
                            {displayName}
                            <X
                              className="ml-1 h-3 w-3"
                              onClick={() => {
                                setTeacherData((prev) => ({
                                  ...prev,
                                  subjects: prev.subjects.filter((id) => id !== subjectId),
                                }))
                              }}
                            />
                          </Badge>
                        )
                      })}
                    </div>
                    {formErrors.subjects && <p className="text-red-500 text-sm mt-1">{formErrors.subjects}</p>}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="block">Weekly Availability</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleAllAvailability}
                      className="text-xs bg-[#e6f0e6] text-[#006400] border-[#006400] hover:bg-[#d1e7d1]"
                    >
                      Select All Available Times
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 text-left font-medium text-gray-500"></th>
                          <th className="p-2 text-center font-medium text-gray-500">Morning</th>
                          <th className="p-2 text-center font-medium text-gray-500">Afternoon</th>
                          <th className="p-2 text-center font-medium text-gray-500">Evening</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(teacherData.availability).map(([day, slots]) => (
                          <tr key={day} className="border-t border-gray-100">
                            <td className="p-2 font-medium capitalize">{day}</td>
                            {Object.entries(slots).map(([slot, isAvailable]) => (
                              <td key={slot} className="p-2 text-center">
                                <Checkbox
                                  checked={isAvailable}
                                  onCheckedChange={() => toggleAvailability(day, slot)}
                                  className="h-6 w-6 rounded-sm data-[state=checked]:bg-[#006400] data-[state=checked]:text-white"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <div className="text-sm text-gray-500">Step {getStepNumber(currentStep)} of 2</div>
              <Button onClick={nextStep} className="bg-[#006400] hover:bg-[#005000]" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>Submit & Add</>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
