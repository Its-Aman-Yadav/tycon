"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Quote, Star } from "lucide-react"

const testimonials = [
  {
    quote: "The automatic bagging machine from TYCO has transformed our fertilizer packing operations. Reliable performance and excellent after-sales support.",
    author: "Operations Manager",
    company: "Leading Fertilizer Manufacturer",
    product: "Bagging Machine",
    rating: 5,
  },
  {
    quote: "We have been using TYCO pulverisers for our industrial grinding needs for over 10 years. Consistent quality and minimal downtime.",
    author: "Plant Head",
    company: "Chemical Processing Plant",
    product: "Pulveriser",
    rating: 5,
  },
  {
    quote: "The spices pulverizer retains the aroma and quality of our products. Perfect for our food processing requirements.",
    author: "Production Manager",
    company: "Spices Processing Company",
    product: "Spices Pulverizer",
    rating: 5,
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
            What Our Clients Say
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-auto">
                  <div className="text-sm font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                  <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {testimonial.product}
                  </span>
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
              View All Testimonials
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
