"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { MoreHorizontal, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Teacher {
  id: string
  name: string
  email: string
  createdAt?: Date | null
  status?: "Active" | "Inactive"
}

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  confirmButtonClass: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonClass,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-amber-500" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-md text-white ${confirmButtonClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TeacherTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Statuses")
  const [itemsPerPage, setItemsPerPage] = useState("10")
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    confirmButtonClass: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    confirmButtonClass: "",
    onConfirm: () => { },
  })

  const router = useRouter()

  useEffect(() => {
    fetchTeachers()
  }, [])

  async function fetchTeachers() {
    try {
      setLoading(true)
      // Create a query against the "users" collection where role is "teacher"
      const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"))

      // Execute the query
      const querySnapshot = await getDocs(teachersQuery)

      // Map the documents to our Teacher interface
      const teacherData: Teacher[] = querySnapshot.docs.map((doc) => {
        const data = doc.data()

        // Convert Firestore timestamp to Date object
        const createdAt = data.createdAt
          ? typeof data.createdAt === "string"
            ? new Date(data.createdAt)
            : data.createdAt.seconds
              ? new Date(data.createdAt.seconds * 1000)
              : null
          : null

        return {
          id: doc.id,
          name: data.name || "Unknown",
          email: data.email || "No email",
          createdAt: createdAt,
          status: data.status || "Active",
        }
      })

      setTeachers(teacherData)
    } catch (err) {
      console.error("Error fetching teachers:", err)
      setError("Failed to load teachers. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchQuery)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const toggleMenu = (teacherId: string) => {
    if (activeMenu === teacherId) {
      setActiveMenu(null)
    } else {
      setActiveMenu(teacherId)
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    alert("ID copied to clipboard")
    setActiveMenu(null)
  }

  const handleViewProfile = (id: string) => {
    router.push(`/dashboard/admin/teachers/${id}`)
    setActiveMenu(null)
  }

  const handleSuspendAccount = (id: string) => {
    const teacher = teachers.find((t) => t.id === id)
    if (!teacher) return

    const newStatus = teacher.status === "Active" ? "Inactive" : "Active"
    const action = teacher.status === "Active" ? "suspend" : "reactivate"

    setConfirmDialog({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      message: `Are you sure you want to ${action} ${teacher.name}'s account? ${action === "suspend"
          ? "They will no longer be able to access the system."
          : "This will restore their access to the system."
        }`,
      confirmText: action === "suspend" ? "Suspend Account" : "Reactivate Account",
      cancelText: "Cancel",
      confirmButtonClass: action === "suspend" ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600",
      onConfirm: async () => {
        try {
          // Update the teacher's status in Firestore
          const teacherRef = doc(db, "users", id)
          await updateDoc(teacherRef, {
            status: newStatus,
          })

          // Update the local state
          setTeachers((prevTeachers) => prevTeachers.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))

          // Close the dialog
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))

          // Show success message
          alert(`Teacher account ${action === "suspend" ? "suspended" : "reactivated"} successfully`)
        } catch (error) {
          console.error(`Error ${action}ing account:`, error)
          alert(`Failed to ${action} account. Please try again.`)
        }
      },
    })

    setActiveMenu(null)
  }

  const handleDeleteTeacher = (id: string) => {
    const teacher = teachers.find((t) => t.id === id)
    if (!teacher) return

    setConfirmDialog({
      isOpen: true,
      title: "Delete Teacher Account",
      message: `Are you sure you want to permanently delete ${teacher.name}'s account? This action cannot be undone.`,
      confirmText: "Delete Account",
      cancelText: "Cancel",
      confirmButtonClass: "bg-red-500 hover:bg-red-600",
      onConfirm: async () => {
        try {
          // Delete the teacher from Firestore
          await deleteDoc(doc(db, "users", id))

          // Update the local state
          setTeachers((prevTeachers) => prevTeachers.filter((t) => t.id !== id))

          // Close the dialog
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))

          // Show success message
          alert("Teacher deleted successfully")
        } catch (error) {
          console.error("Error deleting teacher:", error)
          alert("Failed to delete teacher. Please try again.")
        }
      },
    })

    setActiveMenu(null)
  }

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Teachers</h1>
      <p className="text-gray-500 mb-6">Manage all teacher accounts and view their information.</p>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value)}
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date of Joining</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`} className="border-b">
                    <td className="py-3 px-4">
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-5 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-xs text-gray-500">{teacher.email}</div>
                    </td>
                    <td className="py-3 px-4">{formatDate(teacher.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${teacher.status === "Active" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"
                          }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 relative">
                      <button onClick={() => toggleMenu(teacher.id)} className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>

                      {activeMenu === teacher.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => handleCopyId(teacher.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <span>Copy ID</span>
                            </button>
                            <button
                              onClick={() => handleViewProfile(teacher.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <span>View Profile</span>
                            </button>
                            <button
                              onClick={() => handleSuspendAccount(teacher.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <span>{teacher.status === "Active" ? "Suspend Account" : "Activate Account"}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <span>Delete Teacher</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmButtonClass={confirmDialog.confirmButtonClass}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />
    </div>
  )
}
