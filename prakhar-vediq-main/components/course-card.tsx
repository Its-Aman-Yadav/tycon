import Link from "next/link"
import { useState } from "react"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface CourseCardProps {
  course: any
  isTeacher?: boolean
  onDelete?: () => void
}

export function CourseCard({ course, isTeacher, onDelete }: CourseCardProps) {
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this course?")
    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteDoc(doc(db, "courses", course.id))
      toast({
        title: "Course deleted",
        description: `${course.title} has been removed.`,
      })
      if (onDelete) onDelete() // Notify parent to refetch or update UI
    } catch (error) {
      console.error("Delete failed:", error)
      toast({
        title: "Error",
        description: "Failed to delete course. Try again later.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          Level: {course.level} | Duration: {course.duration} Weeks
        </div>
      </CardContent>

      {isTeacher && (
        <CardFooter className="flex justify-center gap-4">
          <Link href={`/dashboard/teacher/courses/${course.id}`}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Manage
            </Button>
          </Link>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
