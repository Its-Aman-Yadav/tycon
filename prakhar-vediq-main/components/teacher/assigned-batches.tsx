"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Calendar, Users, Video } from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"

// Define the batch type
interface Batch {
  id: string
  name: string
  course: string
  mode: "live" | "recorded" | "hybrid"
  schedule: string
  students: number
  teacherId: string
}

export default function AssignedBatches() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true)

        // Assuming you have the current teacher's ID from authentication or context
        // Replace 'currentTeacherId' with the actual way you get the teacher ID
        const currentTeacherId = "current-teacher-id" // This should come from auth context

        // Create a query against the batches collection
        const batchesRef = collection(db, "batches")
        const q = query(batchesRef, where("teacherId", "==", currentTeacherId))

        // Execute the query
        const querySnapshot = await getDocs(q)

        // Process the results
        const fetchedBatches: Batch[] = []
        querySnapshot.forEach((doc) => {
          fetchedBatches.push({
            id: doc.id,
            ...(doc.data() as Omit<Batch, "id">),
          })
        })

        setBatches(fetchedBatches)
      } catch (err) {
        console.error("Error fetching batches:", err)
        setError("Failed to load batches. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Assigned Batches</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            className="hidden md:flex"
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            className="hidden md:flex"
            aria-label="Scroll right"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Link href="/teacher/batches">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex space-x-4 overflow-x-auto pb-4 md:pb-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="min-w-[280px] max-w-[350px] flex-shrink-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="mt-2 h-6 w-full" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No batches assigned yet.</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-4 md:pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {batches.map((batch) => (
            <Card key={batch.id} className="min-w-[280px] max-w-[350px] flex-shrink-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={batch.mode === "live" ? "default" : "secondary"}
                    className={`${batch.mode === "live"
                        ? "bg-green-100 text-[#006400]"
                        : batch.mode === "recorded"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                  >
                    {batch.mode === "live" ? (
                      <>
                        <Video className="mr-1 h-3 w-3" /> Live
                      </>
                    ) : batch.mode === "recorded" ? (
                      "Recorded"
                    ) : (
                      "Hybrid"
                    )}
                  </Badge>
                  <span className="flex items-center text-sm text-gray-500">
                    <Users className="mr-1 h-4 w-4" />
                    {batch.students}
                  </span>
                </div>
                <CardTitle className="mt-2 text-lg">{batch.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm font-medium text-gray-700">{batch.course}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>{batch.schedule}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/teacher/batch/${batch.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-[#006400] text-[#006400] hover:bg-[#006400] hover:text-white"
                  >
                    📂 View Batch
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
