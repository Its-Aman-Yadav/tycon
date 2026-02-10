"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Eye, AlertTriangle, Copy, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Student {
  id: string
  name: string
  email: string
  enrollmentDate: Date | null
  lastLogin: Date | null
  coursesEnrolled: number
  status: "active" | "inactive" | "suspended"
}

export function StudentsTable() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalStudents, setTotalStudents] = useState(0)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [pages, setPages] = useState<QueryDocumentSnapshot<DocumentData>[]>([])
  const [courseEnrollments, setCourseEnrollments] = useState<Record<string, number>>({})

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [studentToToggleStatus, setStudentToToggleStatus] = useState<Student | null>(null)

  useEffect(() => {
    fetchCourseEnrollments()
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [statusFilter, pageSize, currentPage, courseEnrollments])

  const fetchCourseEnrollments = async () => {
    try {
      // Fetch all course enrollments
      const enrollmentsQuery = query(collection(db, "course_enrollments"))
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)

      // Count enrollments per student
      const enrollmentCounts: Record<string, number> = {}

      enrollmentsSnapshot.forEach((doc) => {
        const data = doc.data()
        const studentId = data.studentId

        if (studentId) {
          enrollmentCounts[studentId] = (enrollmentCounts[studentId] || 0) + 1
        }
      })

      setCourseEnrollments(enrollmentCounts)
    } catch (error) {
      console.error("Error fetching course enrollments:", error)
    }
  }

  const fetchStudents = async (searchTerm = "") => {
    setLoading(true)
    try {
      // Create a query to fetch only users with role "student"
      let studentsQuery = query(collection(db, "users"), where("role", "==", "student"))

      // Add status filter if selected
      if (statusFilter !== "all" && statusFilter !== "") {
        studentsQuery = query(studentsQuery, where("status", "==", statusFilter))
      }

      // Order by name
      studentsQuery = query(studentsQuery, orderBy("name"), limit(pageSize))

      // If we're not on the first page and have a last document reference
      if (currentPage > 1 && pages[currentPage - 2]) {
        studentsQuery = query(studentsQuery, startAfter(pages[currentPage - 2]))
      }

      // Execute the query
      const querySnapshot = await getDocs(studentsQuery)

      // Get total count (in a real app, you might want to use a more efficient method)
      const totalQuery = query(collection(db, "users"), where("role", "==", "student"))
      const totalSnapshot = await getDocs(totalQuery)
      setTotalStudents(totalSnapshot.size)

      // Update pagination references
      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        const firstDoc = querySnapshot.docs[0]

        // Store page references
        if (currentPage > pages.length) {
          setPages([...pages, lastDoc])
        }

        setLastVisible(lastDoc)
        setFirstVisible(firstDoc)
      }

      const studentsList: Student[] = []
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      // Process each document
      querySnapshot.forEach((doc) => {
        const data = doc.data()

        // If there's a search term, filter by name or email
        if (
          searchTerm &&
          !data.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !data.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return
        }

        // Convert Firestore timestamp to Date object
        const createdAt = data.createdAt
          ? typeof data.createdAt === "string"
            ? new Date(data.createdAt)
            : data.createdAt.toDate()
          : null

        const lastLogin = data.lastLogin
          ? typeof data.lastLogin === "string"
            ? new Date(data.lastLogin)
            : data.lastLogin.toDate()
          : null

        // Determine status - if user hasn't logged in for 7+ days, mark as inactive
        let status = data.status || "active"
        if (status !== "suspended" && lastLogin && lastLogin < sevenDaysAgo) {
          status = "inactive"
        }

        // Get number of courses enrolled from our courseEnrollments state
        const coursesCount = courseEnrollments[doc.id] || 0

        studentsList.push({
          id: doc.id,
          name: data.name || "Unknown",
          email: data.email || "No email",
          enrollmentDate: createdAt,
          lastLogin: lastLogin,
          coursesEnrolled: coursesCount,
          status: status,
        })
      })

      setStudents(studentsList)
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchStudents(searchQuery)
  }

  const handleNextPage = () => {
    if (students.length === pageSize) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="secondary">Active</Badge>
    }
  }

  const viewStudentProfile = (studentId: string) => {
    router.push(`/dashboard/admin/students/${studentId}`)
  }

  const handleToggleStatusClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation()
    setStudentToToggleStatus(student)
    setStatusDialogOpen(true)
  }

  const toggleStudentStatus = async () => {
    if (!studentToToggleStatus) return

    try {
      // Update user status in Firestore
      const userRef = doc(db, "users", studentToToggleStatus.id)
      const newStatus = studentToToggleStatus.status === "suspended" ? "active" : "suspended"
      await updateDoc(userRef, {
        status: newStatus,
      })

      // Update local state
      setStudents(
        students.map((s) =>
          s.id === studentToToggleStatus.id
            ? {
              ...s,
              status: newStatus,
            }
            : s,
        ),
      )

      // You could add a toast notification here
      console.log(`User ${newStatus === "suspended" ? "suspended" : "reactivated"} successfully`)
    } catch (error) {
      console.error("Error updating user status:", error)
    } finally {
      setStatusDialogOpen(false)
      setStudentToToggleStatus(null)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation()
    setStudentToDelete(student)
    setDeleteDialogOpen(true)
  }

  const deleteStudent = async () => {
    if (!studentToDelete) return

    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", studentToDelete.id))

      // Delete associated course enrollments
      const enrollmentsQuery = query(collection(db, "course_enrollments"), where("studentId", "==", studentToDelete.id))
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)

      const deletePromises = enrollmentsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Update local state
      setStudents(students.filter((s) => s.id !== studentToDelete.id))
      setTotalStudents(totalStudents - 1)

      // You could add a toast notification here
      console.log(`Student ${studentToDelete.name} deleted successfully`)
    } catch (error) {
      console.error("Error deleting student:", error)
    } finally {
      setDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number.parseInt(value))
              setCurrentPage(1)
              setPages([])
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead>Courses Enrolled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="w-full h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="w-3/4 h-3 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-8 h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="w-8 h-4 bg-muted rounded animate-pulse ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => viewStudentProfile(student.id)}
                >
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </TableCell>
                  <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                  <TableCell>{student.coursesEnrolled}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(student.id)
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            viewStudentProfile(student.id)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleToggleStatusClick(e, student)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          {student.status === "suspended" ? "Reactivate Account" : "Suspend Account"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteClick(e, student)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {students.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, totalStudents)} of {totalStudents} students
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={students.length < pageSize}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{studentToDelete?.name}</span>'s account?
              <br />
              <br />
              This action cannot be undone. This will permanently delete the student's account and remove all their
              course enrollments and associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteStudent} className="bg-destructive text-destructive-foreground">
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {studentToToggleStatus?.status === "suspended" ? "Reactivate Account" : "Suspend Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {studentToToggleStatus?.status === "suspended" ? (
                <>
                  Are you sure you want to reactivate{" "}
                  <span className="font-semibold">{studentToToggleStatus?.name}</span>'s account?
                  <br />
                  <br />
                  This will restore their access to the platform and all enrolled courses.
                </>
              ) : (
                <>
                  Are you sure you want to suspend <span className="font-semibold">{studentToToggleStatus?.name}</span>
                  's account?
                  <br />
                  <br />
                  This will prevent them from logging in to the platform and accessing any enrolled courses.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={toggleStudentStatus}
              className={
                studentToToggleStatus?.status === "suspended"
                  ? "bg-primary"
                  : "bg-destructive text-destructive-foreground"
              }
            >
              {studentToToggleStatus?.status === "suspended" ? "Reactivate Account" : "Suspend Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
