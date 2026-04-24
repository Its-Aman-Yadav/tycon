"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Calendar, Users, MapPin, Package, FileText } from "lucide-react"

const trustPoints = [
  { 
    icon: Calendar,
    value: "1977", 
    label: "Established" 
  },
  { 
    icon: Users,
    value: "1500+", 
    label: "Satisfied Customers" 
  },
  { 
    icon: MapPin,
    value: "Nagpur", 
    label: "Manufacturing Base" 
  },
  { 
    icon: Package,
    value: "7+", 
    label: "Product Categories" 
  },
  { 
    icon: FileText,
    value: "Available", 
    label: "Technical Brochures" 
  },
]

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-16 bg-card border-y border-border overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,130,32,0.02)_25%,rgba(245,130,32,0.02)_50%,transparent_50%,transparent_75%,rgba(245,130,32,0.02)_75%)] bg-[size:20px_20px]" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl md:text-3xl font-bold text-foreground font-display group-hover:text-primary transition-colors duration-300">
                  {point.value}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {point.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
