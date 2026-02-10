"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

type Props = {
  sessionId: string
}

export default function SessionEnrolledStudents({ sessionId }: Props) {
  const [students, setStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        const q = query(collection(db, "session_enrollments"), where("sessionId", "==", sessionId))
        const snapshot = await getDocs(q)
        const enrolled = snapshot.docs.map((doc) => doc.data().studentName)
        setStudents(enrolled)
      } catch (error) {
        console.error("Failed to fetch enrolled students:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledStudents()
  }, [sessionId])

  if (loading) return <p>Loading enrolled students...</p>
  if (students.length === 0) return <p>No students have registered for this session yet.</p>

  return (
    <div className="mt-4 space-y-2">
      <h2 className="text-lg font-semibold">Enrolled Students</h2>
      <ul className="list-disc list-inside">
        {students.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  )
}
