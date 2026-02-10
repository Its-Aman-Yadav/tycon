"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react"

import { signOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AdminSidebarProps {
  collapsed: boolean
  toggleSidebar: () => void
  currentPath: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface UserData {
  username: string
  email: string
  avatarUrl?: string
}

export function AdminSidebar({ collapsed, toggleSidebar, currentPath }: AdminSidebarProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, "users", currentUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserData({
            username: data.name || "Admin User",
            email: data.email || "admin@example.com",
            avatarUrl: data.avatarUrl || "",
          })
        } else {
          setError("User not found")
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navItems: NavItem[] = [
    { title: "KPI Analysis", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Trainers", href: "/dashboard/admin/teachers", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Employees", href: "/dashboard/admin/students", icon: <Users className="h-5 w-5" /> },
    { title: "Courses", href: "/dashboard/admin/courses", icon: <BookOpen className="h-5 w-5" /> },
    { title: "Batches", href: "/dashboard/admin/batches", icon: <Calendar className="h-5 w-5" /> },
  ]

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)

  // Function to determine if an item should be active
  const isItemActive = (itemHref: string) => {
    // For the dashboard item
    if (itemHref === "/dashboard") {
      // Only active when exactly on /dashboard or /dashboard/admin
      return (
        currentPath === "/dashboard" ||
        currentPath === "/dashboard/" ||
        currentPath === "/dashboard/admin" ||
        currentPath === "/dashboard/admin/"
      )
    }

    // For other items, they're active only when their exact path matches
    return currentPath === itemHref || currentPath === `${itemHref}/`
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-20 h-full bg-white shadow-md transition-all duration-300 ${collapsed ? "w-16" : "w-64"
        }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && <div className="text-lg font-semibold text-[#006400]">Knowhive</div>}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${collapsed ? "ml-auto mr-auto" : "ml-auto"}`}
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            )}
          </Button>
        </div>

        {/* User Info */}
        <div className={`flex items-center border-b px-4 py-4 ${collapsed ? "justify-center" : "gap-3"}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={userData?.avatarUrl || "/admin-interface.png"} alt="Admin" />
            <AvatarFallback>{userData ? getInitials(userData.username) : "AD"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : error ? (
                <span className="text-sm text-red-500">⚠ {error}</span>
              ) : (
                <>
                  <span className="text-sm font-medium">{userData?.username}</span>
                  <span className="text-xs text-gray-500">
                    {userData?.email && userData.email.length > 25
                      ? `${userData.email.substring(0, 25)}...`
                      : userData?.email}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <TooltipProvider delayDuration={0}>
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = isItemActive(item.href)
                return (
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center rounded-md px-3 py-2 transition-colors ${isActive
                            ? "bg-[#e6f0e6] text-[#006400]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            } ${isActive && !collapsed ? "border-l-4 border-[#006400]" : ""}`}
                        >
                          <span className={`${collapsed ? "mx-auto" : "mr-3"}`}>{item.icon}</span>
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                    </Tooltip>
                  </li>
                )
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Logo */}
        <div className="px-4 py-3 border-t flex justify-center items-center">
          {collapsed ? (
            <img src="/prakhar.jpg" alt="" className="h-8 w-8" />
          ) : (
            <div className="flex flex-col items-center w-full">
              <img src="/prakhar.jpg" alt="" className="h-10" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={`mt-2 flex items-center rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${collapsed ? "w-full justify-center" : "w-full justify-start"
                    }`}
                >
                  <LogOut className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
                  {!collapsed && <span>Logout</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  )
}
