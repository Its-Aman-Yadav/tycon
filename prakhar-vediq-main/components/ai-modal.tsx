"use client"
import { useState } from "react"
import { X, Bot } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AMATab } from "@/components/ama-tab"
import { SummaryTab } from "@/components/summary-tab"
import { FlashCardsTab } from "@/components/flash-cards-tab"
import { QuizTab } from "@/components/quiz-tab"

interface Course {
  id: string
  title: string
  mode: "live" | "recorded"
  progress: number
  thumbnail: string
  instructor: string
  lastAccessed?: string
  totalHours?: number
  totalLectures?: number

  flashcards?: string[]
  answers?: string[]
  summarylong?: string
  summaryshort?: string
}


interface AIModalProps {
  isOpen: boolean
  onClose: () => void
  course: Course | null
}

export function AIModal({ isOpen, onClose, course }: AIModalProps) {
  const [activeTab, setActiveTab] = useState("ama")

  if (!course) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">AI Mode: {course.title}</h2>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="ama" className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 9c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm1-3h-2V5h2v3z"
                    fill="currentColor"
                  />
                </svg>
                AMA
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3h10v2H3V3zm0 4h10v2H3V7zm0 4h7v2H3v-2z" fill="currentColor" />
                </svg>
                Summary
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="7" r="1" fill="currentColor" />
                </svg>
                Flash Cards
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                Quiz
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[500px] overflow-y-auto">
              <TabsContent value="ama" className="mt-0">
                <AMATab course={course} />
              </TabsContent>
              <TabsContent value="summary" className="mt-0">
                <SummaryTab course={course} />
              </TabsContent>
              <TabsContent value="flashcards" className="mt-0">
                <FlashCardsTab
                  course={course}
                  flashcards={course.flashcards}
                  answers={course.answers}
                />
              </TabsContent>

              <TabsContent value="quiz" className="mt-0">
                <QuizTab course={course} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
