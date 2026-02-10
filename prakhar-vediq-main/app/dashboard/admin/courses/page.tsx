"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { PageHeader } from "@/components/common/page-header"
import { SearchFilter } from "@/components/common/search-filter"
import { CoursesList } from "@/components/courses/courses-list"

export default function CoursesPage() {
  const filterOptions = [
    { value: "all", label: "All Courses" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "live", label: "Live Classes" },
    { value: "recorded", label: "Recorded" },
  ]

  return (
    <AdminLayout>
      <PageHeader title="All Courses" addNewHref="/dashboard/admin/courses/create" addNewText="Add Course" />
      <CoursesList />
    </AdminLayout>
  )
}
