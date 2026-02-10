"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { BookOpen, Video, Users, LogOut, Plus, ChevronRight } from "lucide-react"

interface TeacherDashboardProps {
  user: any
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const router = useRouter()
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalSessions: 0,
    totalStudents: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch recent courses
        const coursesQuery = query(collection(db, "courses"), where("teacherId", "==", user.id), limit(3))
        const coursesSnapshot = await getDocs(coursesQuery)
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentCourses(coursesData)

        // Fetch upcoming sessions
        const now = new Date().toISOString()
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("teacherId", "==", user.id),
          where("startTime", ">=", now),
          limit(3),
        )
        const sessionsSnapshot = await getDocs(sessionsQuery)
        const sessionsData = sessionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUpcomingSessions(sessionsData)

        // Get stats
        setStats({
          totalCourses: coursesSnapshot.size,
          totalSessions: sessionsSnapshot.size,
          totalStudents: 0, // This would require a more complex query in a real app
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user.id])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary text-xl">Knowhive</span>
            {/* <span className="text-muted-foreground">Platform</span> */}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="flex flex-col space-y-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/courses">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Courses
                </Button>
              </Link>
              <Link href="/dashboard/sessions">
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="mr-2 h-4 w-4" />
                  Live Sessions
                </Button>
              </Link>
              <Link href="/dashboard/students">
                <Button variant="ghost" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Students
                </Button>
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <DashboardShell>
            <DashboardHeader heading={`Welcome back, ${user.name}`} text="Manage your courses and sessions" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalCourses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalSessions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalStudents}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Recent Courses</CardTitle>
                  <Link href="/dashboard/courses">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View all <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 rounded-md border p-4">
                          <div className="h-4 w-1/2 rounded-md bg-muted"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentCourses.length > 0 ? (
                    <div className="space-y-2">
                      {recentCourses.map((course) => (
                        <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
                          <div className="rounded-md border p-4 transition-colors hover:bg-muted">
                            <h3 className="font-medium">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {course.isPublished ? "Published" : "Draft"}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                      <p className="text-sm text-muted-foreground">No courses created yet</p>
                      <Link href="/dashboard/courses/create">
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Course
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <Link href="/dashboard/sessions">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View all <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 rounded-md border p-4">
                          <div className="h-4 w-1/2 rounded-md bg-muted"></div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingSessions.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingSessions.map((session) => (
                        <Link key={session.id} href={`/dashboard/sessions/${session.id}`}>
                          <div className="rounded-md border p-4 transition-colors hover:bg-muted">
                            <h3 className="font-medium">{session.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.startTime).toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                      <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                      <Link href="/dashboard/sessions">
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Schedule Session
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </DashboardShell>
        </main>
      </div>
    </div>
  )
}
