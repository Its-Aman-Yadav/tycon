"use client"

import { useState } from "react"
import NoorSmileChat from "@/components/NoorSmileChat"

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

export default function StudentDashboard() {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

    return (
        <div className="h-screen w-full">
            <NoorSmileChat
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSessionsChange={setSessions}
                onCurrentSessionChange={setCurrentSessionId}
                showSessionList={true} // ← User requested left sidebar
            />
        </div>
    )
}
