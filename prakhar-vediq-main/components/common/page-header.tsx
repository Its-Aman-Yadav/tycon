import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  addNewHref?: string
  addNewText?: string
}

export function PageHeader({ title, addNewHref, addNewText = "Add New" }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      {addNewHref && (
        <Button asChild className="bg-[#006400] hover:bg-[#005000]">
          <Link href={addNewHref}>
            <Plus className="mr-2 h-4 w-4" /> {addNewText}
          </Link>
        </Button>
      )}
    </div>
  )
}
