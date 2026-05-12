"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    image: "/testimonials/Testimonials_AssociatedEngineers.jpeg",
    title: "Associated Engineers",
  },
  {
    image: "/testimonials/Testimonials_Basundharapaddy.jpeg",
    title: "Basundhara Paddy",
  },
  {
    image: "/testimonials/Testimonials_SAIL.jpeg",
    title: "SAIL",
  },
]

export function TestimonialsPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
         >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Testimonials</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
            Trusted by Industry Leaders
          </h2>
          <p className="mt-4 text-muted-foreground">
            Our commitment to quality is reflected in the certificates of appreciation from our valued clients.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group h-full p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-4">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.title} Certificate`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="text-center py-2">
                  <div className="text-sm font-semibold text-foreground">{testimonial.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">Appreciation Certificate</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Button asChild variant="outline">
            <Link href="/testimonials" className="flex items-center gap-2">
              View All Certificates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
