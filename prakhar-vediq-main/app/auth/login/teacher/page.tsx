"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().default(false),
})

export default function TeacherLoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState("")
  const [resetError, setResetError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // 🔍 Validation toast on errors
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      const error = form.formState.errors[name as keyof typeof form.formState.errors]
      if (error) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.message,
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, toast])

  // ✅ Handle teacher login
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setLoginError("")

    try {
      const q = query(
        collection(db, "teachers"),
        where("email", "==", values.email),
        where("password", "==", values.password)
      )

      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setLoginError("Invalid email or password.")
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Email or password is incorrect.",
        })
        return
      }

      // ✅ Get teacher document
      const teacherDoc = snapshot.docs[0]
      const teacherData = teacherDoc.data()

      // ✅ Save info in localStorage safely before redirecting
      localStorage.setItem("teacherEmail", teacherData.email)
      localStorage.setItem("teacherId", teacherDoc.id)
      localStorage.setItem("teacherName", teacherData.fullName)

      // Debug: verify values are stored
      console.log("Saved in localStorage:", {
        id: localStorage.getItem("teacherId"),
        email: localStorage.getItem("teacherEmail"),
        name: localStorage.getItem("teacherName"),
      })

      toast({
        title: "Login Successful",
        description: `Welcome back, ${teacherData.fullName || "Teacher"}!`,
      })

      // ✅ Ensure redirect happens after storage completes
      setTimeout(() => {
        router.push("/dashboard/teacher")
      }, 200)
    } catch (err) {
      console.error("Login error:", err)
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Something went wrong. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset Password Dialog
  const handleDialogClose = () => {
    setShowResetDialog(false)
    setResetEmail("")
    setResetSuccess("")
    setResetError("")
    setResetLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white px-8 py-6 shadow-md">
        {/* Role Switcher */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/auth/login")}>
            Admin Login
          </Button>
          <Button variant="outline" onClick={() => router.push("/auth/login/student")}>
            Student Login
          </Button>
          <Button variant="default">Instructor Login</Button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-lg border border-gray-200 bg-white p-2">
            <img src="/prakhar.jpg" alt="Knowhive Logo" className="w-full h-full object-contain" />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-700 text-center leading-tight">
            Knowhive<br />AI powered Learning Management System
          </p>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Instructor Login</h1>
          <p className="text-sm text-muted-foreground">
            Access your dashboard and manage your classes
          </p>
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />


            {loginError && <p className="text-sm text-red-600 text-center">{loginError}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Enter your email to receive a reset link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {resetError && <p className="text-sm text-red-600">{resetError}</p>}
            {resetSuccess && <p className="text-sm text-green-600">{resetSuccess}</p>}
          </div>
          <DialogFooter>
            <Button disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
