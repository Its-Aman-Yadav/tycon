// app/api/summarize-transcription/route.ts

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // Ensure this is set in your .env
})

export async function POST(req: NextRequest) {
  try {
    const { transcription } = await req.json()

    if (!transcription) {
      return NextResponse.json({ error: "Missing transcription" }, { status: 400 })
    }

    // PROMPT: Long summary
    const longPrompt = `
You are an expert educator. The following is a video transcription

Your task: Write a **detailed long summary** of the content in professional tone. Include the key learning objectives, tools mentioned, technical steps, and examples provided in the video. Do not include speaker’s jokes or casual filler. Do not say “in the video it says…” — write as if summarizing course material for a catalog.

Transcription:
${transcription}
    `

    // PROMPT: Simplified Story-Like Summary
    const storyPrompt = `
You are a friendly teacher. Based on the transcription below, write a **simplified story-style summary** for absolute beginners. Make it sound like a walkthrough Avoid technical terms unless you explain them in simple words.

Transcription:
${transcription}
    `

    // Run both prompts in parallel
    const [longRes, storyRes] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: longPrompt }],
        temperature: 0.6,
      }),
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: storyPrompt }],
        temperature: 0.7,
      }),
    ])

    const longSummary = longRes.choices[0]?.message?.content?.trim()
    const simplifiedSummary = storyRes.choices[0]?.message?.content?.trim()

    return NextResponse.json({
      longSummary,
      simplifiedSummary,
    })
  } catch (error) {
    console.error("❌ Error generating summaries:", error)
    return NextResponse.json({ error: "Failed to summarize transcription" }, { status: 500 })
  }
}
