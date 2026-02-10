import { StudentEnrollmentForm } from "@/components/students/student-enrollment-form"

export default function EnrollStudentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Enroll New Student</h1>
          <p className="text-gray-500">Add a new student to the system and enroll them in courses</p>
        </div>

        <StudentEnrollmentForm />
      </main>
    </div>
  )
}
