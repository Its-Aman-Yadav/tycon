"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { PageHeader } from "@/components/common/page-header"
import { TeachersList } from "@/components/teachers/teachers-list"

export default function TeachersPage() {
  const filterOptions = [
    { value: "all", label: "All Teachers" },
    { value: "full-time", label: "Full-time" },
    { value: "guest", label: "Guest" },
    { value: "external", label: "External" },
  ]

  return (
    <AdminLayout>
      <PageHeader title="All Teachers" addNewHref="/dashboard/admin/teachers/onboard" addNewText="Add Instructor" />
      <TeachersList />
    </AdminLayout>
  )
}
