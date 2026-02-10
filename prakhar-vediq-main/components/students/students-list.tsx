"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { Edit, Eye, MoreHorizontal, Search, Trash2, Filter } from "lucide-react"

import { db } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { doc as firestoreDoc, updateDoc, deleteDoc } from "firebase/firestore"
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
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Batch {
  id: string
  name: string
  course: string
  status: string
  startDate: string
  teacherNames: string[]
}

interface Student {
  id: string
  fullName: string
  email: string
  mobile: string
  profilePicture: string
  enrolledBatches: { id: string; name: string; course: string }[]
  lastLogin?: string
  status: "active" | "inactive"
}

export function StudentsList() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterBatch, setFilterBatch] = useState<string>("all")
  const [batches, setBatches] = useState<Batch[]>([])

  const handleToggleStatus = async (student: Student) => {
    try {
      const newStatus = student.status === "active" ? "inactive" : "active"
      const studentRef = firestoreDoc(db, "students", student.id)
      await updateDoc(studentRef, {
        status: newStatus,
      })

      // Update local state
      const updatedStudents = students.map((s) => (s.id === student.id ? { ...s, status: newStatus } : s))
      setStudents(updatedStudents)
      applyFiltersAndSearch(updatedStudents)

      toast({
        title: "Status updated",
        description: `Student is now ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating student status:", error)
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return

    try {
      const studentRef = firestoreDoc(db, "students", studentToDelete.id)
      await deleteDoc(studentRef)

      // Update local state
      const updatedStudents = students.filter((s) => s.id !== studentToDelete.id)
      setStudents(updatedStudents)
      applyFiltersAndSearch(updatedStudents)

      toast({
        title: "Student deleted",
        description: "Student has been permanently deleted",
      })
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setStudentToDelete(null)
    }
  }

  // Check if mobile on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Fetch batches from Firestore
  const fetchBatches = async () => {
    try {
      const batchesCollection = collection(db, "batches")
      const batchesSnapshot = await getDocs(batchesCollection)

      const batchesData = batchesSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || `Batch ${doc.id.substring(0, 5)}`,
          course: data.course || "Unknown",
          status: data.status || "active",
          startDate: data.startDate || "",
          teacherNames: data.teacherNames || [],
        } as Batch
      })

      setBatches(batchesData)
      return batchesData
    } catch (error) {
      console.error("Error fetching batches:", error)
      return []
    }
  }

  // Fetch batch details by ID
  const fetchBatchDetails = async (batchId: string) => {
    try {
      const batchRef = doc(db, "batches", batchId)
      const batchSnap = await getDoc(batchRef)

      if (batchSnap.exists()) {
        const data = batchSnap.data()
        return {
          id: batchSnap.id,
          name: data.name || `Batch ${batchSnap.id.substring(0, 5)}`,
          course: data.course || "Unknown",
        }
      }
      return null
    } catch (error) {
      console.error(`Error fetching batch ${batchId}:`, error)
      return null
    }
  }

  // Fetch students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)

        // Fetch all batches first
        const batchesData = await fetchBatches()

        const studentsCollection = collection(db, "students")
        const studentsSnapshot = await getDocs(studentsCollection)

        const studentsPromises = studentsSnapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Get batch details for each enrolled batch ID
          let enrolledBatchesData = []

          if (Array.isArray(data.enrolledBatchIds)) {
            // If the student has enrolledBatchIds array, fetch each batch
            const batchPromises = data.enrolledBatchIds.map(async (batchId: string) => {
              // Look for batch in our already fetched batches
              const batchFromList = batchesData.find((b) => b.id === batchId)

              if (batchFromList) {
                return {
                  id: batchId,
                  name: batchFromList.name,
                  course: batchFromList.course,
                }
              } else {
                // If not found in our list, fetch individually
                const batchDetails = await fetchBatchDetails(batchId)
                return batchDetails
                  ? batchDetails
                  : { id: batchId, name: `Batch ${batchId.substring(0, 5)}`, course: "Unknown" }
              }
            })

            enrolledBatchesData = await Promise.all(batchPromises)
          } else if (data.enrolledBatches && Array.isArray(data.enrolledBatches)) {
            // If the student already has enrolledBatches array with details
            enrolledBatchesData = data.enrolledBatches
          }

          // Create a formatted student object with only the required fields
          return {
            id: doc.id,
            fullName: data.fullName,
            email: data.email,
            mobile: data.mobile,
            profilePicture: data.profilePicture || "",
            enrolledBatches: enrolledBatchesData,
            lastLogin: data.lastLogin || data.createdAt,
            status: data.status || "active", // Default to active if not specified
          } as Student
        })

        const studentsData = await Promise.all(studentsPromises)
        setStudents(studentsData)
        setFilteredStudents(studentsData)
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Apply filters and search when their values change
  useEffect(() => {
    applyFiltersAndSearch(students)
  }, [searchTerm, filterStatus, filterBatch])

  const applyFiltersAndSearch = (studentsList: Student[]) => {
    let result = [...studentsList]

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((student) => student.status === filterStatus)
    }

    // Apply batch filter
    if (filterBatch !== "all") {
      result = result.filter((student) => student.enrolledBatches.some((batch) => batch.id === filterBatch))
    }

    // Apply search
    if (searchTerm.trim() !== "") {
      const lowerCaseSearch = searchTerm.toLowerCase()
      result = result.filter(
        (student) =>
          student.fullName.toLowerCase().includes(lowerCaseSearch) ||
          student.email.toLowerCase().includes(lowerCaseSearch) ||
          student.mobile.toLowerCase().includes(lowerCaseSearch),
      )
    }

    setFilteredStudents(result)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value)
  }

  const handleBatchFilterChange = (value: string) => {
    setFilterBatch(value)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterBatch("all")
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading students...</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="w-full pl-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">Filter students by different criteria</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="status" className="text-sm font-medium col-span-1">
                      Status
                    </label>
                    <Select value={filterStatus} onValueChange={handleStatusFilterChange} className="col-span-3">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="batch" className="text-sm font-medium col-span-1">
                      Batch
                    </label>
                    <Select value={filterBatch} onValueChange={handleBatchFilterChange} className="col-span-3">
                      <SelectTrigger id="batch">
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} ({batch.course})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No students found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.profilePicture || "/placeholder.svg"} alt={student.fullName} />
                        <AvatarFallback>
                          {student.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.fullName}</div>
                        {student.enrolledBatches.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {student.enrolledBatches.length}
                            </Badge>{" "}
                            enrolled batches
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.mobile}</div>
                  </TableCell>
                  <TableCell>{formatDate(student.lastLogin || "")}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        student.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                      }
                    >
                      {student.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/admin/students/${student.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(student)}>
                          {student.status === "active" ? (
                            <>
                              <Edit className="mr-2 h-4 w-4" /> Make inactive
                            </>
                          ) : (
                            <>
                              <Edit className="mr-2 h-4 w-4" /> Make active
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStudent(student)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student
              {studentToDelete && <strong> {studentToDelete.fullName}</strong>} and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
