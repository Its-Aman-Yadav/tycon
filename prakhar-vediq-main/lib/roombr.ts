export async function scheduleRoombrMeeting(payload: any) {
  const response = await fetch("/api/roombr/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) throw new Error(data.error || "Failed to schedule Roombr meeting")

  const { meeting_id, passcode, attendees } = data?.data || {}

  return {
    fullData: data,         // complete Roombr response (optional)
    meetingId: meeting_id,  // string (e.g., "287692766")
    passcode,               // string (e.g., "XQ2BTH2R")
    attendees,              // array of host/presenter info
  }
}
