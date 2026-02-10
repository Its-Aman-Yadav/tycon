import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Ensure request is JSON
    const body = await req.json()
    const courseTitle = body?.courseTitle?.trim()
    const context = body?.context?.trim()

    if (!courseTitle) {
      return NextResponse.json({ error: "Course title is required" }, { status: 400 })
    }

    const prompt = `
Generate a 10-question multiple choice quiz for a course titled "${courseTitle}".
${context ? `Use the following course summary as context for the questions:\n"""${context}"""\n` : ""}
Each question should include:
- question (string)
- 4 options (array of strings)
- correctAnswer (index of correct option from 0-3)
- explanation (short explanation for the correct answer)

Return ONLY an array of objects with this structure:
[
  {
    "id": "1",
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 2,
    "explanation": "..."
  },
  ...
]
`.trim()

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const rawContent = chatCompletion.choices[0].message.content || ""

    // Try to extract the array from the response safely
    const start = rawContent.indexOf("[")
    const end = rawContent.lastIndexOf("]") + 1
    const jsonString = rawContent.slice(start, end)

    let questions = []

    try {
      questions = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError)
      return NextResponse.json(
        { error: "Failed to parse OpenAI response as JSON" },
        { status: 500 }
      )
    }

    return NextResponse.json({ questions })
  } catch (err: any) {
    console.error("API Error:", err)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
