"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db, storage } from "@/lib/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore"
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface Batch {
  id: string
  name: string
  courseName: string
  sessions?: {
    startTime: string
    endTime: string
    day: string
  }[]
  teacherNames?: string[]
  recordingUrl?: string
}

export default function TeacherDashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [upcoming, setUpcoming] = useState<Batch[]>([])
  const [past, setPast] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem("teacherId")
    if (storedId) setUserId(storedId)
    else setError("Teacher ID missing from localStorage.")
  }, [])

  useEffect(() => {
    const fetchBatches = async () => {
      if (!userId) return

      try {
        const q = query(collection(db, "batches"), where("teacherIds", "array-contains", userId))
        const snapshot = await getDocs(q)
        const now = new Date()

        const upcomingBatches: Batch[] = []
        const pastBatches: Batch[] = []

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data()
          const batch: Batch = {
            id: docSnap.id,
            name: data.name,
            courseName: data.courseName || "No course name",
            sessions: data.sessions || [],
            teacherNames: data.teacherNames || [],
            recordingUrl: data.recordingUrl || null,
          }

          const session = batch.sessions?.[0]
          if (session) {
            const sessionEnd = new Date(`1970-01-01T${session.endTime}:00`)
            if (sessionEnd > now) upcomingBatches.push(batch)
            else pastBatches.push(batch)
          } else {
            upcomingBatches.push(batch)
          }
        })

        setUpcoming(upcomingBatches)
        setPast(pastBatches)
      } catch (err) {
        console.error("Error fetching batches:", err)
        setError("Failed to load assigned batches.")
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [userId])

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    batchId: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const storageRef = ref(storage, `recordings/${batchId}/${file.name}`)

    try {
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateDoc(doc(db, "batches", batchId), { recordingUrl: url })
      alert("Recording uploaded successfully!")
    } catch (err) {
      console.error("Upload error:", err)
      alert("Failed to upload recording.")
    }
  }

  const renderBatchCard = (batch: Batch, showUpload = false) => (
    <Card
      key={batch.id}
      className="border border-green-300 bg-green-50 shadow-sm rounded-lg"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-green-800 text-lg font-semibold">
            {batch.name}
          </CardTitle>
          {showUpload && (
            <label className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded cursor-pointer">
              Upload Recording
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleUpload(e, batch.id)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-green-900 text-sm">
        <p><strong>Course:</strong> {batch.courseName}</p>

        {batch.sessions?.length ? (
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-100 text-green-700">Day: {batch.sessions[0].day}</Badge>
            <Badge className="bg-green-100 text-green-700">Start: {batch.sessions[0].startTime}</Badge>
            <Badge className="bg-green-100 text-green-700">End: {batch.sessions[0].endTime}</Badge>
          </div>
        ) : (
          <p>No sessions listed.</p>
        )}

        {batch.teacherNames?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {batch.teacherNames.map((name, idx) => (
              <Badge key={idx} className="bg-green-200 text-green-800">
                👨‍🏫 {name}
              </Badge>
            ))}
          </div>
        )}

        {showUpload && (
          <div className="mt-2">
            {batch.recordingUrl ? (
              <a
                href={batch.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                🎥 View Uploaded Recording
              </a>
            ) : (
              <span className="text-red-600 font-medium">Recording unavailable</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-green-800">Upcoming Batches</h2>
        {loading ? (
          <p className="text-gray-500">Loading batches...</p>
        ) : upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming batches assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((batch) => renderBatchCard(batch))}
          </div>
        )}

        <h2 className="text-xl font-bold text-green-800 mt-10">Past Batches</h2>
        {loading ? (
          <p className="text-gray-500">Loading batches...</p>
        ) : past.length === 0 ? (
          <p className="text-gray-500">No past batches yet.</p>
        ) : (
          <div className="space-y-4">
            {past.map((batch) => renderBatchCard(batch, true))}
          </div>
        )}
      </section>
    </div>
  )
}
