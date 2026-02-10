"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} currentPath={pathname} />
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  )
}
