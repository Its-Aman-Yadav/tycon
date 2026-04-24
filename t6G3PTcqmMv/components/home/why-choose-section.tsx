"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Clock, Shield, Target, Users, FileText, Wrench, Award } from "lucide-react"

const valuePillars = [
  {
    icon: Clock,
    title: "Decades of Experience",
    description: "Manufacturing industrial machinery since 1977 with proven expertise and continuous innovation.",
  },
  {
    icon: Shield,
    title: "Rugged Equipment",
    description: "Built for demanding industrial environments with heavy-duty construction and reliable performance.",
  },
  {
    icon: Target,
    title: "Broad Application Coverage",
    description: "Comprehensive product range serving multiple industries from food processing to mineral handling.",
  },
  {
    icon: Users,
    title: "Proven Installed Base",
    description: "Over 1500 satisfied customers trust TYCO equipment for their critical processing needs.",
  },
  {
    icon: FileText,
    title: "Technical Brochures",
    description: "Detailed specifications and technical documentation available for all products.",
  },
  {
    icon: Wrench,
    title: "Engineering-Led Solutions",
    description: "Practical, application-focused machinery designed by experienced process engineers.",
  },
  {
    icon: Award,
    title: "Trusted by Industry Leaders",
    description: "Leading industrial brands rely on TYCO for their processing and handling requirements.",
  },
]

export function WhyChooseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Why Choose TYCO</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
            The TYCO Advantage
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover why leading industrial operations trust TYCO India for their 
            machinery and processing needs.
          </p>
        </motion.div>

        {/* Value pillars grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {valuePillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <pillar.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-display">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
