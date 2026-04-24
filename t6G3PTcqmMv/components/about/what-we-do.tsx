"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, Cog } from "lucide-react"

const products = [
  { name: "Pulverisers", href: "/products/pulveriser" },
  { name: "Spices Pulverizers", href: "/products/spices-pulverizer" },
  { name: "Automatic Weighing and Bagging Machines", href: "/products/automatic-weighing-bagging-machine" },
  { name: "Air Classifiers", href: "/products/air-classifier" },
  { name: "Material Handling Equipments", href: "/products/material-handling-equipments" },
  { name: "Jaw Crushers", href: "/products/jaw-crusher" },
  { name: "Electromagnetic Vibrators", href: "/products/electromagnetic-vibrator" },
]

export function WhatWeDo() {
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
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Product Portfolio</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display">
            What We Do
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We manufacture a comprehensive range of industrial processing equipment
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link
                href={product.href}
                className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Cog className="w-5 h-5 text-primary" />
                </div>
                <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                  {product.name}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
