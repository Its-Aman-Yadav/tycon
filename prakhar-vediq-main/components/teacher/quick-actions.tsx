import { FileUp, HelpCircle, Users } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    icon: FileUp,
    title: "Create Course",
    description: "Add a new course",
    href: "/dashboard/teacher/courses/create",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Users,
    title: "View Batches",
    description: "View assigned batches",
    href: "/dashboard/teacher/batches",
    color: "bg-purple-100 text-purple-700",
  },
]

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex items-center space-x-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
          >
            <div className={`rounded-full p-2 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
