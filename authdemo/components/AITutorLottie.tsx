"use client"

import Lottie from "lottie-react"
import { cn } from "@/lib/utils"

interface AITutorLottieProps {
    width?: number
    height?: number
    className?: string
    loop?: boolean
}

export default function AITutorLottie({ width = 100, height = 100, className, loop = true }: AITutorLottieProps) {
    // Use a placeholder if no animation is provided
    return (
        <div
            className={cn("flex items-center justify-center", className)}
            style={{ width, height }}
        >
            <img src="/noor-smile.png" alt="Noor" className="w-full h-full object-contain animate-pulse" />
        </div>
    )
}
