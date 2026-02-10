"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Trash2, Search } from "lucide-react"
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase" // Import the db instance from your firebase config

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from "@/hooks/use-toast"

interface Teacher {
  id: string
  name: string
  email: string
  avatar?: string
  subjects: string[]
  type: "full-time" | "guest" | "external"
  batchesCount: number
  role?: string
  createdAt?: string
  uid?: string
  facilities?: string[]
}

export function TeachersList() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [facilityFilter, setFacilityFilter] = useState<string>("all")
  const [availableFacilities, setAvailableFacilities] = useState<string[]>([])

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    // Apply filters whenever search query or filters change
    applyFilters()
  }, [searchQuery, typeFilter, facilityFilter, teachers])

  async function fetchTeachers() {
    try {
      setLoading(true)
      const teachersCollection = collection(db, "teachers")
      const teachersSnapshot = await getDocs(teachersCollection)

      const teachersData: Teacher[] = teachersSnapshot.docs.map((doc) => {
        const data = doc.data()

        // Map Firestore data to Teacher interface
        return {
          id: doc.id,
          name: data.fullName || data.name || "Unknown",
          email: data.email || "",
          avatar: data.profilePictureURL || data.avatar || undefined,
          // Parse subjects from Firestore or provide default
          subjects: data.subjects || ["Not specified"],
          // Parse type from Firestore or provide default
          type: data.teacherType || data.type || "full-time",
          // Parse batchesCount from Firestore or provide default
          batchesCount: data.assignedBatches?.length || data.batchesCount || 0,
          role: data.role,
          createdAt: data.createdAt,
          uid: data.uid,
          facilities: data.facilities || [],
        }
      })

      // Extract all unique facilities for the filter dropdown
      const allFacilities = new Set<string>()
      teachersData.forEach((teacher) => {
        if (teacher.facilities && teacher.facilities.length > 0) {
          teacher.facilities.forEach((facility) => allFacilities.add(facility))
        }
      })

      setAvailableFacilities(Array.from(allFacilities))
      setTeachers(teachersData)
      setFilteredTeachers(teachersData)
    } catch (err) {
      console.error("Error fetching teachers:", err)
      setError("Failed to load teachers data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...teachers]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(query) ||
          teacher.email.toLowerCase().includes(query) ||
          teacher.subjects.some((subject) => subject.toLowerCase().includes(query)),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((teacher) => teacher.type === typeFilter)
    }

    // Apply facility filter
    if (facilityFilter !== "all") {
      result = result.filter((teacher) => teacher.facilities && teacher.facilities.includes(facilityFilter))
    }

    setFilteredTeachers(result)
  }

  const handleViewTeacher = (teacherId: string) => {
    router.push(`/dashboard/admin/teachers/${teacherId}`)
  }

  const handleEditTeacher = (teacherId: string) => {
    router.push(`/dashboard/admin/teachers/${teacherId}/edit`)
  }

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!teacherToDelete) return

    try {
      setIsDeleting(true)
      // Delete the teacher document from Firestore
      await deleteDoc(doc(db, "teachers", teacherToDelete.id))

      // Update the local state to remove the deleted teacher
      const updatedTeachers = teachers.filter((teacher) => teacher.id !== teacherToDelete.id)
      setTeachers(updatedTeachers)
      setFilteredTeachers(filteredTeachers.filter((teacher) => teacher.id !== teacherToDelete.id))

      // Show success toast
      toast({
        title: "Teacher deleted",
        description: `${teacherToDelete.name} has been successfully removed.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting teacher:", error)
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTeacherToDelete(null)
    }
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search instructors by name, email or subject..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>

            {availableFacilities.length > 0 && (
              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  {availableFacilities.map((facility) => (
                    <SelectItem key={facility} value={facility}>
                      {facility}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {filteredTeachers.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">No teachers found</h3>
          <p className="text-sm text-muted-foreground">
            {teachers.length > 0
              ? "No teachers match your current filters. Try adjusting your search criteria."
              : "There are no teachers in the database yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructors</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject Expertise</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                        <AvatarFallback>
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="bg-[#e6f0e6] text-[#006400]">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        teacher.type === "full-time"
                          ? "bg-blue-50 text-blue-600"
                          : teacher.type === "guest"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-purple-50 text-purple-600"
                      }
                    >
                      {teacher.type === "full-time" ? "Full-time" : teacher.type === "guest" ? "Guest" : "External"}
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
                        <DropdownMenuItem onClick={() => handleViewTeacher(teacher.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(teacher)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {teacherToDelete?.name} from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject Expertise</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
