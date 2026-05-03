"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { clients } from "@/lib/products-data"

const productCategories = [
  { id: "automatic-weighing-bagging-machine", name: "Automatic Weighing & Bagging Machine" },
  { id: "pulveriser", name: "Pulveriser" },
  { id: "air-classifier", name: "Air Classifier" },
  { id: "jaw-crusher", name: "Jaw Crusher" },
  { id: "electromagnetic-vibrator", name: "Electromagnetic Vibrator" },
]

// Updated client data with actual logos

export function ClientsFilterGrid() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(p => p !== productId)
        : [...prev, productId]
    )
  }

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filter by selected products (if any selected, show clients with ANY of the selected products)
      const matchesProducts = selectedProducts.length === 0 || 
        selectedProducts.some(product => client.products.includes(product))
      
      return matchesProducts
    })
  }, [selectedProducts])

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-12">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3 font-medium">Filter by Product Integration:</p>
              <div className="flex flex-wrap gap-2.5">
                {productCategories.map((product) => {
                  const isSelected = selectedProducts.includes(product.id)
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium 
                        transition-all duration-300 border
                        ${isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-muted/30"
                        }
                      `}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {product.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Client Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group h-full"
              >
                <div className="h-full aspect-[3/2] rounded-xl bg-card border border-border flex flex-col items-center justify-center p-4 text-center overflow-hidden">
                  {client.logo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={client.logo}
                        alt={`${client.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{client.name}</h3>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
