"use client"

import { motion } from "framer-motion"

export function IndustriesHero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,130,32,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(245,130,32,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Industries We Serve</span>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-display text-balance">
            Industrial Solutions Across Multiple Sectors
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
            TYCO machinery supports a broad range of industrial processing and handling applications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-wrap gap-6"
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">8</span>
            </div>
            <div>
              <div className="font-semibold text-foreground">Major Industries</div>
              <div className="text-sm">Served across India</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">7</span>
            </div>
            <div>
              <div className="font-semibold text-foreground">Product Lines</div>
              <div className="text-sm">Complete solutions</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
