"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Student {
  id: string
  email: string
}


interface Teacher {
  id: string
  name: string
}

interface BatchDetails {
  name: string
  courseName?: string
  startDate?: string
  endDate?: string
  mode?: "live" | "recorded" | "both"
  joinedStudents: string[]
  teacherIds?: string[]
  sessions?: { day: string; startTime: string; endTime: string }[]
}

export default function BatchAttendancePage() {
  const { id: batchId } = useParams() as { id: string }
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [batch, setBatch] = useState<BatchDetails | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])

  useEffect(() => {
    const fetchJoinedStudents = async () => {
      try {
        setLoading(true)

        // 1. Fetch batch data
        const batchRef = doc(db, "batches", batchId)
        const batchSnap = await getDoc(batchRef)
        if (!batchSnap.exists()) {
          setStudents([])
          setBatch(null)
          return
        }

        const batchData = batchSnap.data()
        const joinedStudents: string[] = batchData?.joinedStudents || []

        const batchDetails: BatchDetails = {
          name: batchData?.name || "Unnamed Batch",
          courseName: batchData?.courseName || "Unknown Course",
          startDate: batchData?.startDate || "",
          endDate: batchData?.endDate || "",
          mode: batchData?.mode || "live",
          joinedStudents,
          teacherIds: batchData?.teacherIds || [],
          sessions: batchData?.sessions || [],
        }

        setBatch(batchDetails)

        // 2. Fetch instructor names if teacherIds exist
        if (batchDetails.teacherIds && batchDetails.teacherIds.length > 0) {
          const teacherChunks = []
          for (let i = 0; i < batchDetails.teacherIds.length; i += 10) {
            teacherChunks.push(batchDetails.teacherIds.slice(i, i + 10))
          }

          const fetchedTeachers: Teacher[] = []
          for (const chunk of teacherChunks) {
            const q = query(collection(db, "teachers"), where("__name__", "in", chunk))
            const snapshot = await getDocs(q)
            snapshot.forEach((doc) => {
              const data = doc.data()
              fetchedTeachers.push({ id: doc.id, name: data.fullName || data.name || "Unnamed" })
            })
          }

          setTeachers(fetchedTeachers)
        }

        // 3. Fetch joined student data
        if (joinedStudents.length === 0) {
          setStudents([])
          return
        }

        const studentChunks: string[][] = []
        for (let i = 0; i < joinedStudents.length; i += 10) {
          studentChunks.push(joinedStudents.slice(i, i + 10))
        }

        const fetchedStudents: Student[] = []
        for (const chunk of studentChunks) {
          const q = query(collection(db, "students"), where("email", "in", chunk))
          const snapshot = await getDocs(q)
          snapshot.forEach((doc) => {
            const data = doc.data()
            fetchedStudents.push({
              id: doc.id,
              email: data.email,
            })

          })
        }

        setStudents(fetchedStudents)




        setStudents(fetchedStudents)
      } catch (error) {
        console.error("Error loading attendance page:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJoinedStudents()
  }, [batchId])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const modeLabel = {
    live: "Live",
    recorded: "Recorded",
    both: "Live & Recorded",
  }

  const renderSchedule = () => {
    if (!batch?.sessions || batch.sessions.length === 0) return "Not specified"
    const days = [...new Set(batch.sessions.map((s) => s.day))]
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
      .join(", ")

    const time = `${batch.sessions[0].startTime} - ${batch.sessions[0].endTime}`
    return `${days} • ${time}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Attendance — {batch?.name || "Loading..."}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {batch ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div><span className="font-medium">Course:</span> {batch.courseName}</div>
              <div><span className="font-medium">Date Range:</span>{" "}
                {batch.startDate && batch.endDate
                  ? `${formatDate(batch.startDate)} → ${formatDate(batch.endDate)}`
                  : "Not Set"}
              </div>
              <div><span className="font-medium">Mode:</span>{" "}
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {modeLabel[batch.mode || "live"]}
                </Badge>
              </div>
              <div><span className="font-medium">Joined Students:</span> {batch.joinedStudents.length}</div>
              <div className="col-span-2"><span className="font-medium">Instructor:</span>{" "}
                {teachers.length > 0
                  ? teachers.map((t) => t.name).join(", ")
                  : "Not Assigned"}
              </div>
              <div className="col-span-2"><span className="font-medium">Time:</span> {renderSchedule()}</div>
            </div>
          ) : (
            <p className="text-gray-500">Loading batch details...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Joined Students</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[#006400]" />
              <span className="ml-3 text-gray-600">Loading attendance...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              <p>No students have joined this class yet.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between border rounded-md p-4 bg-gray-50"
                >
                  <span className="text-sm text-gray-800">{student.email}</span>
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-300 bg-green-50"
                  >
                    Joined
                  </Badge>
                </li>

              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
