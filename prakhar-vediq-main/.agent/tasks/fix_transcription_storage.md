# Task: Resolve Video Transcription Storage Issue

## Problem
The user reported that video transcriptions were not being stored.
Investigation revealed that the Teacher Dashboard's `handleEnableAIMode` function in `components/teacher/CoursesList.tsx` was:
1.  **Fragile**: It waited for all transcriptions to complete on the client side before saving *anything* to Firestore. If one request failed or the browser tab was closed, everything was lost.
2.  **Missing Features**: It did not use the server-side saving capability of the `/api/transcribe-video` endpoint (which requires passing `courseId`, `moduleIndex`, etc.).
3.  **No Timeout Handling**: It did not handle Vercel/Next.js timeouts (504 errors) which are common for long video transcriptions.

## Solution
We updated `components/teacher/CoursesList.tsx` to match the more robust implementation found in the Admin dashboard:
1.  **Incremental Saving**: Now passes `courseId`, `moduleIndex`, and `videoIndex` to the API, allowing the server to save each transcription to Firestore immediately upon completion.
2.  **Polling Fallback**: Implemented a polling mechanism. If the initial fetch times out (504), the client polls Firestore every 5 seconds to check if the server-side process completed successfully.
3.  **Error Resilience**: If the summarization step fails (which happens after transcription), the transcriptions are preserved, and the course is still marked as having AI mode enabled, instead of failing the entire operation.

## Files Modified
- `components/teacher/CoursesList.tsx`: Replaced `handleEnableAIMode` with the robust implementation.

## Verification
- The new logic ensures that even if the client disconnects or the request times out, the server-side process (which might still be running or have completed) is checked, and data is saved incrementally.
