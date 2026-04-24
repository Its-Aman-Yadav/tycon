"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Building2, Check } from "lucide-react"
import { clients } from "@/lib/products-data"

const productCategories = [
  { id: "bagging", name: "Automatic Weighing & Bagging Machine" },
  { id: "pulveriser", name: "Pulveriser" },
  { id: "air-classifier", name: "Air Classifier" },
  { id: "jaw-crusher", name: "Jaw Crusher" },
  { id: "electromagnetic-vibrator", name: "Electromagnetic Vibrator" },
]

// Updated client data with actual logos

export function ClientsFilterGrid() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(p => p !== productId)
        : [...prev, productId]
    )
  }

  const clearFilters = () => {
    setSelectedProducts([])
    setSearchQuery("")
  }

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Must have a logo
      if (!client.logo) return false
      
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Filter by selected products (if any selected, show clients with ANY of the selected products)
      const matchesProducts = selectedProducts.length === 0 || 
        selectedProducts.some(product => client.products.includes(product))
      
      return matchesSearch && matchesProducts
    })
  }, [selectedProducts, searchQuery])

  const hasActiveFilters = selectedProducts.length > 0 || searchQuery !== ""

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Filter Section */}
        <div className="mb-12">
          <div className="flex flex-col gap-6">
            {/* Product Category Pills */}
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

            {/* Search and Clear */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted/20 hover:bg-muted/40"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground font-medium">
              Showing {filteredClients.length} of {clients.filter(c => c.logo).length} trusted partners
            </p>
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
                <div className="h-full aspect-[3/2] rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
                  {client.logo ? (
                    <div className="relative w-full h-full transition-all duration-500 transform group-hover:scale-110">
                      <Image
                        src={client.logo}
                        alt={`${client.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="font-semibold text-foreground text-xs leading-tight line-clamp-2 uppercase tracking-wider">{client.name}</h3>
                    </div>
                  )}
                  
                  {/* Tooltip-like company name on hover for logos */}
                  {client.logo && (
                    <div className="absolute inset-x-0 bottom-0 py-2 bg-background/90 backdrop-blur-sm border-t border-border translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-[10px] font-bold text-foreground truncate px-2 uppercase tracking-tighter">
                        {client.name}
                      </p>
                    </div>
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
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
