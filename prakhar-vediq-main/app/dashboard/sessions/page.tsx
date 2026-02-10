"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"
import { useAuth } from "@/lib/auth-provider"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { SessionCard } from "@/components/session-card"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { CreateSessionDialog } from "@/components/create-session-dialog"

export default function SessionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      fetchSessions()
    }
  }, [user, loading, router])

  const fetchSessions = async () => {
    setIsLoading(true)
    try {
      let sessionsQuery

      if (user?.role === "teacher") {
        // Fetch sessions created by this teacher
        sessionsQuery = query(collection(db, "sessions"), where("teacherId", "==", user.id))
      } else {
        // For students, fetch sessions for courses they're enrolled in
        // This is simplified - in a real app, you'd query based on enrollment
        sessionsQuery = collection(db, "sessions")
      }

      const querySnapshot = await getDocs(sessionsQuery)
      const sessionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setSessions(sessionsData)
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSession = async (sessionData: any) => {
    try {
      // Create a new session in Firestore
      await addDoc(collection(db, "sessions"), {
        ...sessionData,
        teacherId: user?.id,
        teacherName: user?.name,
        createdAt: new Date().toISOString(),
      })

      // Refresh the sessions list
      fetchSessions()

      return true
    } catch (error) {
      console.error("Error creating session:", error)
      return false
    }
  }

  if (loading || !user) {
    return <div className="container py-10">Loading...</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Live Sessions"
        text={user.role === "teacher" ? "Schedule and manage your live sessions" : "Join scheduled live sessions"}
      >
        {user.role === "teacher" && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
        )}
      </DashboardHeader>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[220px] rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="h-5 w-1/2 rounded-md bg-muted mb-4"></div>
              <div className="h-20 w-full rounded-md bg-muted mb-4"></div>
              <div className="h-5 w-1/3 rounded-md bg-muted"></div>
            </div>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} isTeacher={user.role === "teacher"} />
          ))}
        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="video" />
          <EmptyPlaceholder.Title>
            {user.role === "teacher" ? "No sessions scheduled" : "No sessions available"}
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            {user.role === "teacher"
              ? "You haven't scheduled any live sessions yet."
              : "There are no live sessions scheduled at the moment."}
          </EmptyPlaceholder.Description>
          {user.role === "teacher" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          )}
        </EmptyPlaceholder>
      )}

      {user.role === "teacher" && (
        <CreateSessionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onCreateSession={handleCreateSession} />
      )}
    </DashboardShell>
  )
}
