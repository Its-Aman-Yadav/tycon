import type React from "react"
import { BookPlus, CalendarPlus, GraduationCap, UserPlus, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
}

const actions: (ActionButtonProps & { href?: string })[] = [
  {
    icon: <BookPlus className="h-5 w-5" />,
    label: "Create Course",
    href: "/dashboard/admin/courses/create",
  },
  {
    icon: <CalendarPlus className="h-5 w-5" />,
    label: "Create Batch",
    href: "/dashboard/admin/batches/create",
  },
  {
    icon: <UserPlus className="h-5 w-5" />,
    label: "Enroll Students",
    href: "/dashboard/admin/students/enroll",
  },
  {
    icon: <GraduationCap className="h-5 w-5" />,
    label: "Onboard Teacher",
    href: "/dashboard/admin/teachers/onboard",
  },
]

function ActionButton({ icon, label, href }: ActionButtonProps & { href?: string }) {
  return (
    <Button
      variant="outline"
      className="flex h-auto flex-col items-center gap-2 border-gray-200 p-4 text-gray-700 hover:border-[#006400] hover:bg-[#f5f9f5] hover:text-[#006400]"
      asChild={!!href}
    >
      {href ? (
        <a href={href}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0e6] text-[#006400]">
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </a>
      ) : (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f0e6] text-[#006400]">
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </>
      )}
    </Button>
  )
}

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
