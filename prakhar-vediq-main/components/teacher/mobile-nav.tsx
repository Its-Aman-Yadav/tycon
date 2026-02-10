"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, FileText, Home, LogOut, Menu, Video, X } from "lucide-react"
import { signOut } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard/teacher",
    icon: Home,
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [teacherName, setTeacherName] = useState("")
  const [teacherEmail, setTeacherEmail] = useState("")

  useEffect(() => {
    // Get current user from Firebase
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTeacherName(user.displayName || "Teacher")
        setTeacherEmail(user.email || "")
      } else {
        // If no user is logged in, redirect to login
        console.log("No user logged in, redirecting to login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = () => {
    localStorage.clear() // Clears all keys from localStorage
    router.push("/auth/login/teacher")
  }


  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" className="mr-2" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard/teacher" className="flex items-center" onClick={() => setOpen(false)}>
              <span className="text-lg font-semibold text-[#006400]">Teacher Portal</span>
            </Link>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
          <div className="border-t p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
