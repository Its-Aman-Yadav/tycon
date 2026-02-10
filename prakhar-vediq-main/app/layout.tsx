import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { Analytics } from '@vercel/analytics/react' // ✅ Added

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Knowhive - Learning Management System",
  description: "A modern learning management system",
  icons: {
    icon: "/prakhar.jpg",
  },
  generator: '',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster />
            <Analytics /> {/* ✅ Added */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
