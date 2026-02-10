"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Plus, School, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase" // adjust if your firebase config path is different

type Step = "basic" | "education"

export function StudentEnrollmentForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("basic")
  const [success, setSuccess] = useState(false)
  const [studentData, setStudentData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    profilePicture: null as File | null,
    education: {
      highestQualification: "",
      institution: "",
      yearOfCompletion: "",
      grade: "",
    },
    guardianName: "",
    guardianContact: "",
  })

  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setStudentData({ ...studentData, profilePicture: file })
      setProfilePicturePreview(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStudentData({ ...studentData, [name]: value })
  }

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setStudentData({
      ...studentData,
      education: {
        ...studentData.education,
        [name]: value,
      },
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setStudentData({
        ...studentData,
        [parent]: {
          ...studentData[parent as keyof typeof studentData],
          [child]: value,
        },
      })
    } else {
      setStudentData({ ...studentData, [name]: value })
    }
  }

  const nextStep = () => {
    if (currentStep === "basic") setCurrentStep("education")
  }

  const prevStep = () => {
    if (currentStep === "education") setCurrentStep("basic")
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      let profileImageUrl = ""

      // Upload profile picture if available
      if (studentData.profilePicture) {
        const file = studentData.profilePicture
        const storageRef = ref(storage, `students/${Date.now()}-${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        profileImageUrl = await getDownloadURL(snapshot.ref)
      }

      // Create student object with image URL
      const newStudent = {
        ...studentData,
        profilePicture: profileImageUrl,
        createdAt: new Date().toISOString(),
      }

      // Save to Firestore
      await addDoc(collection(db, "students"), newStudent)

      // Send welcome email
      await fetch("/api/send-student-welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: studentData.email,
          name: studentData.fullName,
          password: studentData.password,
        }),
      });

      console.log("✅ Student enrolled and email sent:", studentData.email);

      setSuccess(true)
    } catch (error) {
      console.error("Error submitting student data:", error)
      toast({
        title: "Error",
        description: "Failed to save student data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStudentData({
      fullName: "",
      email: "",
      password: "",
      mobile: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      profilePicture: null,
      education: {
        highestQualification: "",
        institution: "",
        yearOfCompletion: "",
        grade: "",
      },
      guardianName: "",
      guardianContact: "",
    })
    setProfilePicturePreview(null)
    setCurrentStep("basic")
    setSuccess(false)
  }

  const getStepNumber = (step: Step): number => {
    const steps: Step[] = ["basic", "education"]
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
            <h2 className="mb-2 text-2xl font-bold">Student Successfully Enrolled!</h2>
            <p className="mb-6 text-gray-500">{studentData.fullName} has been added to the system.</p>
            <div className="flex gap-3">
              <Button onClick={resetForm} className="bg-[#006400] hover:bg-[#005000]">
                <Plus className="mr-2 h-4 w-4" /> Enroll Another Student
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
                { step: "education" as Step, label: "Education", icon: <School className="h-4 w-4" /> },
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
              <CardDescription>Enter the student's personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-32 flex flex-col items-center gap-2">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profilePicturePreview || ""} alt="Profile picture" />
                    <AvatarFallback className="text-2xl bg-[#e6f0e6] text-[#006400]">
                      {studentData.fullName
                        ? studentData.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                        : "SP"}
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

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="e.g., John Smith"
                      value={studentData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="e.g., john.smith@example.com"
                        value={studentData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        value={studentData.password}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        placeholder="e.g., +1 (555) 123-4567"
                        value={studentData.mobile}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={studentData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={studentData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Enter full address"
                      value={studentData.address}
                      onChange={handleInputChange}
                      rows={3}
                    />
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

        {/* Step 2: Educational Background */}
        {currentStep === "education" && (
          <Card>
            <CardHeader>
              <CardTitle>Educational Background</CardTitle>
              <CardDescription>Enter the student's educational history and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="highestQualification">Highest Qualification</Label>
                  <Select
                    value={studentData.education.highestQualification}
                    onValueChange={(value) => handleSelectChange("education.highestQualification", value)}
                  >
                    <SelectTrigger id="highestQualification">
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="associate">Associate Degree</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution/School Name</Label>
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="e.g., Springfield High School"
                    value={studentData.education.institution}
                    onChange={handleEducationChange}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="yearOfCompletion">Year of Completion</Label>
                    <Input
                      id="yearOfCompletion"
                      name="yearOfCompletion"
                      type="number"
                      placeholder="e.g., 2022"
                      value={studentData.education.yearOfCompletion}
                      onChange={handleEducationChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade/GPA</Label>
                    <Input
                      id="grade"
                      name="grade"
                      placeholder="e.g., A or 3.8"
                      value={studentData.education.grade}
                      onChange={handleEducationChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <div className="text-sm text-gray-500">Step {getStepNumber(currentStep)} of 2</div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="bg-[#006400] hover:bg-[#005000]" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Complete Enrollment"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
