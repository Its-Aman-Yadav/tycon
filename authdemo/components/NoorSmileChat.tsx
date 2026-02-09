"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, Globe, BookOpen, Trash2, Paperclip, Mic } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import ReactMarkdown from "react-markdown"
import "katex/dist/katex.min.css"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { useLanguage } from "@/lib/LanguageContext"
import type { Language } from "@/lib/LanguageContext"
import { toast } from "react-hot-toast"


import {
    doc,
    getDoc,
    collection,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore"
import HeaderComponent from "./header"
import AITutorLottie from "@/components/AITutorLottie"

interface Message {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
}

interface ChatSession {
    id: string
    name: string
    messages: Message[]
    createdAt: Date
    subject?: string
}

interface Student {
    name: string
    email: string
    gradeLevel: string
    ageGroup: string
    role: string
    completedProfile: boolean
    curriculum?: string[]
    weakTopics?: string[]
}

interface NoorSmileChatProps {
    sessions: ChatSession[]
    currentSessionId: string | null
    onSessionsChange: (sessions: ChatSession[]) => void
    onCurrentSessionChange: (sessionId: string | null) => void
    showSessionList?: boolean
    onGenerateTitle?: (sessionId: string, message: string, subject: string) => Promise<void> // ← ADD THIS
}

const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "Arabic" },
    { code: "ar-fanar", name: "Arabic (Fanar)" },
]

const subjects = [
    { code: "general", name: "General" },
    { code: "maths", name: "Mathematics" },
    { code: "science", name: "Science" },
    { code: "arabic", name: "Arabic" },
]



const MessageRenderer = ({ content }: { content: string }) => {
    const isArabic = /[\u0600-\u06FF]/.test(content)
    return (
        <div
            className={`prose prose-sm max-w-none prose-slate ${isArabic ? "text-right" : "text-left"}`}
            dir={isArabic ? "rtl" : "ltr"}
        >
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: (props) => <p className="mb-3 last:mb-0 leading-relaxed text-sm">{props.children}</p>,
                    h1: (props) => <h1 className="text-lg font-semibold mb-3 text-foreground">{props.children}</h1>,
                    h2: (props) => <h2 className="text-base font-semibold mb-2 text-foreground">{props.children}</h2>,
                    h3: (props) => <h3 className="text-sm font-semibold mb-2 text-foreground">{props.children}</h3>,
                    ul: (props) => <ul className="list-disc list-inside mb-3 space-y-1">{props.children}</ul>,
                    ol: (props) => <ol className="list-decimal list-inside mb-3 space-y-1">{props.children}</ol>,
                    li: (props) => <li className="text-sm leading-relaxed">{props.children}</li>,
                    code: (props) => {
                        const { inline, children } = props as { inline?: boolean; children: React.ReactNode }
                        return inline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ) : (
                            <code className="block bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto mb-3">{children}</code>
                        )
                    },
                    blockquote: (props) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic mb-3 text-muted-foreground">
                            {props.children}
                        </blockquote>
                    ),
                    strong: (props) => <strong className="font-semibold text-foreground">{props.children}</strong>,
                    em: (props) => <em className="italic text-foreground">{props.children}</em>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}

export default function NoorSmileChat({
    sessions,
    currentSessionId,
    onSessionsChange,
    onCurrentSessionChange,
    showSessionList = false,
}: NoorSmileChatProps) {
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState("en")
    const [selectedSubject, setSelectedSubject] = useState("general")
    const [studentData, setStudentData] = useState<Student | null>(null)
    const [loadingStudent, setLoadingStudent] = useState(true)
    const [loadingSessions, setLoadingSessions] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [noorSessionIds, setNoorSessionIds] = useState<Record<string, string>>({})
    const [pendingFirstMessage, setPendingFirstMessage] = useState<string | null>(null) // State for smooth transition
    const { language, t, setLanguage } = useLanguage()
    const rtl = language === "ar"
    const [userMessageSent, setUserMessageSent] = useState(false)
    const lastMessageRef = useRef<HTMLDivElement>(null)


    const suggestionCards = language === "ar"
        ? [
            { title: "أرني كيف", subtitle: "أحسب مساحة مثلث بمثال" },
            { title: "هل يمكنك شرح", subtitle: "كيف تعمل الجاذبية ببساطة؟" },
            { title: "حل المعادلة", subtitle: "2x+5=11" },
            { title: "ساعدني على فهم", subtitle: "لماذا للقمر أطوار" },
        ]
        : [
            { title: "Show me how to", subtitle: "Calculate the area of a triangle with an example" },
            { title: "Can you explain", subtitle: "How gravity works in simple words?" },
            { title: "Solve the equation", subtitle: "2x+5=11" },
            { title: "Help me understand", subtitle: "Why the Moon has phases" },
        ]


    const [user, loading, error] = useAuthState(auth)

    const currentSession = sessions.find((s) => s.id === currentSessionId)

    useEffect(() => {
        requestAnimationFrame(() => {
            if (lastMessageRef.current) {
                lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
            }
        })
    }, [currentSession?.messages, pendingFirstMessage, isLoading])



    useEffect(() => {
        if (!user) {
            setLoadingSessions(false)
            return
        }

        const chatsQuery = query(
            collection(db, "studentchats"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
        )

        const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
            const loadedSessions: ChatSession[] = snapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    name: data.name,
                    messages: data.messages || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    subject: data.subject,
                }
            })

            onSessionsChange(loadedSessions)

            if (!currentSessionId && loadedSessions.length > 0) {
                onCurrentSessionChange(loadedSessions[0].id)
            }

            setLoadingSessions(false)
        })

        return () => unsubscribe()
    }, [user, onSessionsChange, onCurrentSessionChange, currentSessionId])

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user) {
                try {
                    const studentDoc = await getDoc(doc(db, "students", user.uid))
                    if (studentDoc.exists()) {
                        const data = studentDoc.data() as Student
                        setStudentData({
                            ...data,
                            curriculum: data.curriculum || [],
                            weakTopics: data.weakTopics || [],
                        })
                    }
                } catch (error) {
                    console.error("Error fetching student data:", error)
                } finally {
                    setLoadingStudent(false)
                }
            } else if (!loading) {
                setLoadingStudent(false)
            }
        }

        fetchStudentData()
    }, [user, loading])

    const generateSessionName = (firstMessage: string, subject: string): string => {
        const subjectName = subjects.find((s) => s.code === subject)?.name || "General"

        const message = firstMessage.toLowerCase()

        if (message.includes("equation") || message.includes("solve") || message.includes("calculate")) {
            return `${subjectName}: Problem Solving`
        } else if (message.includes("explain") || message.includes("what is") || message.includes("how does")) {
            return `${subjectName}: Explanation`
        } else if (message.includes("help") || message.includes("understand")) {
            return `${subjectName}: Learning Help`
        } else if (message.includes("homework") || message.includes("assignment")) {
            return `${subjectName}: Homework`
        } else {
            const words = firstMessage.split(" ").slice(0, 3).join(" ")
            return `${subjectName}: ${words}...`
        }
    }

    const createNewSession = async () => {
        if (!user) return

        try {
            const newSessionData = {
                name: `${subjects.find((s) => s.code === selectedSubject)?.name || "General"} Chat`,
                messages: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                subject: selectedSubject,
                userId: user.uid,
            }

            const docRef = await addDoc(collection(db, "studentchats"), newSessionData)

            // Update current session ID
            onCurrentSessionChange(docRef.id)

            setIsLoading(true)

            // Optionally clear Noor session state for this new session
            setNoorSessionIds((prev) => ({ ...prev, [docRef.id]: "" }))

            // Optional: clear input or reset UI
            setMessage("")
        } catch (error) {
            console.error("❌ Error creating new session:", error)
        }
    }



    const handleDeleteSession = async (sessionId: string, sessionName: string) => {
        if (deleteConfirmId === sessionId) {
            // Confirmed deletion
            if (!user) return

            try {
                await deleteDoc(doc(db, "studentchats", sessionId))

                if (currentSessionId === sessionId) {
                    const remainingSessions = sessions.filter((s) => s.id !== sessionId)
                    onCurrentSessionChange(remainingSessions.length > 0 ? remainingSessions[0].id : null)
                }
            } catch (error) {
                console.error("Error deleting session:", error)
            } finally {
                setDeleteConfirmId(null)
            }
        } else {
            // First click - show confirmation
            setDeleteConfirmId(sessionId)
        }
    }

    const sendMessage = async (content: string) => {
        if (!content.trim() || !currentSessionId || !user) return

        setPendingFirstMessage(null) // Clear pending message as we are now sending it

        const userMessage: Message = {
            id: Date.now().toString(),
            content: content.trim(),
            role: "user",
            timestamp: new Date(),
        }

        setUserMessageSent(true)


        const isFirstMessage = currentSession?.messages.length === 0
        let updatedSessionName = currentSession?.name

        // Optimistic UI update
        const updatedSessions = sessions.map((session) =>
            session.id === currentSessionId
                ? {
                    ...session,
                    messages: [...session.messages, userMessage],
                    name: session.name,
                }
                : session,
        )
        onSessionsChange(updatedSessions)

        try {
            let assistantContent = ""

            // ───────────────────────────────
            // ☑️ Noor AI Model
            // ───────────────────────────────
            // 1. Get Token
            const tokenRes = await fetch("/api/noor/get-token", { method: "POST" })
            if (!tokenRes.ok) {
                toast.error(t("serverDown"))
                setIsLoading(false)
                return
            }
            const { token } = await tokenRes.json()

            let session_id = noorSessionIds[currentSessionId]

            // 2. Only create a new Noor session if not already created
            if (!session_id) {
                const sessionRes = await fetch("/api/noor/start-session", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                })

                const data = await sessionRes.json()
                session_id = data?.session_id

                if (!session_id || !session_id.includes("-")) {
                    console.error("❌ Invalid session_id received:", session_id)
                    toast.error(t("serverDown"))
                    assistantContent = "Failed to start session. Please try again."
                    setIsLoading(false)
                    return
                }

                // Save it to local state
                setNoorSessionIds((prev) => ({ ...prev, [currentSessionId]: session_id }))
            }

            // 3. Get response using the correct session_id
            const response = await fetch("/api/noor/get-response", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id,
                    message: content.trim(),
                    language: selectedLanguage.startsWith("ar") ? "ar" : "en",
                    model: selectedLanguage === "ar-fanar" ? "fanar" : "default",
                })

            })



            if (!response.ok) {
                toast.error(t("serverDown"))
                assistantContent = "error, please try again"
            } else {
                // Handle streaming response
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()

                if (!reader) {
                    const text = await response.text()
                    assistantContent = text || "error"
                } else {
                    try {
                        while (true) {
                            const { done, value } = await reader.read()
                            if (done) break

                            const chunk = decoder.decode(value, { stream: true })
                            assistantContent += chunk

                            // Update local state incrementally for live typing effect
                            const assistantMessage: Message = {
                                id: (Date.now() + 1).toString(),
                                content: assistantContent,
                                role: "assistant",
                                timestamp: new Date(),
                            }

                            const updatedMessages = [...(currentSession?.messages || []), userMessage, assistantMessage]

                            const sessionsFinal = sessions.map((session) =>
                                session.id === currentSessionId ? { ...session, messages: updatedMessages } : session
                            )
                            onSessionsChange(sessionsFinal)
                        }
                    } catch (err) {
                        console.error("Stream reading error:", err)
                    }
                }
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: assistantContent,
                role: "assistant",
                timestamp: new Date(),
            }

            const updatedMessages = [...(currentSession?.messages || []), userMessage, assistantMessage]

            // Ensure UI is finalized
            const sessionsFinal = sessions.map((session) =>
                session.id === currentSessionId ? { ...session, messages: updatedMessages } : session
            )
            onSessionsChange(sessionsFinal)

            if (isFirstMessage) {
                console.log("[v0] First message detected, generating title...")
                try {
                    const titleResponse = await fetch("/api/generate-title", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            message: content.trim(),
                            subject: selectedSubject,
                            language: selectedLanguage,
                        }),
                    })

                    if (titleResponse.ok) {
                        const { title } = await titleResponse.json()
                        console.log("[v0] Generated title:", title)
                        if (title) {
                            updatedSessionName = title

                            const sessionsWithTitle = sessions.map((session) =>
                                session.id === currentSessionId ? { ...session, name: title, messages: updatedMessages } : session,
                            )
                            onSessionsChange(sessionsWithTitle)
                        }
                    } else {
                        console.error("[v0] Title generation failed:", titleResponse.status)
                    }
                } catch (titleError) {
                    console.error("[v0] Failed to generate title:", titleError)
                    updatedSessionName = generateSessionName(content.trim(), selectedSubject)
                }
            }

            // 🔁 Fallback title if not set
            if (!updatedSessionName) {
                updatedSessionName = currentSession?.name || generateSessionName(content.trim(), selectedSubject)
            }

            await setDoc(
                doc(db, "studentchats", currentSessionId),
                {
                    messages: updatedMessages,
                    name: updatedSessionName,
                    updatedAt: serverTimestamp(),
                    userId: user.uid,
                    subject: selectedSubject,
                    createdAt: currentSession?.createdAt || serverTimestamp(),
                },
                { merge: true },
            )


            console.log("[v0] Saved to Firestore with name:", updatedSessionName)
        } catch (error) {
            console.error("Error sending message:", error)
            toast.error(t("serverDown"))
            onSessionsChange(sessions) // rollback
        } finally {
            setIsLoading(false)
        }
    }

    const handleSuggestionClick = (suggestion: any) => {
        // If no session, set up the suggestion as if it was typed
        if (!currentSessionId) {
            setMessage(suggestion.subtitle)
            // We can't auto-submit easily because handleSubmit handles the flow
            // A small hack: setTimeout to submit? Or just let user click send?
            // Let's just set the message for now as per original code.
            // But if we want instant start:
            // handleSubmit({ preventDefault: () => {} } as any)
            // For now, keep original behavior: just populate input.
        } else {
            setMessage(suggestion.subtitle)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || !user) return

        if (!currentSessionId) {
            const messageToSend = message.trim()
            setPendingFirstMessage(messageToSend) // Set pending message for smooth transition
            setMessage("")
            setIsLoading(true)

            // Create new session and then send message
            createNewSession().then(() => {
                // Wait a bit for the session to be created, then send message
                setTimeout(() => {
                    if (sessions.length > 0) {
                        const newSessionId = sessions[0].id
                        sendMessage(messageToSend)
                    }
                }, 100)
            })
            return
        }

        const messageToSend = message.trim()
        setIsLoading(true)
        setMessage("")

        sendMessage(messageToSend)
    }

    if (loadingSessions) {
        return (
            <div className="flex flex-col h-screen bg-background items-center justify-center">
                <div className="animate-pulse">
                    <img src="/noor-smile.png" alt="Noor loading" className="w-16 h-16 mx-auto mb-4" />
                </div>
                <p className="text-muted-foreground">Loading your chats...</p>
            </div>
        )
    }

    return (
        <div
            className="flex flex-col h-full md:overflow-hidden bg-white p-3"
            dir={selectedLanguage.startsWith("ar") ? "rtl" : "ltr"}
        >

            <HeaderComponent chatboxmenu={true} />

            {/* Main Content */}
            <div className="flex flex-1 md:overflow-hidden pt-4 h-full bg-white">
                {showSessionList && (
                    <div className="w-80 border-r border-border bg-slate-50/50 overflow-y-auto">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="font-semibold">{language === "ar" ? "جلسات الدردشة" : "Chat Sessions"}</h2>
                                <Button onClick={createNewSession} size="sm">
                                    {language === "ar" ? "جلسة جديدة" : "New Chat"}
                                </Button>

                            </div>
                            <div className="space-y-2">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentSessionId === session.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                                            }`}
                                        onClick={() => onCurrentSessionChange(session.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{session.name}</p>
                                            <p className="text-sm text-muted-foreground">{session.createdAt.toLocaleDateString()}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity ml-2 ${deleteConfirmId === session.id ? "bg-red-100 text-red-600" : ""
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteSession(session.id, session.name)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <main className="flex-1 flex flex-col  items-center  justify-center p-2">
                    {!currentSession?.messages.length && !pendingFirstMessage ? (
                        <>
                            {/* Greeting Section with Lottie Background */}
                            <div className="relative w-full max-w-4xl text-center mb-10 flex flex-col items-center justify-center">
                                {/* Lottie Animation Mascot - Positioned Behind */}
                                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-100 pointer-events-none">
                                    <AITutorLottie width={120} height={120} className="transform translate-y-[-70px]" loop={false} />
                                </div>

                                {/* Greeting Text Content - Positioned Above */}
                                <div className="relative z-10 py-4 transform translate-y-12">
                                    {loadingStudent ? (
                                        <h1 className="text-6xl font-bold text-foreground mb-2">Hello,</h1>
                                    ) : (
                                        <h1 className="text-6xl font-bold text-foreground mb-2">
                                            {language === "ar"
                                                ? `مرحبًا ${studentData?.name || "طالب"},`
                                                : `Hello ${studentData?.name || "Student"},`}
                                        </h1>
                                    )}

                                    <p className="text-4xl text-foreground font-light mb-4"><b>
                                        {language === "ar"
                                            ? `كيف يمكنني مساعدتك؟`
                                            : `How can I help you today?`}</b>
                                    </p>
                                </div>

                            </div>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-4xl">
                                {suggestionCards.map((suggestion, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-card gap-1 bg-gray-50 border-none"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        dir={language === "ar" ? "rtl" : "ltr"}
                                    >
                                        <h3 className="font-semibold text-card-foreground ">{suggestion.title}</h3>
                                        <p className="text-sm text-[#A4A4A5]">{suggestion.subtitle}</p>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Chat Messages */
                        <div className="flex-1 w-full max-w-4xl px-2 overflow-y-auto mb-4 scrollbar-thin">
                            <div className="space-y-6">
                                {(currentSession?.messages || []).map((msg, index) => {
                                    const isLast = index === (currentSession?.messages || []).length - 1
                                    return (
                                        <div
                                            key={msg.id}
                                            ref={isLast ? lastMessageRef : null}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            {msg.role === "assistant" && (
                                                <div className="flex items-start gap-4 max-w-2xl lg:max-w-3xl">
                                                    <div className="flex-shrink-0">
                                                        <AITutorLottie width={32} height={32} className="mt-1" loop={false} />
                                                    </div>
                                                    <div className="bg-card text-card-foreground px-5 py-4 rounded-xl shadow-sm border border-border/50">
                                                        <MessageRenderer content={msg.content} />
                                                    </div>
                                                </div>
                                            )}
                                            {msg.role === "user" && (
                                                <div
                                                    className="max-w-lg lg:max-w-xl px-5 py-4 rounded-xl bg-primary text-primary-foreground shadow-sm ml-auto"
                                                    dir={/[\u0600-\u06FF]/.test(msg.content) ? "rtl" : "ltr"}
                                                >
                                                    <div className={`text-sm leading-relaxed ${/[\u0600-\u06FF]/.test(msg.content) ? "text-right" : "text-left"}`}>
                                                        {msg.content.split("\n").map((line, i) => (
                                                            <p key={i} className="mb-1 last:mb-0">
                                                                {line}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    )
                                })}

                                {/* optimistically show pending message if it exists and session has no messages yet */}
                                {pendingFirstMessage && (!currentSession?.messages || currentSession.messages.length === 0) && (
                                    <div className="flex justify-end">
                                        <div
                                            className="max-w-lg lg:max-w-xl px-5 py-4 rounded-xl bg-primary text-primary-foreground shadow-sm ml-auto"
                                            dir={/[\u0600-\u06FF]/.test(pendingFirstMessage) ? "rtl" : "ltr"}
                                        >
                                            <div className={`text-sm leading-relaxed ${/[\u0600-\u06FF]/.test(pendingFirstMessage) ? "text-right" : "text-left"}`}>
                                                {pendingFirstMessage.split("\n").map((line, i) => (
                                                    <p key={i} className="mb-1 last:mb-0">
                                                        {line}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-4 bg-card text-card-foreground px-5 py-4 rounded-xl border border-border/50">
                                            <div className="">
                                                <AITutorLottie width={24} height={24} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div
                                                        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                                        style={{ animationDelay: "0ms" }}
                                                    ></div>
                                                    <div
                                                        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                                        style={{ animationDelay: "150ms" }}
                                                    ></div>
                                                    <div
                                                        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                                                        style={{ animationDelay: "300ms" }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="w-full max-w-4xl">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2 p-2 border border-border rounded-lg bg-transparent flex-col"
                        >
                            <div className="flex w-full items-center gap-2">
                                <Input
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSubmit(e)
                                        }
                                    }}
                                    placeholder={language === "ar" ? "اكتب سؤالك..." : "Ask anything..."}
                                    className={`flex-1 border-none bg-transparent focus-visible:ring-0 py-4 text-base shadow-none ${message && /[\u0600-\u06FF]/.test(message) ? "text-right" : (language === "ar" ? "text-right placeholder:text-right" : "text-left")
                                        }`}
                                    disabled={isLoading}
                                    dir={message && /[\u0600-\u06FF]/.test(message) ? "rtl" : (language === "ar" ? "rtl" : "ltr")}
                                />
                            </div>

                            <div className="flex justify-between w-full" dir={language === "ar" ? "rtl" : "ltr"}>
                                <div>
                                    {/* Tools buttons placeholders if needed */}
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!message.trim() || isLoading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white h-10 w-10"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            {language === "ar"
                                ? "هذه الأداة تساعدك على التعلم، تأكد من المعلومات من كتابك أو معلمك۔"
                                : "This tool supports your learning. Confirm critical information from your textbook or teacher."}
                        </p>
                    </div>
                </main>
            </div>
        </div>
    )
}
