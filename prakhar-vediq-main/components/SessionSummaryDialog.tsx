"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: any
}

export function SessionSummaryDialog({ open, onOpenChange, session }: Props) {
  const [recordingUrl, setRecordingUrl] = useState(session.recordingUrl || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const sessionRef = doc(db, "sessions", session.id)
      await updateDoc(sessionRef, {
        recordingUrl,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save recording URL:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm">
            <strong>Students Joined:</strong> {session.joinedStudents?.length || 0}
          </p>

          <div className="space-y-1">
            <label className="text-sm font-medium">Recorded Video URL</label>
            <Input
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://yourdomain.com/recorded-session.mp4"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
