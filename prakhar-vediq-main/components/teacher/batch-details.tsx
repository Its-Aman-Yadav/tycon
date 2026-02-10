"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { Calendar, Clock, Users, BookOpen, User } from "lucide-react"

import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Session {
  day: string
  startTime: string
  endTime: string
  recurring: boolean
}

interface Batch {
  id: string
  courseId: string
  courseName: string
  name: string
  mode: string
  sessions: Session[]
  teacherNames: string[]
  teacherIds: string[]
  studentNames: string[]
  studentIds: string[]
  status: string
  startDate: string
  endDate: string
  scheduleFormat: string
  meetingLink?: string
}

interface BatchDetailsProps {
  batchId: string
}

export default function BatchDetails({ batchId }: BatchDetailsProps) {
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        setLoading(true)
        const batchDoc = await getDoc(doc(db, "batches", batchId))

        if (batchDoc.exists()) {
          setBatch({
            id: batchDoc.id,
            ...batchDoc.data(),
          } as Batch)
        } else {
          setError("Batch not found")
        }
      } catch (err) {
        console.error("Error fetching batch details:", err)
        setError("Failed to load batch details")
      } finally {
        setLoading(false)
      }
    }

    if (batchId) {
      fetchBatchDetails()
    } else {
      setError("No batch ID provided")
      setLoading(false)
    }
  }, [batchId])

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!batch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Batch Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested batch could not be found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-green-50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{batch.courseName}</p>
            <CardTitle className="mt-1">{batch.name}</CardTitle>
          </div>
          <Badge variant={batch.status === "active" ? "success" : "secondary"} className="capitalize">
            {batch.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Batch Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Course: {batch.courseName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    Duration: {batch.startDate} to {batch.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {batch.mode} classes
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {batch.scheduleFormat} schedule
                  </Badge>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="mb-2 font-medium">Schedule</h3>
              <div className="space-y-2 rounded-md border p-3">
                {batch.sessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium capitalize">{formatDay(session.day)}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {session.startTime} - {session.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* People */}
          <div className="space-y-4">
            {/* Teachers */}
            <div>
              <h3 className="mb-2 font-medium">Teachers</h3>
              <div className="rounded-md border p-3">
                {batch.teacherNames && batch.teacherNames.length > 0 ? (
                  <ul className="space-y-2">
                    {batch.teacherNames.map((teacher, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{teacher}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No teachers assigned</p>
                )}
              </div>
            </div>

            {/* Students */}
            <div>
              <h3 className="mb-2 font-medium">Students</h3>
              <div className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Students</span>
                  <Badge variant="secondary">{batch.studentNames?.length || 0}</Badge>
                </div>
                {batch.studentNames && batch.studentNames.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {batch.studentNames.map((student, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span>{student}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No students enrolled</p>
                )}
              </div>
            </div>

            {/* Meeting Link */}
            {batch.meetingLink && (
              <div>
                <h3 className="mb-2 font-medium">Meeting Link</h3>
                <div className="rounded-md border p-3">
                  <a
                    href={batch.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {batch.meetingLink}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
