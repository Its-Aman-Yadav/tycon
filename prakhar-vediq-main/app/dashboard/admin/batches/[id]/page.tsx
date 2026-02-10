"use client"

import { useParams } from "next/navigation"
import { BatchDetails } from "@/components/batches/batch-details"

export default function BatchDetailsPage() {
  const params = useParams()
  const batchId = params.id as string

  return (
    <div className="container mx-auto py-8">
      <BatchDetails batchId={batchId} />
    </div>
  )
}
