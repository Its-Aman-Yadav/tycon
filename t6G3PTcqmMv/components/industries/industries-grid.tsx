"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Wheat, Leaf, FlaskConical, Droplets, Factory, Mountain, Cog, Package, ArrowRight } from "lucide-react"

const industries = [
  {
    icon: Wheat,
    name: "Food Processing",
    description: "Grinding and processing equipment for food ingredients, grains, and processed foods with hygienic design standards.",
    products: ["Pulveriser", "Air Classifier", "Material Handling Equipments"],
  },
  {
    icon: Leaf,
    name: "Spices Processing",
    description: "Specialized grinding solutions for spices with aroma retention, temperature control, and fine particle output.",
    products: ["Spices Pulverizer", "Air Classifier", "Automatic Weighing & Bagging Machine"],
  },
  {
    icon: FlaskConical,
    name: "Chemicals",
    description: "Heavy-duty grinding and material handling equipment for chemical powders, pigments, and industrial compounds.",
    products: ["Pulveriser", "Jaw Crusher", "Material Handling Equipments", "Electromagnetic Vibrator"],
  },
  {
    icon: Droplets,
    name: "Fertilizer",
    description: "Processing and bagging systems for fertilizers with corrosion-resistant construction and high throughput capacity.",
    products: ["Pulveriser", "Automatic Weighing & Bagging Machine", "Material Handling Equipments"],
  },
  {
    icon: Factory,
    name: "Sugar",
    description: "Grinding and handling equipment for sugar processing with food-grade materials and sanitary design.",
    products: ["Pulveriser", "Air Classifier", "Material Handling Equipments"],
  },
  {
    icon: Mountain,
    name: "Cement and Minerals",
    description: "Heavy-duty crushing, grinding, and classification equipment for cement plants and mineral processing operations.",
    products: ["Jaw Crusher", "Pulveriser", "Air Classifier", "Material Handling Equipments"],
  },
  {
    icon: Cog,
    name: "Steel and Industrial Processing",
    description: "Robust material handling and processing equipment for steel plants and heavy industrial applications.",
    products: ["Jaw Crusher", "Material Handling Equipments", "Electromagnetic Vibrator"],
  },
  {
    icon: Package,
    name: "Warehousing and Packaging",
    description: "Automated weighing, bagging, and material handling systems for efficient warehouse operations.",
    products: ["Automatic Weighing & Bagging Machine", "Material Handling Equipments", "Electromagnetic Vibrator"],
  },
]

export function IndustriesGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <industry.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground font-display">
                  {industry.name}
                </h3>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  {industry.description}
                </p>

                <div className="mt-5 pt-5 border-t border-border">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Relevant Products
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {industry.products.map((product) => (
                      <span
                        key={product}
                        className="px-2 py-1 text-xs rounded bg-primary/10 text-primary border border-primary/20"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <Link 
                  href="/enquiry" 
                  className="mt-5 inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                >
                  Get Solutions
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
