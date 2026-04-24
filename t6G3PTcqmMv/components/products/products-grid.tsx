"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Download, Cog, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { products } from "@/lib/products-data"

const categories = [
  { id: "all", name: "All Products" },
  { id: "grinding", name: "Grinding Equipment" },
  { id: "packaging", name: "Packaging Machines" },
  { id: "separation", name: "Separation Systems" },
  { id: "handling", name: "Material Handling" },
  { id: "crushing", name: "Crushing Equipment" },
  { id: "feeding", name: "Feeding Systems" },
]

export function ProductsGrid() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"

  const filteredProducts = currentCategory === "all" 
    ? products 
    : products.filter(p => p.category === currentCategory)

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Link href={`/products/${product.id}`} className="group block h-full">
            <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col">
              <div className="relative aspect-[4/3] rounded-xl bg-white overflow-hidden mb-4 border border-border group-hover:border-primary/20 transition-colors flex items-center justify-center">
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

              <div className="flex-1">
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                  {categories.find(c => c.id === product.category)?.name || product.category}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors font-display">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {product.tagline}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.applications.slice(0, 3).map((app) => (
                    <span
                      key={app}
                      className="px-2 py-1 text-xs rounded bg-primary/10 text-primary border border-primary/20"
                    >
                      {app}
                    </span>
                  ))}
                  {product.applications.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                      +{product.applications.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                {product.hasBrochure && (
                  <div onClick={(e) => e.preventDefault()}>
                    {product.brochures && product.brochures.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors group"
                          >
                            <Download className="w-4 h-4" />
                            Download Brochure
                            <ChevronDown className="w-3 h-3 opacity-50 group-data-[state=open]:rotate-180 transition-transform" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border-border">
                          {product.brochures.map((brochure) => (
                            <DropdownMenuItem key={brochure.url} asChild className="cursor-pointer hover:bg-muted focus:bg-muted">
                              <a href={brochure.url} download className="flex items-center w-full">
                                <Download className="w-4 h-4 mr-2 text-primary" />
                                {brochure.title}
                              </a>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Brochure
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
