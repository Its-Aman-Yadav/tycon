"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { PageHeader } from "@/components/common/page-header"
import { StudentsList } from "@/components/students/students-list"

export default function StudentsPage() {
  const filterOptions = [
    { value: "all", label: "All Employees" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]

  return (
    <AdminLayout>
      <PageHeader title="All Employees" addNewHref="/dashboard/admin/students/enroll" addNewText="Add Employee" />
      <StudentsList />
    </AdminLayout>
  )
}
