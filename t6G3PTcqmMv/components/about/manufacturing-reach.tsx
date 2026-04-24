"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Factory, Building2, MapPin } from "lucide-react"

const locations = [
  {
    icon: Factory,
    type: "Works",
    name: "Nagpur",
    description: "Manufacturing facility and primary production base",
  },
  {
    icon: Building2,
    type: "Office",
    name: "Pune",
    description: "Regional sales and support office",
  },
  {
    icon: MapPin,
    type: "Presence",
    name: "Multiple Branch Cities",
    description: "Sales and service network across India",
  },
]

export function ManufacturingReach() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Presence</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display">
            Manufacturing and Reach
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Strategic locations enabling efficient manufacturing and nationwide service
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={location.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <location.icon className="w-8 h-8 text-primary" />
              </div>
              <span className="text-sm text-primary font-medium uppercase tracking-wider">{location.type}</span>
              <h3 className="mt-2 text-2xl font-bold text-foreground font-display">{location.name}</h3>
              <p className="mt-3 text-muted-foreground">{location.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
