import { CalendarClock } from "lucide-react"

export default function ComingSoon() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-4 text-center">
      <div className="max-w-md space-y-6">
        <CalendarClock className="mx-auto h-16 w-16 text-gray-900" />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Coming Soon</h1>
        <p className="text-lg text-gray-600">
          We're working hard to bring you something amazing. Stay tuned for updates!
        </p>
        <div className="h-1 w-20 mx-auto bg-gray-900 rounded-full" />
      </div>
    </div>
  )
}
