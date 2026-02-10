"use client"
import type { ReactNode } from "react"
import { StudentSidebar } from "@/components/students/student-sidebar"
import { usePathname } from "next/navigation"

interface StudentLayoutProps {
  children: ReactNode
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname()
  const isCoursePage = pathname?.includes("/courses/") && pathname?.split("/").length > 4

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isCoursePage && <StudentSidebar />}
      <main
        className={`flex-1 transition-all duration-300 p-4 md:p-6 ${!isCoursePage ? "md:ml-16 lg:ml-64" : ""
          }`}
      >
        {children}
      </main>
    </div>
  )
}
