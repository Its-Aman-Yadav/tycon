"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { PageHeader } from "@/components/common/page-header"
import { StudentsList } from "@/components/students/students-list"

export default function StudentsPage() {
  const filterOptions = [
    { value: "all", label: "All Students" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]

  return (
    <AdminLayout>
      <PageHeader title="All Students" addNewHref="/dashboard/admin/students/enroll" addNewText="Add Employee" />
      <StudentsList />
    </AdminLayout>
  )
}
