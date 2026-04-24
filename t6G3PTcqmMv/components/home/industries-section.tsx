"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { UtensilsCrossed, Leaf, FlaskConical, Wheat, Mountain, Factory, Warehouse, ArrowRight } from "lucide-react"

const industries = [
  {
    icon: UtensilsCrossed,
    name: "Food Processing",
    description: "Grinding and processing equipment for food industries",
  },
  {
    icon: Leaf,
    name: "Spices Processing",
    description: "Specialized pulverizers for spices and masala",
  },
  {
    icon: FlaskConical,
    name: "Chemicals",
    description: "Equipment for chemical processing applications",
  },
  {
    icon: Wheat,
    name: "Fertilizer",
    description: "Bagging and handling systems for fertilizers",
  },
  {
    icon: Mountain,
    name: "Cement and Minerals",
    description: "Crushing and classification for mineral processing",
  },
  {
    icon: Factory,
    name: "Sugar",
    description: "Processing equipment for sugar industry",
  },
  {
    icon: Factory,
    name: "Steel and Industrial Processing",
    description: "Heavy-duty equipment for steel and metal industries",
  },
  {
    icon: Warehouse,
    name: "Warehousing and Material Handling",
    description: "Conveyors and handling systems for warehouses",
  },
]

export function IndustriesSection() {
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
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Industries We Serve</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
            Trusted Across Industries
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our industrial machinery serves a diverse range of sectors, from food processing 
            to heavy mineral industries.
          </p>
        </motion.div>

        {/* Industries grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <industry.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors font-display">
                  {industry.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {industry.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/industries"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            View All Industries
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
