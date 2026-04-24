"use client"

import { motion } from "framer-motion"

export function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,130,32,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,130,32,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">About TYCO</span>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-display text-balance">
            Built on Industrial Engineering Experience Since{" "}
            <span className="text-primary">1977</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl">
            TYCO India is a long-standing manufacturer of industrial machinery serving multiple 
            process industries through practical and durable equipment solutions.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
