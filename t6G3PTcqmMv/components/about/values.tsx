"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ShieldCheck, Hammer, Globe, Wrench, Handshake } from "lucide-react"

const reasons = [
  {
    icon: ShieldCheck,
    title: "Reliable Industrial Performance",
    description: "Equipment designed to perform consistently under demanding industrial conditions.",
  },
  {
    icon: Hammer,
    title: "Rugged Construction",
    description: "Built with heavy-duty materials for long service life and minimal maintenance.",
  },
  {
    icon: Globe,
    title: "Broad Industrial Applications",
    description: "Serving multiple industries from food processing to chemicals to minerals.",
  },
  {
    icon: Wrench,
    title: "Practical Engineering",
    description: "Solutions that work in real-world conditions, not just on paper.",
  },
  {
    icon: Handshake,
    title: "Long-Term Customer Trust",
    description: "Decades of relationships built on delivering what we promise.",
  },
]

export function Values() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Strengths</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display">
            Why Customers Work with TYCO
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <reason.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground font-display">{reason.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
