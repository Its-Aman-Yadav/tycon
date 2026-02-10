"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Book, FileText, Video, Search, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase" // Assuming you have a firebase config file

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768
      setIsMobile(isSmall)
      if (isSmall) setCollapsed(true)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => !prev)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.clear() // Clears all keys from localStorage
      router.push("/") // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard/student", icon: Home },
    { name: "My Courses", href: "/dashboard/student/courses", icon: Book },
    { name: "Assignments", href: "/dashboard/student/assignments", icon: FileText },
    { name: "Live Classes", href: "/dashboard/student/liveclasses", icon: Video },
    { name: "Explore Courses", href: "/dashboard/student/explore", icon: Search },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/dashboard/student") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {isMobile && isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
          collapsed ? "w-16" : "w-64",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            {collapsed ? (
              <span className="font-bold text-lg text-[#006400]">K</span>
            ) : (
              <span className="font-bold text-xl text-[#006400]">Knowhive</span>
            )}
          </div>
          {!collapsed && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleSidebar}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 flex flex-col gap-1">
          <TooltipProvider delayDuration={0}>
            {navigationItems.map((item) => {
              const isActive = isActiveLink(item.href)

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 px-3",
                          isActive
                            ? "bg-[#006400]/10 text-[#006400] font-medium hover:bg-[#006400]/20"
                            : "hover:bg-gray-100",
                          collapsed ? "h-10 px-0 justify-center" : "h-10",
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", isActive ? "text-[#006400]" : "text-gray-500")} />
                        {!collapsed && <span>{item.name}</span>}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>

        {/* Spacer to push logo and logout to bottom */}
        <div className="mt-auto" />

        {/* Logo Section - Above Logout */}
        <div className="px-4 py-3 border-t flex justify-center items-center">
          {collapsed ? (
            <div className="h-8 w-8 flex items-center justify-center bg-[#006400] text-white rounded font-bold">K</div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <span className="font-bold text-[#006400]">Knowhive</span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-2 border-t">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={cn(
                    "w-full justify-start gap-3 px-3",
                    "hover:bg-red-100 hover:text-red-600",
                    collapsed ? "h-10 px-0 justify-center" : "h-10",
                  )}
                >
                  <LogOut className="h-5 w-5 text-gray-500 hover:text-red-600" />
                  {!collapsed && <span>Logout</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Expand button */}
        {collapsed && (
          <div className="pb-3 flex justify-center">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={toggleSidebar}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile toggle */}
      {isMobile && !isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-30 h-10 w-10 rounded-full border border-gray-200 bg-white shadow-md"
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </>
  )
}
