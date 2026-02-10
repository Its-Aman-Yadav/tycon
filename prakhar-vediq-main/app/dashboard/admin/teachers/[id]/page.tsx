"use client"

import { useEffect, useState, use } from "react"
import { doc, getDoc } from "firebase/firestore"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Edit,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"

interface AvailabilityTimeSlot {
  morning: boolean
  afternoon: boolean
  evening: boolean
}

interface Availability {
  monday: AvailabilityTimeSlot
  tuesday: AvailabilityTimeSlot
  wednesday: AvailabilityTimeSlot
  thursday: AvailabilityTimeSlot
  friday: AvailabilityTimeSlot
  saturday: AvailabilityTimeSlot
  sunday: AvailabilityTimeSlot
}

interface Teacher {
  uid: string
  fullName: string
  email: string
  mobile: string
  subjects: string[]
  teacherType: string
  teachingMode: string
  createdAt: string
  profilePictureURL?: string
  assignedBatches?: string[]
  availability: Availability
}

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeacher() {
      try {
        const teacherDoc = doc(db, "teachers", id)
        const teacherSnapshot = await getDoc(teacherDoc)

        if (!teacherSnapshot.exists()) {
          setError("Teacher not found")
          setLoading(false)
          return
        }

        const data = teacherSnapshot.data()

        // Create default availability object
        const defaultAvailability: AvailabilityTimeSlot = { morning: false, afternoon: false, evening: false }
        const defaultWeekAvailability: Availability = {
          monday: { ...defaultAvailability },
          tuesday: { ...defaultAvailability },
          wednesday: { ...defaultAvailability },
          thursday: { ...defaultAvailability },
          friday: { ...defaultAvailability },
          saturday: { ...defaultAvailability },
          sunday: { ...defaultAvailability },
        }

        // Merge availability with defaults to handle partial data
        const availabilityData = data?.availability || {}
        const safeAvailability: Availability = {
          monday: availabilityData.monday || { ...defaultAvailability },
          tuesday: availabilityData.tuesday || { ...defaultAvailability },
          wednesday: availabilityData.wednesday || { ...defaultAvailability },
          thursday: availabilityData.thursday || { ...defaultAvailability },
          friday: availabilityData.friday || { ...defaultAvailability },
          saturday: availabilityData.saturday || { ...defaultAvailability },
          sunday: availabilityData.sunday || { ...defaultAvailability },
        }

        // Helper to safely serialize date
        const serializeDate = (dateVal: any): string => {
          if (!dateVal) return new Date().toISOString()
          if (typeof dateVal === "string") return dateVal
          // Handle Firestore Timestamp
          if (dateVal?.toDate && typeof dateVal.toDate === "function") {
            return dateVal.toDate().toISOString()
          }
          // Handle other date objects
          try {
            return new Date(dateVal).toISOString()
          } catch (e) {
            return new Date().toISOString()
          }
        }

        const teacherData: Teacher = {
          uid: data?.uid || id,
          fullName: data?.fullName || data?.name || "Unknown Teacher",
          email: data?.email || "No email provided",
          mobile: data?.mobile || "No mobile number",
          subjects: Array.isArray(data?.subjects) ? data.subjects : [],
          teacherType: data?.teacherType || data?.type || "Guest",
          teachingMode: data?.teachingMode || "Online",
          createdAt: serializeDate(data?.createdAt),
          profilePictureURL: data?.profilePictureURL || data?.avatar || "",
          assignedBatches: data?.assignedBatches || [],
          availability: safeAvailability,
        }

        setTeacher(teacherData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching teacher:", err)
        setError("Failed to load teacher details. Please try again later.")
        setLoading(false)
      }
    }

    fetchTeacher()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#006400]" />
      </div>
    )
  }

  if (error || !teacher) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin/teachers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to teachers</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error || "Teacher not found"}</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/admin/teachers">Back to Teachers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format the creation date
  const createdDate = new Date(teacher.createdAt)
  const formattedCreatedDate = createdDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get teacher type badge color
  const getTeacherTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return "bg-blue-50 text-blue-600 border-blue-200"
      case "part-time":
        return "bg-purple-50 text-purple-600 border-purple-200"
      case "guest":
        return "bg-amber-50 text-amber-600 border-amber-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  // Get teaching mode badge color
  const getTeachingModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "online":
        return "bg-green-50 text-green-600 border-green-200"
      case "offline":
        return "bg-orange-50 text-orange-600 border-orange-200"
      case "both":
        return "bg-indigo-50 text-indigo-600 border-indigo-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  // Order days of the week
  const orderedDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

  // Time slots with display names
  const timeSlots = [
    { key: "morning", label: "Morning" },
    { key: "afternoon", label: "Afternoon" },
    { key: "evening", label: "Evening" },
  ] as const

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin/teachers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to teachers</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{teacher.fullName}</h1>
        </div>
        {/* <Button className="bg-[#006400] hover:bg-[#005000]" asChild>
          <Link href={`/dashboard/admin/teachers/${teacher.uid}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Teacher
          </Link>
        </Button> */}
      </div>

      {/* Teacher Profile Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-[#f0f7f0] p-6">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage
                src={teacher.profilePictureURL || "/placeholder-user.jpg"}
                alt={teacher.fullName}
              />
              <AvatarFallback className="text-xl">
                {teacher.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#006400]">{teacher.fullName}</h2>
              <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className={getTeacherTypeColor(teacher.teacherType)}>{teacher.teacherType}</Badge>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#006400]" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#006400]" />
                  <span>{teacher.mobile}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-[#d1e7d1] bg-white p-3 text-sm">
              <Calendar className="h-4 w-4 text-[#006400]" />
              <span>Joined on {formattedCreatedDate}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Expertise & Availability */}
        <div className="md:col-span-2">
          {/* Expertise */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center pb-2">
              <GraduationCap className="mr-2 h-5 w-5 text-[#006400]" />
              <CardTitle>Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject, index) => (
                  <Badge key={index} variant="outline" className="bg-[#e6f0e6] px-3 py-1.5 text-[#006400]">
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability - Redesigned for better visibility */}
          <Card>
            <CardHeader className="flex flex-row items-center pb-2">
              <Clock className="mr-2 h-5 w-5 text-[#006400]" />
              <CardTitle>Availability Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left font-medium text-gray-600">Day</th>
                      {timeSlots.map((slot) => (
                        <th key={slot.key} className="border-b p-2 text-left font-medium text-gray-600">
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orderedDays.map((day) => (
                      <tr key={day} className="border-b last:border-b-0">
                        <td className="p-3 font-medium capitalize">{day}</td>
                        {timeSlots.map((slot) => {
                          const isAvailable = teacher.availability[day][slot.key]
                          return (
                            <td key={slot.key} className="p-3">
                              {isAvailable ? (
                                <div className="flex items-center">
                                  <div className="mr-2 rounded-full bg-green-100 p-1">
                                    <Check className="h-4 w-4 text-green-600" />
                                  </div>
                                  <span className="text-green-600 font-medium">Available</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <div className="mr-2 rounded-full bg-gray-100 p-1">
                                    <X className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <span>Unavailable</span>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Batches */}

      </div>
    </div>
  )
}
