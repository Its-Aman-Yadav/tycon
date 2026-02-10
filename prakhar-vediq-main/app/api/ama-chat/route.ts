// app/api/ama-chat/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { messages, course } = await req.json()

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
          content: `
You are a helpful and friendly AI tutor assisting a student in the course: "${course.title}".

Here is the course's description for reference:

"""${(course.summarylong || "").substring(0, 1500)}"""

Use this information to explain, simplify, and clarify any concept the student asks about.
Always keep responses clear, practical, and suitable for beginners.
`,
        },
        ...messages.map((msg: any) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      ],
    }),
  })

  const data = await openaiRes.json()
  return NextResponse.json(data)
}
