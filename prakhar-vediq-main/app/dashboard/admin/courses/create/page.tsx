import { AdminLayout } from "@/components/layout/admin-layout"
import { CourseCreationForm } from "@/components/courses/course-creation-form"
import { PageHeader } from "@/components/common/page-header"

export default function CreateCoursePage() {
  return (
    <AdminLayout>
      <PageHeader
        title="Create New Course"
        description="Create a structured course with content, videos, and assignments"
      />

      <div className="mt-6">
        <CourseCreationForm />
      </div>
    </AdminLayout>
  )
}
