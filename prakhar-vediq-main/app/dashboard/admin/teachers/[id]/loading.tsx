import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TeacherProfileLoading() {
  return (
    <div className="p-6">
      <Button variant="outline" disabled className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers
      </Button>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-md" />
          ))}
        </div>

        <Skeleton className="h-[400px] rounded-md" />
      </div>
    </div>
  )
}
