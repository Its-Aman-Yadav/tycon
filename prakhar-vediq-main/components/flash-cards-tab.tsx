"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
  summarylong?: string
  summaryshort?: string
}

interface FlashCardsTabProps {
  course: Course
  flashcards?: string[]
  answers?: string[]
}

interface FlashCard {
  id: string
  question: string
  answer: string
}

export function FlashCardsTab({ course, flashcards = [], answers = [] }: FlashCardsTabProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [flashCards, setFlashCards] = useState<FlashCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      const prepared = flashcards.map((question, index) => ({
        id: `${index + 1}`,
        question,
        answer: answers?.[index] || "No answer provided",
      }))
      setFlashCards(prepared)
      return
    }

    // prevent duplicate calls
    if (flashCards.length > 0 || loading) return

    setLoading(true)
    fetch("/api/generate-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: course.title,
        numCards: 5,
        context: course.summarylong
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const content = data.flashcards || []
        const generated = Array.isArray(content)
          ? content.map((item: any, index: number) => ({
            id: `${index + 1}`,
            question: item.question,
            answer: item.answer,
          }))
          : []
        setFlashCards(generated)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching flashcards:", err)
        setError("Failed to generate flashcards.")
        setLoading(false)
      })
  }, [course.title])


  const currentCard = flashCards[currentCardIndex] || null

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashCards.length)
    setShowAnswer(false)
  }

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + flashCards.length) % flashCards.length)
    setShowAnswer(false)
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-20">Generating flashcards...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 py-20">{error}</div>
  }

  if (flashCards.length === 0) {
    return (
      <div className="text-center text-gray-500 py-20">
        No flashcards available for this course.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-2xl">
        <Card className="min-h-[300px] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
            {!showAnswer && currentCard && (
              <div className="space-y-4">
                <div className="text-6xl text-red-500 mb-4">?</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentCard.question}
                </h3>
                <Button onClick={toggleAnswer} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Click to reveal answer
                </Button>
              </div>
            )}

            {showAnswer && currentCard && (
              <div className="space-y-4">
                <div className="text-4xl text-green-500 mb-4">✓</div>
                <p className="text-lg text-gray-700 leading-relaxed">{currentCard.answer}</p>
                <Button
                  onClick={toggleAnswer}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  Show question again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button onClick={prevCard} variant="outline" size="icon" disabled={flashCards.length <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          {flashCards.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentCardIndex ? "bg-green-500" : "bg-gray-300"
                }`}
            />
          ))}
        </div>

        <Button onClick={nextCard} variant="outline" size="icon" disabled={flashCards.length <= 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        Card {currentCardIndex + 1} of {flashCards.length}
      </div>
    </div>
  )
}
