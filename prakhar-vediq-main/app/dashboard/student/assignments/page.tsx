"use client"

import { Clock } from "lucide-react"

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-800 px-4">
      <div className="text-center max-w-xl">
        <Clock className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 mb-6">
          We're working on something amazing. Stay tuned!
        </p>
      </div>
    </div>
  )
}
