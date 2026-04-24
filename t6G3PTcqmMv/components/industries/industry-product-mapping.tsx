"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"

const products = [
  { id: "pulveriser", name: "Pulveriser", slug: "pulveriser" },
  { id: "spices-pulverizer", name: "Spices Pulverizer", slug: "spices-pulverizer" },
  { id: "bagging", name: "Auto Weighing & Bagging", slug: "automatic-weighing-bagging-machine" },
  { id: "air-classifier", name: "Air Classifier", slug: "air-classifier" },
  { id: "material-handling", name: "Material Handling", slug: "material-handling-equipments" },
  { id: "jaw-crusher", name: "Jaw Crusher", slug: "jaw-crusher" },
  { id: "electromagnetic", name: "EM Vibrator", slug: "electromagnetic-vibrator" },
]

const industries = [
  { name: "Food Processing", products: ["pulveriser", "air-classifier", "material-handling"] },
  { name: "Spices Processing", products: ["spices-pulverizer", "air-classifier", "bagging"] },
  { name: "Chemicals", products: ["pulveriser", "jaw-crusher", "material-handling", "electromagnetic"] },
  { name: "Fertilizer", products: ["pulveriser", "bagging", "material-handling"] },
  { name: "Sugar", products: ["pulveriser", "air-classifier", "material-handling"] },
  { name: "Cement & Minerals", products: ["jaw-crusher", "pulveriser", "air-classifier", "material-handling"] },
  { name: "Steel & Industrial", products: ["jaw-crusher", "material-handling", "electromagnetic"] },
  { name: "Warehousing", products: ["bagging", "material-handling", "electromagnetic"] },
]

export function IndustryProductMapping() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [hoveredIndustry, setHoveredIndustry] = useState<string | null>(null)

  const isHighlighted = (industryName: string, productId: string) => {
    const industry = industries.find(i => i.name === industryName)
    if (!industry) return false
    
    const hasProduct = industry.products.includes(productId)
    
    if (hoveredProduct) {
      return productId === hoveredProduct && hasProduct
    }
    if (hoveredIndustry) {
      return industryName === hoveredIndustry && hasProduct
    }
    return hasProduct
  }

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">
            Product-to-Industry Mapping
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Find the right TYCO machinery for your industry. Hover over products or industries to see matches.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-foreground bg-muted/50 rounded-tl-lg">
                  Industry / Product
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="p-3 text-center text-xs font-semibold text-foreground bg-muted/50 last:rounded-tr-lg cursor-pointer transition-colors hover:bg-primary/10"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <Link href={`/products/${product.slug}`} className="hover:text-primary">
                      {product.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {industries.map((industry, index) => (
                <tr
                  key={industry.name}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                    hoveredIndustry === industry.name ? "bg-primary/5" : ""
                  }`}
                  onMouseEnter={() => setHoveredIndustry(industry.name)}
                  onMouseLeave={() => setHoveredIndustry(null)}
                >
                  <td className={`p-4 text-sm font-medium text-foreground ${
                    index === industries.length - 1 ? "rounded-bl-lg" : ""
                  }`}>
                    {industry.name}
                  </td>
                  {products.map((product, pIndex) => {
                    const hasProduct = industry.products.includes(product.id)
                    const highlighted = isHighlighted(industry.name, product.id)
                    
                    return (
                      <td
                        key={product.id}
                        className={`p-3 text-center ${
                          index === industries.length - 1 && pIndex === products.length - 1 ? "rounded-br-lg" : ""
                        }`}
                      >
                        {hasProduct && (
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all ${
                            highlighted 
                              ? "bg-primary text-primary-foreground scale-110" 
                              : "bg-primary/20 text-primary"
                          }`}>
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          Click on any product name to view detailed specifications
        </motion.p>
      </div>
    </section>
  )
}
