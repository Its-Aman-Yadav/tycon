"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export type UserRole = "student" | "teacher"

export interface UserData {
  uid: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

interface AuthContextType {
  user: UserData | null
  userData: UserData | null
  loading: boolean
  logOut: () => Promise<void>
  login: (email: string, password: string) => Promise<UserData>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<UserData>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logOut: async () => { },
  login: async () => {
    throw new Error("Not implemented")
  },
  register: async () => {
    throw new Error("Not implemented")
  },
  resetPassword: async () => {
    throw new Error("Not implemented")
  },
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData
          setUser(data)
          setUserData(data)
          localStorage.setItem("user", JSON.stringify(data))
        }
      } else {
        setUser(null)
        setUserData(null)
        localStorage.removeItem("user")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) throw new Error("User data not found in Firestore")

      const userData = docSnap.data() as UserData
      setUser(userData)
      setUserData(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return userData
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateProfile(user, { displayName: name })

      const userData: UserData = {
        uid: user.uid,
        name,
        email: user.email || "",
        role,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", user.uid), userData)

      setUser(userData)
      setUserData(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return userData
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserData(null)
      localStorage.removeItem("user")
      router.push("/")
    } catch (error: any) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userData,
    loading,
    logOut,
    login,
    register,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
