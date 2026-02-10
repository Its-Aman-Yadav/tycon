"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().default(false),
})

export default function LoginPage() {
  const router = useRouter()
  const path = usePathname()
  const isStudent = path.includes("student")
  const isTeacher = path.includes("teacher")

  const { toast } = useToast()
  const { login, resetPassword } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onSubmit",
  })

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    setLoginError("")

    try {
      const result = await login(values.email, values.password)

      if (result?.status === "suspended") {
        const errorMsg = "Your account has been suspended. Please contact support for assistance."
        setLoginError(errorMsg)
        toast({ variant: "destructive", title: "Account Suspended", description: errorMsg })
        return
      }

      toast({ title: "Login successful", description: "Welcome back to Knowhive!" })
      router.push("/dashboard")
    } catch (error: any) {
      let errorMsg = "Please check your credentials and try again."
      if (error.code === "auth/user-not-found") errorMsg = "No account found with this email."
      else if (error.code === "auth/wrong-password") errorMsg = "Incorrect password. Please try again."
      else if (error.code === "auth/invalid-email") errorMsg = "Invalid email address."
      else if (error.code === "auth/too-many-requests") errorMsg = "Too many failed attempts. Try again later."

      setLoginError(errorMsg)
      toast({ variant: "destructive", title: "Login failed", description: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendResetLink = async () => {
    setResetSuccess("")
    setResetError("")
    setResetLoading(true)

    if (!resetEmail) {
      setResetError("Please enter your email.")
      setResetLoading(false)
      return
    }

    try {
      await resetPassword(resetEmail)
      setResetSuccess("Password reset link sent. Check your inbox.")
    } catch (error: any) {
      setResetError(error.code === "auth/user-not-found"
        ? "No user found with this email address."
        : "Failed to send reset link.")
    } finally {
      setResetLoading(false)
    }
  }

  const handleDialogClose = () => {
    setShowResetDialog(false)
    setResetEmail("")
    setResetError("")
    setResetSuccess("")
    setResetLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white px-8 py-6 shadow-md">
        {/* Role Switch */}
        <div className="flex justify-center gap-4">
          <Button
            variant={!isTeacher && !isStudent ? "default" : "outline"}
            onClick={() => router.push("/auth/login")}
          >
            Admin Login
          </Button>
          <Button
            variant={isStudent ? "default" : "outline"}
            onClick={() => router.push("/auth/login/student")}
          >
            Employee Login
          </Button>
          <Button
            variant={isTeacher ? "default" : "outline"}
            onClick={() => router.push("/auth/login/teacher")}
          >
            Instructor Login
          </Button>
        </div>

        {/* Logo + Brand */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-lg border border-gray-200 bg-white p-2">
            <img src="/prakhar.jpg" alt="Knowhive Logo" className="w-full h-full object-contain" />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-700 text-center leading-tight">
            Knowhive
            <br />
            AI powered Learning Management System
          </p>
        </div>

        {/* Title */}
        <div className="text-center mt-2">
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-muted-foreground"></p>
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

            {/* Remember + Forgot Password */}
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                    <label htmlFor="remember" className="text-sm font-medium leading-none">
                      Remember me
                    </label>
                  </div>
                )}
              />
              <div
                onClick={() => setShowResetDialog(true)}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
              >
                Forgot Password?
              </div>
            </div>

            {loginError && <p className="text-sm text-red-600 text-center">{loginError}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>

        {/* Signup Link */}
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address. We’ll send a password reset link.
            </DialogDescription>
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
            <Button onClick={handleSendResetLink} disabled={resetLoading}>
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
