"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2 } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function AboutPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl bg-muted border border-border overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-24 h-24 text-muted-foreground/20" />
              </div>
              {/* Overlay content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary font-display">47+</span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">Years of Excellence</div>
                    <div className="text-sm text-muted-foreground">Since 15 September 1977</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">About TYCO</span>
            <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
              Engineering Excellence from Nagpur
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              TYCO India was incorporated on 15 September 1977 and manufactures a broad range of 
              industrial equipment from its Nagpur works. The company serves multiple industrial 
              applications through practical, rugged, engineering-led machinery solutions.
            </p>
            
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary font-display">1500+</div>
                <div className="text-sm text-muted-foreground mt-1">Satisfied Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary font-display">Nagpur</div>
                <div className="text-sm text-muted-foreground mt-1">Manufacturing Base</div>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                <Link href="/about" className="flex items-center gap-2">
                  Learn More About TYCO
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
