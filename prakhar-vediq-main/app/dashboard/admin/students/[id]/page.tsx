"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { doc, getDoc } from "firebase/firestore"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  GraduationCap,
  School,
  FileText,
  Award,
  Briefcase,
} from "lucide-react"

import { db } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

interface Education {
  grade: string
  highestQualification: string
  institution: string
  yearOfCompletion: string
}

interface Student {
  id: string
  fullName: string
  email: string
  mobile: string
  address: string
  dateOfBirth: string
  gender: string
  profilePicture: string
  education: Education
  createdAt: string
  password: string // Note: This should not be displayed in the UI
  status: string // Added status field
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDoc = await getDoc(doc(db, "students", id))

        if (!studentDoc.exists()) {
          console.error("Student not found")
          setLoading(false)
          return
        }

        const data = studentDoc.data()

        // Helper to safely serialize date
        const serializeDate = (dateVal: any): string => {
          if (!dateVal) return ""
          if (typeof dateVal === "string") return dateVal
          // Handle Firestore Timestamp
          if (dateVal?.toDate && typeof dateVal.toDate === "function") {
            return dateVal.toDate().toISOString()
          }
          // Handle other date objects
          try {
            return new Date(dateVal).toISOString()
          } catch (e) {
            return ""
          }
        }

        const educationData = data.education || {}

        setStudent({
          id: studentDoc.id,
          fullName: data.fullName || "Unknown",
          email: data.email || "",
          mobile: data.mobile || "",
          address: data.address || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          profilePicture: data.profilePicture || "",
          education: {
            grade: educationData.grade || "",
            highestQualification: educationData.highestQualification || "",
            institution: educationData.institution || "",
            yearOfCompletion: educationData.yearOfCompletion || "",
          },
          createdAt: serializeDate(data.createdAt),
          password: data.password || "", // Note: This should not be displayed in the UI
          status: data.status || "inactive", // Fetch status from Firestore
        })
      } catch (error) {
        console.error("Error fetching student:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return format(date, "PPP")
    } catch (e) {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return format(date, "PPP p")
    } catch (e) {
      return dateString
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <Button variant="ghost" size="sm" className="mb-6 hover:bg-slate-100" onClick={() => router.push("/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-[250px]" />
              <Skeleton className="h-5 w-[200px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full md:col-span-2" />
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container max-w-6xl py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 hover:bg-slate-100"
          onClick={() => router.push("/dashboard/admin/students")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>

        <Card className="border-none shadow-md">
          <CardContent className="flex h-[300px] items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Student not found</h2>
              <p className="text-muted-foreground mt-2">
                The student you're looking for doesn't exist or has been removed.
              </p>
              <Button className="mt-6" onClick={() => router.push("/dashboard/admin/students")}>
                Return to Students List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine the status badge style based on status
  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "inactive":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "suspended":
        return "bg-red-50 text-red-700 border-red-200"
      case "graduated":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-slate-100"
          onClick={() => router.push("/dashboard/admin/students")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`px-3 py-1 ${getStatusBadgeStyle(student.status)}`}>
            <p className="font-semibold">
              {student.status === "active"
                ? "Active Student"
                : student.status === "inactive"
                  ? "Inactive"
                  : student.status === "suspended"
                    ? "Suspended"
                    : student.status === "graduated"
                      ? "Graduated"
                      : student.status || "Unknown Status"}
            </p>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-md lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage
                src={student.profilePicture || "/placeholder-user.jpg"}
                alt={student.fullName}
              />
              <AvatarFallback className="text-2xl">{getInitials(student.fullName)}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold mb-1">{student.fullName}</h1>
            <p className="text-muted-foreground mb-4 flex items-center justify-center">
              <Mail className="h-4 w-4 mr-1.5" />
              {student.email}
            </p>

            <div className="w-full mt-2">
              <div className="flex items-center justify-between py-3 border-t">
                <span className="text-sm font-medium">Student ID</span>
                <span className="text-sm text-muted-foreground max-w-[120px] truncate" title={student.id}>
                  {student.id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <span className="text-sm font-medium">Joined</span>
                <span className="text-sm text-muted-foreground">{formatDate(student.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <span className="text-sm font-medium">Gender</span>
                <span className="text-sm text-muted-foreground">{student.gender}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline" className={`text-xs ${getStatusBadgeStyle(student.status)}`}>
                  {student.status || "Unknown"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md lg:col-span-3">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Student Information</CardTitle>
                <TabsList>
                  <TabsTrigger value="overview" className="rounded-md">
                    <User className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="education" className="rounded-md">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Education
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator className="mt-6" />
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-slate-500" />
                      Personal Information
                    </h3>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Full Name</td>
                          <td className="py-3 text-sm text-right">{student.fullName}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Date of Birth</td>
                          <td className="py-3 text-sm text-right flex items-center justify-end">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            {student.dateOfBirth}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Gender</td>
                          <td className="py-3 text-sm text-right">{student.gender}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Status</td>
                          <td className="py-3 text-sm text-right">
                            <Badge variant="outline" className={`px-2 py-0.5 ${getStatusBadgeStyle(student.status)}`}>
                              {student.status || "Unknown"}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-sm font-medium">Registration Date</td>
                          <td className="py-3 text-sm text-right flex items-center justify-end">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            {formatDateTime(student.createdAt)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-slate-500" />
                      Contact Information
                    </h3>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Email Address</td>
                          <td className="py-3 text-sm text-right flex items-center justify-end">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            {student.email}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Phone Number</td>
                          <td className="py-3 text-sm text-right flex items-center justify-end">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            {student.mobile}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-sm font-medium">Address</td>
                          <td className="py-3 text-sm text-right flex items-center justify-end">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            {student.address}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <School className="h-5 w-5 mr-2 text-slate-500" />
                      Current Education
                    </h3>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Grade/Level</td>
                          <td className="py-3 text-sm text-right">{student.education.grade || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-sm font-medium">Institution</td>
                          <td className="py-3 text-sm text-right flex items-center justify-end">
                            <School className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            {student.education.institution || "N/A"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-slate-500" />
                      Highest Qualification
                    </h3>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 text-sm font-medium">Qualification</td>
                          <td className="py-3 text-sm text-right">{student.education.highestQualification || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-sm font-medium">Year of Completion</td>
                          <td className="py-3 text-sm text-right">{student.education.yearOfCompletion || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
