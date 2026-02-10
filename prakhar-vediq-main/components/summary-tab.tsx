"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Course {
  id: string
  title: string
  mode: "live" | "recorded"
  progress: number
  thumbnail: string
  instructor: string
  lastAccessed?: string
  totalHours?: number
  totalLectures?: number
}

interface SummaryTabProps {
  course: Course
}

export function SummaryTab({ course }: SummaryTabProps) {
  const [isSimplified, setIsSimplified] = useState(false)
  const [summaryLong, setSummaryLong] = useState("")
  const [summaryShort, setSummaryShort] = useState("")

  useEffect(() => {
    async function fetchSummaries() {
      const docRef = doc(db, "courses", course.id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setSummaryLong(data.summarylong || "")
        setSummaryShort(data.summaryshort || "")
      }
    }

    fetchSummaries()
  }, [course.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Smart Summary</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSimplified(!isSimplified)}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          {isSimplified ? "Show Full" : "Simplify Further"}
        </Button>
      </div>

      <ScrollArea className="h-96">
        <div className="border-l-4 border-green-500 pl-4 py-2">
          <p className="text-gray-700 leading-relaxed">
            {isSimplified ? summaryShort : summaryLong}
          </p>
        </div>
      </ScrollArea>
    </div>
  )
}
