"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        login: "Login",
        loginDesc: "Welcome back! Please login to your account.",
        email: "Email",
        enterEmail: "your@email.com",
        password: "Password",
        enterPassword: "••••••••",
        loginBtn: "Login",
        loading: "Loading...",
        msgFillFields: "Please fill in all fields.",
        msgFail: "Login failed. Please try again.",
        msgIncorrect: "Incorrect email or password.",
        msgNotFound: "User not found.",
        msgTooMany: "Too many attempts. Please try again later.",
        msgGoogleFail: "Google sign-in failed.",
        newToNoor: "New to Noor?",
        newToNoorDesc: "Join our platform and start your journey today.",
        register: "Register",
        forgotPassword: "Forgot password?",
        shortforgotPassword: "Forgot?",
        showPassword: "Show Password",
        hidePassword: "Hide Password",
        signInWithGoogle: "Sign in with Google",
        "don'tHaveAccount": "Don't have an account?",
        msgGoogleSuccess: "Google login successful!"
    },
    ar: {
        login: "تسجيل الدخول",
        loginDesc: "مرحباً بعودتك! يرجى تسجيل الدخول إلى حسابك.",
        email: "البريد الإلكتروني",
        enterEmail: "your@email.com",
        password: "كلمة المرور",
        enterPassword: "••••••••",
        loginBtn: "تسجيل الدخول",
        loading: "جاري التحميل...",
        msgFillFields: "يرجى ملء جميع الحقول.",
        msgFail: "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        msgIncorrect: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        msgNotFound: "المستخدم غير موجود.",
        msgTooMany: "محاولات كثيرة جداً. يرجى المحاولة مرة أخرى لاحقاً.",
        msgGoogleFail: "فشل تسجيل الدخول عبر جوجل.",
        newToNoor: "جديد في نور؟",
        newToNoorDesc: "انضم إلى منصتنا وابدأ رحلتك اليوم.",
        register: "سجل الآن",
        forgotPassword: "نسيت كلمة المرور؟",
        shortforgotPassword: "نسيت؟",
        showPassword: "إظهار كلمة المرور",
        hidePassword: "إخفاء كلمة المرور",
        signInWithGoogle: "تسجيل الدخول عبر جوجل",
        "don'tHaveAccount": "ليس لديك حساب؟",
        msgGoogleSuccess: "تم تسجيل الدخول عبر جوجل بنجاح!"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("language") as Language;
        if (saved && (saved === "en" || saved === "ar")) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = lang;
    };

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations["en"]] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
