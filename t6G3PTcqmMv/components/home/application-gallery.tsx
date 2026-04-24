"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Image as ImageIcon } from "lucide-react"

const applications = [
  { title: "Spices Processing Line", category: "Food Processing", image: "/products/P-02_tyco-india-spices-pulverizer.jpg" },
  { title: "Fertilizer Bagging System", category: "Fertilizer", image: "/products/P-03_tyco-india-weighing-bagging-machine.jpg" },
  { title: "Mineral Grinding Unit", category: "Minerals", image: "/products/P-01_tyco-india-pulverizer.jpg" },
  { title: "Chemical Processing", category: "Chemicals", image: "/products/P-04_tyco-india-air-classifiers.jpg" },
  { title: "Primary Crushing Setup", category: "Mining", image: "/products/P-06_tyco-india-jaw-crusher.jpg" },
  { title: "Warehouse Handling", category: "Material Handling", image: "/products/P-05_tyco-india-material-handling-equipments.jpg" },
]

export function ApplicationGallery() {
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
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Applications</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
            Industrial Applications Gallery
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            See our machinery at work across diverse industrial applications.
          </p>
        </motion.div>

        {/* Gallery grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app, index) => (
            <motion.div
              key={app.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-2xl bg-card border border-border overflow-hidden relative hover:border-primary/30 transition-all duration-300">
                {/* Image */}
                <div className="absolute inset-0 bg-white p-6">
                  <Image
                    src={app.image}
                    alt={app.title}
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">{app.category}</span>
                  <h3 className="text-lg font-semibold text-foreground mt-1 font-display">{app.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
