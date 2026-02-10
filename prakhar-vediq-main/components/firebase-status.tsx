"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Check if Firebase Auth is initialized
        if (!auth) {
          throw new Error("Firebase Auth is not initialized")
        }

        // Check if Firestore is initialized
        if (!db) {
          throw new Error("Firestore is not initialized")
        }

        // If we get here, Firebase is properly initialized
        setStatus("success")
      } catch (error: any) {
        console.error("Firebase initialization error:", error)
        setStatus("error")
        setErrorMessage(error.message || "Unknown error")
      }
    }

    checkFirebase()
  }, [])

  if (status === "loading") {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checking Firebase configuration...</AlertTitle>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase configuration error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="default" className="mb-4 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>Firebase is properly configured</AlertTitle>
    </Alert>
  )
}
