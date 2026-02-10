// app/api/roombr/get-meeting/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meetingId = id
  const clientId = process.env.ROOMBR_CLIENT_ID
  const secretKey = process.env.ROOMBR_SECRET_KEY

  if (!clientId || !secretKey) {
    return NextResponse.json({ error: "Missing Roombr API credentials" }, { status: 500 })
  }

  try {
    const res = await fetch(`https://connect.roombr.com/api/meetings/${meetingId}?user_id=1`, {
      headers: {
        client_id: clientId,
        secret_key: secretKey,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error }, { status: res.status })
    }

    const data = await res.json()
    console.log("API response", data);

    return NextResponse.json(data)
  } catch (error) {
    console.error("Roombr API error:", error)
    return NextResponse.json({ error: "Failed to fetch meeting" }, { status: 500 })
  }
}
