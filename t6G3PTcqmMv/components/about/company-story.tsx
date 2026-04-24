"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Calendar, Factory, Award } from "lucide-react"

export function CompanyStory() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Story</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
              Company Story
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              TYCO India was incorporated on 15 September 1977. The company manufactures a large 
              range of industrial equipment from its factory in Nagpur and has built a long-standing 
              presence through quality, reliability, and practical engineering.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6"
          >
            <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground font-display">Incorporated</h3>
                  <p className="mt-1 text-2xl font-bold text-primary">15 September 1977</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Factory className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground font-display">Manufacturing Base</h3>
                  <p className="mt-1 text-muted-foreground">Factory in Nagpur, Maharashtra</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground font-display">Built On</h3>
                  <p className="mt-1 text-muted-foreground">Quality, reliability, and practical engineering</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
