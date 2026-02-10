"use client"

import { useParams } from "next/navigation"
import BatchDetails from "@/components/teacher/batch-details"

export default function BatchPage() {
  const params = useParams()
  const batchId = params.id as string

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Batch Details</h1>
      <BatchDetails batchId={batchId} />
    </div>
  )
}
