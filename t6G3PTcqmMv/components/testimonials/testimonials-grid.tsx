"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
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
    image: "/testimonials/Testimonials_BharatAgro.jpeg",
    title: "Bharat Agro",
  },
  {
    image: "/testimonials/Testimonials_Bheemasamusheer.jpeg",
    title: "Bheema Samusheer",
  },
  {
    image: "/testimonials/Testimonials_Brahmaputrametallics.jpeg",
    title: "Brahmaputra Metallics",
  },
  {
    image: "/testimonials/Testimonials_JharkhandGrind.jpeg",
    title: "Jharkhand Grind",
  },
  {
    image: "/testimonials/Testimonials_Katariyaagro.jpeg",
    title: "Katariya Agro",
  },
  {
    image: "/testimonials/Testimonials_KisanveerSatara.jpeg",
    title: "Kisan Veer Satara",
  },
  {
    image: "/testimonials/Testimonials_MaithanAlloys.jpeg",
    title: "Maithan Alloys",
  },
  {
    image: "/testimonials/Testimonials_MudremaneCoffee.jpeg",
    title: "Mudremane Coffee",
  },
  {
    image: "/testimonials/Testimonials_SAIL.jpeg",
    title: "SAIL",
  },
  {
    image: "/testimonials/Testimonials_Sahakarimills.jpeg",
    title: "Sahakari Mills",
  },
  {
    image: "/testimonials/Testimonials_SpectraIndia.jpeg",
    title: "Spectra India",
  },
  {
    image: "/testimonials/Testimonials_TirumalaCottons.jpeg",
    title: "Tirumala Cottons",
  },
  {
    image: "/testimonials/Testimonials_Vikrampvtltd.jpeg",
    title: "Vikram Pvt Ltd",
  },
]

export function TestimonialsGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 flex flex-col shadow-sm hover:shadow-md">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-4">
                  <Image
                    src={testimonial.image}
                    alt={`${testimonial.title} Certificate`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="mt-auto pt-4 border-t border-border">
                  <div className="font-semibold text-foreground text-center">
                    {testimonial.title}
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    Client Testimonial Certificate
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
