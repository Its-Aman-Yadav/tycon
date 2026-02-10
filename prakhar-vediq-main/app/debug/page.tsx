"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FirebaseConfigTest } from "@/components/firebase-config-test"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const [firebaseConfig, setFirebaseConfig] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get Firebase config from environment variables (masked for security)
    const config: Record<string, string> = {}

    const vars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
      "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    ]

    vars.forEach((varName) => {
      const value = process.env[varName] || ""
      // Mask the value for security
      if (value) {
        config[varName] = value.length > 6 ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}` : "***"
      } else {
        config[varName] = "Not set"
      }
    })

    setFirebaseConfig(config)
  }, [])

  const handleTestFirebase = () => {
    try {
      // Import Firebase dynamically to test initialization
      import("@/lib/firebase")
        .then((firebase) => {
          console.log("Firebase initialized successfully:", !!firebase.auth)
          alert("Firebase initialized successfully! Check console for details.")
        })
        .catch((error) => {
          console.error("Firebase initialization error:", error)
          alert(`Firebase initialization failed: ${error.message}`)
        })
    } catch (error: any) {
      console.error("Error testing Firebase:", error)
      alert(`Error testing Firebase: ${error.message}`)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Firebase Debug Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Configuration Status</CardTitle>
            <CardDescription>Check if all required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseConfigTest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firebase Environment Variables</CardTitle>
            <CardDescription>Current environment variable values (masked for security)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(firebaseConfig).map(([key, value]) => (
                <div key={key} className="border p-3 rounded-md">
                  <div className="font-medium">{key}</div>
                  <div className={value === "Not set" ? "text-red-500" : "text-green-600 font-mono"}>{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Firebase Initialization</CardTitle>
            <CardDescription>Test if Firebase can be initialized with the current configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestFirebase}>Test Firebase Initialization</Button>
            <p className="mt-2 text-sm text-muted-foreground">
              This will attempt to initialize Firebase and log the result to the console.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Make sure all Firebase environment variables are correctly set in your .env.local file</li>
              <li>Verify that your Firebase project has Authentication enabled in the Firebase Console</li>
              <li>Check that Email/Password authentication is enabled in the Firebase Console</li>
              <li>Make sure your Firebase API key is not restricted to specific domains</li>
              <li>Try clearing your browser cache and cookies</li>
              <li>Restart your development server after making changes to environment variables</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
