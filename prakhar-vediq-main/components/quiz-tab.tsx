"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

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
}

interface QuizTabProps {
  course: Course
}

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export function QuizTab({ course }: QuizTabProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progress = totalQuestions ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseTitle: course.title,
            context: course.summarylong
          }),
        })

        const data = await res.json()

        if (!res.ok || !Array.isArray(data.questions)) {
          throw new Error(data.error || "Failed to load quiz")
        }

        setQuestions(data.questions)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [course.title])

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value)
  }

  const handleSubmitAnswer = () => {
    const answerIndex = Number.parseInt(selectedAnswer)
    const isCorrect = answerIndex === currentQuestion.correctAnswer

    if (isCorrect && !answeredQuestions.includes(currentQuestionIndex)) {
      setScore(score + 1)
      setAnsweredQuestions([...answeredQuestions, currentQuestionIndex])
    }

    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
      setShowResult(false)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedAnswer("")
      setShowResult(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer("")
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Generating quiz...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-center">
        Failed to load quiz: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Test Yourself</h3>
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base">
            {currentQuestionIndex + 1}. {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showResult ? (
            <>
              <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Submit Answer
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${Number.parseInt(selectedAnswer) === currentQuestion.correctAnswer
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
                  }`}
              >
                {Number.parseInt(selectedAnswer) === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {Number.parseInt(selectedAnswer) === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                </span>
              </div>

              {currentQuestion.explanation && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {currentQuestionIndex > 0 && (
                  <Button onClick={handlePrevQuestion} variant="outline">
                    Previous
                  </Button>
                )}
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={handleNextQuestion} className="ml-auto">
                    Next Question
                  </Button>
                ) : (
                  <div className="ml-auto space-x-2">
                    <Button onClick={resetQuiz} variant="outline">
                      Restart Quiz
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      View Results ({score}/{totalQuestions})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
