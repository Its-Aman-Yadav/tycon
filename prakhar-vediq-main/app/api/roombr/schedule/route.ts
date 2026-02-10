// app/api/roombr/schedule/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch("https://connect.roombr.com/api/meetings/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        client_id: process.env.ROOMBR_CLIENT_ID!,
        secret_key: process.env.ROOMBR_SECRET_KEY!,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    console.log("Attendees:", JSON.stringify(data.data.attendees, null, 2))


    if (!response.ok) {
      console.error("Roombr API Error:", response.status, data)
      return NextResponse.json({ error: data?.error || "Failed to schedule Roombr meeting" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
