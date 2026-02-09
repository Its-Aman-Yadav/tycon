"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

export default function Onboarding() {
    const [user, loading] = useAuthState(auth)
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/")
            return
        }

        if (user) {
            const completeProfile = async () => {
                const ref = doc(db, "users", user.uid)
                await updateDoc(ref, {
                    completedProfile: true,
                    updatedAt: serverTimestamp(),
                })
                router.replace("/student/dashboard")
            }
            completeProfile()
        }
    }, [user, loading, router])

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <img src="/noor-smile.png" alt="Noor" className="w-16 h-16 mb-4" />
                <p>Setting up your profile...</p>
            </div>
        </div>
    )
}
