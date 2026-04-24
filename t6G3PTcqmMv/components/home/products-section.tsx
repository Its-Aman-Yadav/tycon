"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Package } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const products = [
  {
    id: "pulveriser",
    name: "Pulveriser",
    summary: "Industrial grinding system with flexible fineness control and dust-free operation.",
    applications: ["Chemicals", "Minerals", "Pharmaceuticals"],
    href: "/products/pulveriser",
    image: "/products/P-01_tyco-india-pulverizer.jpg",
  },
  {
    id: "spices-pulverizer",
    name: "Spices Pulverizer",
    summary: "Two-stage spices grinding system for chilli, coriander, cumin, and similar materials.",
    applications: ["Spices", "Food Processing", "Masala"],
    href: "/products/spices-pulverizer",
    image: "/products/P-02_tyco-india-spices-pulverizer.jpg",
  },
  {
    id: "automatic-weighing-bagging-machine",
    name: "Automatic Weighing & Bagging Machine",
    summary: "Compact weighing and bagging solution for powdery, granular, and lumpy materials.",
    applications: ["Fertilizer", "Cement", "Chemicals"],
    href: "/products/automatic-weighing-bagging-machine",
    image: "/products/P-03_tyco-india-weighing-bagging-machine.jpg",
  },
  {
    id: "air-classifier",
    name: "Air Classifier",
    summary: "Centrifugal classifier for fine and coarse dry powdered materials with precise fineness control.",
    applications: ["Minerals", "Chemicals", "Pharmaceuticals"],
    href: "/products/air-classifier",
    image: "/products/P-04_tyco-india-air-classifiers.jpg",
  },
  {
    id: "material-handling-equipments",
    name: "Material Handling Equipments",
    summary: "Conveyor and handling systems for industrial bag movement and process-line support.",
    applications: ["Warehousing", "Processing", "Logistics"],
    href: "/products/material-handling-equipments",
    image: "/products/P-05_tyco-india-material-handling-equipments.jpg",
  },
  {
    id: "jaw-crusher",
    name: "Jaw Crusher",
    summary: "Heavy-duty crushing equipment with rugged body and wear-resistant jaw plates.",
    applications: ["Mining", "Minerals", "Aggregates"],
    href: "/products/jaw-crusher",
    image: "/products/P-06_tyco-india-jaw-crusher.jpg",
  },
  {
    id: "electromagnetic-vibrator",
    name: "Electromagnetic Vibrator",
    summary: "System for maintaining free flow of stubborn materials from bins, hoppers, chutes, and pipes.",
    applications: ["Bulk Handling", "Process Industry", "Feeders"],
    href: "/products/electromagnetic-vibrator",
    image: "/products/P-07_tyco-india-electromagnetic-vibrator.jpg",
  },
]

export function ProductsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary/5 to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Product Range</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
            Industrial Processing Equipment
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive range of machinery for grinding, classification, bagging, and material handling applications.
          </p>
        </motion.div>

        {/* Products grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full flex flex-col rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden">
                {/* Product image */}
                <div className="aspect-[4/3] bg-white relative overflow-hidden p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors font-display">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                    {product.summary}
                  </p>
                  
                  {/* Application tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.applications.map((app) => (
                      <span 
                        key={app} 
                        className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex flex-col gap-2">
                    <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90">
                      <Link href={product.href} className="flex items-center justify-center gap-2">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Brochure
                    </Button>
                  </div>
                </div>
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
          <Button asChild variant="outline" size="lg">
            <Link href="/products" className="flex items-center gap-2">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
