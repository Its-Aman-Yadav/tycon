"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

interface SessionCardProps {
  session: any
  isTeacher: boolean
  onDelete?: () => void
}

type StudentInfo = { name: string; email: string }

export function SessionCard({ session, isTeacher, onDelete }: SessionCardProps) {
  const startTime = new Date(session.startTime)
  const endTime = new Date(session.endTime)
  const now = new Date()

  const isLive = startTime <= now && endTime >= now
  const isUpcoming = startTime > now
  const isEnded = endTime < now && !isLive && !isUpcoming

  const [summaryOpen, setSummaryOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [recordingUrl, setRecordingUrl] = useState(session.recordingUrl || "")
  const [isSaving, setIsSaving] = useState(false)
  const [students, setStudents] = useState<StudentInfo[]>([])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  useEffect(() => {
    if (!summaryOpen || !session?.id) return

    const fetchEnrolledStudents = async () => {
      try {
        const q = query(
          collection(db, "session_enrollments"),
          where("sessionId", "==", session.id)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          name: doc.data().studentName || "Unnamed",
          email: doc.data().studentEmail || "No email",
        }))
        setStudents(data)
      } catch (err) {
        console.error("Failed to fetch enrolled students:", err)
      }
    }

    fetchEnrolledStudents()
  }, [summaryOpen, session.id])

  const handleUploadAndSave = async () => {
    setIsSaving(true)
    try {
      let url = recordingUrl

      if (file) {
        const storageRef = ref(storage, `recordings/${session.id}/${file.name}`)
        const snapshot = await uploadBytes(storageRef, file)
        url = await getDownloadURL(snapshot.ref)
        setRecordingUrl(url)
      }

      const refDoc = doc(db, "sessions", session.id)
      await updateDoc(refDoc, {
        recordingUrl: url,
      })

      setSummaryOpen(false)
    } catch (err) {
      console.error("Upload/Save failed:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadCSV = () => {
    const csv = ["Name,Email", ...students.map((s) => `${s.name},${s.email}`)].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${session.title || "session"}_students.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card>
        {session.thumbnailURL && (
          <img
            src={session.thumbnailURL}
            alt={`${session.title} Thumbnail`}
            className="w-full h-48 object-cover rounded-t-md"
          />
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{session.title}</CardTitle>
            {isLive && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                Live Now
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Upcoming
              </span>
            )}
            {isEnded && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Ended
              </span>
            )}
          </div>
          <CardDescription>
            {session.description?.length > 100
              ? `${session.description.substring(0, 100)}...`
              : session.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{startTime.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {formatTime(startTime)} – {formatTime(endTime)}
              </span>
            </div>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{session.teacherName || "Unknown"}</span>
            </div>
            {isEnded && (
              <p className="text-sm text-gray-500">
                Session ended on {endTime.toLocaleDateString()}
              </p>
            )}
            {isUpcoming && (
              <p className="text-sm text-gray-500">
                Scheduled for {startTime.toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          {isTeacher ? (
            isLive ? (
              <Link href={`/dashboard/sessions/${session.id}`} className="w-full">
                <Button className="w-full">Start Session</Button>
              </Link>
            ) : isEnded ? (
              <Button className="w-full" onClick={() => setSummaryOpen(true)}>
                View Summary
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  const confirmDelete = confirm("Do you want to delete this session?")
                  if (confirmDelete && onDelete) {
                    onDelete()
                  }
                }}
              >
                Manage Session
              </Button>
            )
          ) : (
            <Link href={session.zoomLink || "#"} className="w-full" target="_blank">
              <Button className="w-full" disabled={!isLive}>
                {isLive
                  ? "Join Session"
                  : isEnded
                  ? "Session Ended"
                  : "Join When Live"}
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      {/* View Summary Dialog */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Summary</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Students Joined:</p>
                {students.length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadCSV}>
                    Download CSV
                  </Button>
                )}
              </div>

              {students.length > 0 ? (
                <ul className="text-sm list-disc list-inside text-muted-foreground">
                  {students.map((s, i) => (
                    <li key={i}>
                      {s.name} — {s.email}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No students joined.</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Upload Recording</label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {recordingUrl && (
                <p className="text-xs text-green-600">
                  <a
                    href={recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Current video
                  </a>
                </p>
              )}
            </div>

            <Button onClick={handleUploadAndSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
