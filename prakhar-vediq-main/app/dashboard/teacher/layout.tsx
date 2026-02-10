import type { ReactNode } from "react"
import { TeacherLayout } from "@/components/teacher/layout"

interface TeacherRootLayoutProps {
  children: ReactNode
}

export default function TeacherRootLayout({ children }: TeacherRootLayoutProps) {
  return <TeacherLayout>{children}</TeacherLayout>
}
