"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Cog } from "lucide-react"
import { getRelatedProducts } from "@/lib/products-data"

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const relatedProducts = getRelatedProducts(currentProductId, category, 3)

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Related Products</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
              You May Also Like
            </h2>
          </div>
          <Link 
            href="/products" 
            className="hidden sm:flex items-center gap-2 text-primary font-medium hover:underline"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/products/${product.id}`} className="group block">
                <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="relative aspect-[4/3] rounded-xl bg-white border border-border flex items-center justify-center mb-4 overflow-hidden group-hover:border-primary/20 transition-colors">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        <Cog className="w-12 h-12 text-primary/20 animate-spin-slow mb-2" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Image Coming Soon</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    {product.category.replace("-", " ")}
                  </span>
                  <h3 className="mt-2 font-semibold text-foreground group-hover:text-primary transition-colors font-display">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {product.tagline}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link 
          href="/products" 
          className="mt-8 sm:hidden flex items-center justify-center gap-2 text-primary font-medium hover:underline"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}
