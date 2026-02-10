"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, FileText, Home, LogOut, Video } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard/teacher",
    icon: Home,
  },
  {
    title: "KPIs",
    href: "/dashboard/teacher/kpi",
    icon: Video,
  },
  {
    title: "My Batches",
    href: "/dashboard/teacher/batches",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    href: "/dashboard/teacher/assignments",
    icon: FileText,
  },
  {
    title: "Courses",
    href: "/dashboard/teacher/courses",
    icon: Video,
  },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [teacherName, setTeacherName] = useState("Teacher")
  const [teacherEmail, setTeacherEmail] = useState("")

  useEffect(() => {
    const userRaw = localStorage.getItem("user")
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw)
        if (user?.role === "teacher") {
          setTeacherName(user.name || "Teacher")
          setTeacherEmail(user.email || "")
        }
      } catch (e) {
        console.error("Invalid user object in localStorage")
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear() // Clears all keys from localStorage
    router.push("/auth/login/teacher")
  }

  return (
    <div className="hidden h-screen w-64 flex-col border-r bg-white md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard/teacher" className="flex items-center">
          <span className="text-lg font-semibold text-[#006400]">Teacher Portal</span>
        </Link>
      </div>

      {/* Teacher Info */}
      <div className="border-b p-4">
        <div className="flex items-center space-x-3">
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-[#006400]",
                pathname === item.href && "bg-green-50 font-medium text-[#006400]",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
