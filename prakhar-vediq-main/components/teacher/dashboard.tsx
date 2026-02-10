"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import TodaysClass from "@/components/teacher/todays-class"
import GradingTodo from "@/components/teacher/grading-todo"
import QuickActions from "@/components/teacher/quick-actions"

export default function TeacherDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [teacherName, setTeacherName] = useState("")
  const [loading, setLoading] = useState(true)
  const hasClassToday = true

  useEffect(() => {
    const teacherId = localStorage.getItem("teacherId")
    const teacherNameFromStorage = localStorage.getItem("teacherName")

    if (teacherId) {
      setIsAuthorized(true)
      if (teacherNameFromStorage) {
        setTeacherName(teacherNameFromStorage)
        setLoading(false)
      } else {
        fetchTeacherName(teacherId)
      }
    } else {
      setIsAuthorized(false)
      setLoading(false)
    }
  }, [])

  const fetchTeacherName = async (uid: string) => {
    try {
      const teacherDoc = await getDoc(doc(db, "teachers", uid))
      if (teacherDoc.exists()) {
        const data = teacherDoc.data()
        setTeacherName(data.fullName || "Teacher")
      } else {
        console.warn("⚠️ No teacher found in Firestore for UID:", uid)
      }
    } catch (err) {
      console.error("❌ Error fetching teacher data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600 text-sm">Loading dashboard...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Unauthorized Access</h1>
        <p className="text-gray-500 mt-2">
          Please log in as a teacher to access your dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Hi {teacherName || "Teacher"} 👋
        </h1>
        <p className="text-sm text-gray-500">Welcome to your teaching dashboard</p>
      </div>

      <div className="grid gap-5 md:grid-cols-12">
        <div className="space-y-5 md:col-span-8">
          {hasClassToday && <TodaysClass />}
          <GradingTodo />
        </div>

        <div className="space-y-5 md:col-span-4">
          <QuickActions />
          <div className="rounded-lg border bg-gray-100 p-5 shadow-sm opacity-60 pointer-events-none">
            <h3 className="mb-3 text-lg font-medium text-gray-600">Teaching Stats (Coming Soon)</h3>
            <div className="space-y-3">
              {["Classes this month", "Total students", "Assignments graded", "Average rating"].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="font-medium text-gray-400">—</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
