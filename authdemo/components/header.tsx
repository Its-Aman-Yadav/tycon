"use client"

import { useLanguage } from "@/lib/LanguageContext"
import { Button } from "./ui/button"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Globe, LogOut } from "lucide-react"

export default function HeaderComponent({ chatboxmenu = false }: { chatboxmenu?: boolean }) {
    const { language, setLanguage, t } = useLanguage()
    const router = useRouter()

    const handleLogout = async () => {
        await signOut(auth)
        router.push("/")
    }

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "ar" : "en")
    }

    return (
        <header className="flex items-center justify-between w-full py-4 px-6 border-b border-border bg-white sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <img src="/logo-noor.png" alt="Noor Logo" className="h-8 w-auto" />
                <span className="text-xl font-bold text-primary">Noor AI</span>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{language === "en" ? "العربية" : "English"}</span>
                </Button>

                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
                </Button>
            </div>
        </header>
    )
}
