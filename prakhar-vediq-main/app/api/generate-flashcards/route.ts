import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Safely read and parse JSON
    const bodyText = await req.text()
    if (!bodyText) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 })
    }

    let json
    try {
      json = JSON.parse(bodyText)
    } catch (err) {
      console.error("Invalid JSON in request body")
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 })
    }

    const { topic, numCards = 5, context } = json

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const prompt = `
Generate ${numCards} flashcards about "${topic}". 
${context ? `Use the following content as the source material:\n"""${context}"""\n` : ""}
Only return a JSON array like this:
[
  { "question": "What is ...?", "answer": "..." },
  { "question": "Why ...?", "answer": "..." }
]
No explanation. Just valid JSON array.
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that returns valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || ""

    // Extract only the JSON array part (in case GPT wraps it with text)
    const jsonStart = content.indexOf("[")
    const jsonEnd = content.lastIndexOf("]") + 1
    const jsonString = content.slice(jsonStart, jsonEnd)

    let flashcards = []
    try {
      flashcards = JSON.parse(jsonString)
    } catch (err) {
      console.error("JSON parse error:", err)
      return NextResponse.json({ error: "Failed to parse flashcards" }, { status: 500 })
    }

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error("Flashcard generation error:", error)
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
  }
}
