"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import app from "@/lib/firebase"

interface User {
  uid: string
  fullName: string
  email: string
  role: string
  profilePictureURL?: string
  bio?: string
  createdAt: string
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [profilePictureURL, setProfilePictureURL] = useState("")

  useEffect(() => {
    async function fetchUser() {
      try {
        const db = getFirestore(app)
        const userDoc = doc(db, "users", params.id)
        const userSnapshot = await getDoc(userDoc)

        if (!userSnapshot.exists()) {
          setError("User not found")
          setLoading(false)
          return
        }

        const userData = {
          uid: userSnapshot.id,
          ...userSnapshot.data(),
        } as User

        setUser(userData)

        // Initialize form fields
        setFullName(userData.fullName || "")
        setEmail(userData.email || "")
        setBio(userData.bio || "")
        setProfilePictureURL(userData.profilePictureURL || "")

        setLoading(false)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user details. Please try again later.")
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)

  try {
    const db = getFirestore(app)
    const userRef = doc(db, "users", params.id)

    // Fetch current user data before update
    const currentData = (await getDoc(userRef)).data()

    // Detect password change
    const isPasswordChanged = currentData?.password && currentData.password !== (user as any)?.password

    // Update Firestore document
    await updateDoc(userRef, {
      fullName,
      email,
      bio,
      profilePictureURL,
      updatedAt: new Date().toISOString(),
    })

    toast({
      title: "Success",
      description: "User information updated successfully",
    })

    // If password changed, send notification email
    if (isPasswordChanged) {
      await fetch("/api/send-password-change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          name: fullName,
        }),
      })
      console.log("Password change email sent")
    }

    // Redirect back
    router.push(`/users/${params.id}`)
  } catch (err) {
    console.error("Error updating user:", err)
    toast({
      title: "Error",
      description: "Failed to update user information",
      variant: "destructive",
    })
    setSaving(false)
  }
}


  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#006400]" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to users</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error || "User not found"}</p>
            <Button className="mt-4" asChild>
              <Link href="/users">Back to Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format the creation date
  const createdDate = new Date(user.createdAt)
  const formattedCreatedDate = createdDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/users/${user.uid}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to user</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit User</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={profilePictureURL || "/placeholder.svg?height=64&width=64&query=user profile"}
                    alt={user.fullName}
                  />
                  <AvatarFallback>
                    {user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.fullName}</CardTitle>
                  <p className="text-sm text-gray-500">ID: {user.uid}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePictureURL">Profile Picture URL</Label>
                    <Input
                      id="profilePictureURL"
                      value={profilePictureURL}
                      onChange={(e) => setProfilePictureURL(e.target.value)}
                      placeholder="https://example.com/profile.jpg"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={5}
                      placeholder="User's biography"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Role:</span>
                    <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Joined:</span>
                    <span className="font-medium">{formattedCreatedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage
                      src={profilePictureURL || "/placeholder.svg?height=80&width=80&query=user profile"}
                      alt={fullName}
                    />
                    <AvatarFallback className="text-lg">
                      {fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium">{fullName}</h3>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/users/${user.uid}`}>Cancel</Link>
          </Button>

          <Button type="submit" className="bg-[#006400] hover:bg-[#005000]" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
