"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function FirebaseConfigTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [envVars, setEnvVars] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check if all required Firebase environment variables are set
    const requiredVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const vars: Record<string, boolean> = {}
    const missingVars: string[] = []

    requiredVars.forEach((varName) => {
      const isSet = !!process.env[varName]
      vars[varName] = isSet
      if (!isSet) missingVars.push(varName)
    })

    setEnvVars(vars)

    if (missingVars.length > 0) {
      setStatus("error")
      setMessage(`Missing required environment variables: ${missingVars.join(", ")}`)
    } else {
      setStatus("success")
      setMessage("All required Firebase environment variables are set")
    }
  }, [])

  if (status === "loading") {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checking Firebase configuration...</AlertTitle>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Configuration Error</AlertTitle>
        <AlertDescription>
          {message}
          <div className="mt-2">
            <h4 className="font-semibold">Environment Variables Status:</h4>
            <ul className="mt-1 space-y-1 text-sm">
              {Object.entries(envVars).map(([varName, isSet]) => (
                <li key={varName} className={isSet ? "text-green-600" : "text-red-600"}>
                  {varName}: {isSet ? "✓" : "✗"}
                </li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Firebase Configuration OK</AlertTitle>
      <AlertDescription className="text-green-700">
        All required Firebase environment variables are set.
      </AlertDescription>
    </Alert>
  )
}
