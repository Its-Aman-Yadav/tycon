"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const assignmentsToGrade = [
  {
    id: "a1",
    title: "Cellular Respiration Quiz",
    course: "Biology",
    batch: "NEET 2025 - Batch A",
    pendingCount: 12,
    dueDate: "Today",
    priority: "high",
  },
  {
    id: "a2",
    title: "Periodic Table Assignment",
    course: "Chemistry",
    batch: "CBSE 12th - Batch B",
    pendingCount: 8,
    dueDate: "Tomorrow",
    priority: "medium",
  },
  {
    id: "a3",
    title: "Newton's Laws Practice Problems",
    course: "Physics",
    batch: "JEE Advanced - Batch C",
    pendingCount: 5,
    dueDate: "In 2 days",
    priority: "low",
  },
]

export default function GradingTodo() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <section className="relative opacity-60 pointer-events-none">
      {/* Coming Soon Badge */}
      <div className="absolute right-0 top-0 z-10">
        <Badge className="bg-[#006400] text-white text-xs font-medium">Coming Soon</Badge>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-700">📝 Assignment Grading</h2>
        <Button variant="ghost" size="sm" disabled>
          See All
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignmentsToGrade.map((assignment) => (
          <Card key={assignment.id} className="h-full bg-gray-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    assignment.priority === "high"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : assignment.priority === "medium"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  Due {assignment.dueDate}
                </Badge>
                <Badge className="bg-[#006400] text-white">{assignment.pendingCount} Pending</Badge>
              </div>
              <CardTitle className="mt-2 text-base text-gray-700">{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500">
                {assignment.course} • {assignment.batch}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full border-[#006400] text-[#006400]"
                disabled
              >
                Grade Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
