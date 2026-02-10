"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore"
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

export default function RoleBasedLoginPage() {
    const router = useRouter()
    const path = usePathname()
    const { toast } = useToast()

    const role = path.includes("teacher") ? "teachers" : "students"

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
            const q = query(
                collection(db, role),
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
            } else {
                toast({
                    title: "Login Successful",
                    description: `Welcome back to Knowhive, ${role === "teachers" ? "Teacher" : "Student"}!`,
                })
                if (pathname.includes("student")) {
                    localStorage.setItem("studentEmail", values.email) // <- Save email for session
                    router.push("/dashboard/student")
                }
                else if (pathname.includes("teacher")) {
                    router.push("/dashboard/teacher")
                }

            }
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Login Error",
                description: "Something went wrong. Please try again later.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDialogClose = () => {
        setShowResetDialog(false)
        setResetEmail("")
        setResetSuccess("")
        setResetError("")
        setResetLoading(false)
    }
    const pathname = usePathname()
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">

            <div className="w-full max-w-md space-y-6 rounded-xl bg-white px-8 py-6 shadow-md">
                {/* Role Switcher */}
                <div className="flex justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/auth/login")}
                    >
                        Admin Login
                    </Button>
                    <Button
                        variant={role === "students" ? "default" : "outline"}
                        onClick={() => router.push("/auth/login/student")}
                    >
                        Employee Login
                    </Button>
                    <Button
                        variant={role === "teachers" ? "default" : "outline"}
                        onClick={() => router.push("/auth/login/teacher")}
                    >
                        Instructor Login
                    </Button>
                </div>

                {/* Logo + App Info */}
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

                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900">Employee Login</h1>
                    <p className="text-sm text-muted-foreground">
                        {role === "teachers" ? "Instrcutor login to manage your classes" : "Employee login to start learning"}
                    </p>
                </div>

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
