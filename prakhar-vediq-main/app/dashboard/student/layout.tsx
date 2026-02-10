import type React from "react"
import { StudentLayout } from "@/components/layout/student-layout"

export default function StudentRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StudentLayout>{children}</StudentLayout>
}
