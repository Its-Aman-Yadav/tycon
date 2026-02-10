"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader } from "lucide-react"

interface StudentInfo {
  studentId: string
  enrolledAt: string
  name: string
  email: string
}

// CSV export helper
const downloadCSV = (students: StudentInfo[]) => {
  const headers = ["Name", "Email", "Enrolled At"]
  const rows = students.map((s) => [
    s.name,
    s.email,
    new Date(s.enrolledAt).toLocaleString(),
  ])

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "enrolled_students.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function CourseDetailsPage() {
  const params = useParams()
  const courseId = params?.courseId as string

  const [course, setCourse] = useState<any>(null)
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        setError("Course ID is missing.")
        setLoading(false)
        return
      }

      try {
        // Fetch course
        const courseRef = doc(db, "courses", courseId)
        const courseSnap = await getDoc(courseRef)

        if (!courseSnap.exists()) {
          setError("Course not found.")
          setLoading(false)
          return
        }

        const courseData = courseSnap.data()
        setCourse(courseData)

        // Fetch enrollments
        const enrollmentsQuery = query(
          collection(db, "course_enrollments"),
          where("courseId", "==", courseId)
        )
        const enrollmentsSnap = await getDocs(enrollmentsQuery)

        const studentEntries: StudentInfo[] = []

        for (const docSnap of enrollmentsSnap.docs) {
          const enrollment = docSnap.data()
          const userRef = doc(db, "users", enrollment.studentId)
          const userSnap = await getDoc(userRef)
          const userData = userSnap.exists() ? userSnap.data() : {}

          studentEntries.push({
            studentId: enrollment.studentId,
            enrolledAt: enrollment.enrolledAt,
            name: userData?.name || "Unknown",
            email: userData?.email || "Not available",
          })
        }

        setStudents(studentEntries)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch course or student data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader className="animate-spin h-5 w-5" />
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-500 font-semibold">Error: {error}</div>
  }

  return (
    <div className="p-6 space-y-8">
      {/* Title & Description */}
      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-1">{course.description}</p>
      </div>

      {/* Grid: Video | Resources + Thumbnail */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Videos Section */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Videos</h2>
          {course.videos?.length > 0 ? (
            course.videos.map((url: string, index: number) => (
              <div key={index} className="rounded border overflow-hidden">
                <video controls src={url} className="w-full rounded" />
                <p className="text-sm text-gray-500 mt-1 ml-2">Video {index + 1}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No videos uploaded yet.</p>
          )}
        </div>

        {/* Resources + Thumbnail */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Resources</h2>
            {course.resources?.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {course.resources.map((url: string, index: number) => (
                  <li key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Resource {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No resources added.</p>
            )}
          </div>

          {course.thumbnail && (
            <div>
              <h3 className="font-semibold mb-2">Thumbnail</h3>
              <img
                src={course.thumbnail}
                alt="Course Thumbnail"
                className="w-full rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Enrolled Students ({students.length})</h2>
          {students.length > 0 && (
            <button
              onClick={() => downloadCSV(students)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Download CSV
            </button>
          )}
        </div>

        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr className="text-left">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Enrolled At</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 border">{student.name}</td>
                    <td className="px-4 py-2 border">{student.email}</td>
                    <td className="px-4 py-2 border">
                      {new Date(student.enrolledAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No students enrolled yet.</p>
        )}
      </div>
    </div>
  )
}
