"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { PageHeader } from "@/components/common/page-header"
import { BatchesList } from "@/components/batches/batches-list"

export default function BatchesPage() {
  const filterOptions = [
    { value: "all", label: "All Batches" },
    { value: "active", label: "Active" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ]

  return (
    <AdminLayout>
      <PageHeader title="All Batches" addNewHref="/dashboard/admin/batches/create" addNewText="Add Batch" />
      <BatchesList />
    </AdminLayout>
  )
}
