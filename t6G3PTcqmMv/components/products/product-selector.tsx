"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Cog, Wind, Package, Truck, Hammer, Vibrate } from "lucide-react"

const applicationCategories = [
  {
    id: "grinding",
    name: "Grinding",
    icon: Cog,
    description: "Size reduction and pulverizing of materials",
    products: [
      { name: "Pulveriser", slug: "pulveriser" },
      { name: "Spices Pulverizer", slug: "spices-pulverizer" },
    ]
  },
  {
    id: "classification",
    name: "Classification",
    icon: Wind,
    description: "Particle size separation and sorting",
    products: [
      { name: "Air Classifier", slug: "air-classifier" },
    ]
  },
  {
    id: "bagging",
    name: "Bagging",
    icon: Package,
    description: "Weighing and packaging solutions",
    products: [
      { name: "Automatic Weighing & Bagging Machine", slug: "automatic-weighing-bagging-machine" },
    ]
  },
  {
    id: "handling",
    name: "Handling",
    icon: Truck,
    description: "Material transport and storage",
    products: [
      { name: "Material Handling Equipments", slug: "material-handling-equipments" },
    ]
  },
  {
    id: "crushing",
    name: "Crushing",
    icon: Hammer,
    description: "Primary size reduction of hard materials",
    products: [
      { name: "Jaw Crusher", slug: "jaw-crusher" },
    ]
  },
  {
    id: "flow-support",
    name: "Flow Support",
    icon: Vibrate,
    description: "Controlled feeding and material flow",
    products: [
      { name: "Electromagnetic Vibrator", slug: "electromagnetic-vibrator" },
    ]
  },
]

export function ProductSelector() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display text-balance">
            Find the Right Product for Your Application
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your application type to find the most suitable TYCO equipment for your needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicationCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground font-display">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {category.products.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className="group flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors"
                    >
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
