"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { MessageSquare, ArrowRight } from "lucide-react"

export function ProductsCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(245,130,32,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,130,32,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground font-display text-balance">
              Need Help Choosing the Right Machine?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our engineering team can help you select the ideal equipment for your specific application and requirements.
            </p>
            
            <Link
              href="/enquiry"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all group"
            >
              Talk to Our Team
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
