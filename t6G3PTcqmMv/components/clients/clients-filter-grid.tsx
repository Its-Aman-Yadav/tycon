"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Building2, Check } from "lucide-react"

const productCategories = [
  { id: "bagging", name: "Automatic Weighing & Bagging Machine" },
  { id: "pulveriser", name: "Pulveriser" },
  { id: "air-classifier", name: "Air Classifier" },
  { id: "jaw-crusher", name: "Jaw Crusher" },
  { id: "electromagnetic-vibrator", name: "Electromagnetic Vibrator" },
]

// Updated client data with actual logos
const clients = [
  { id: 4, name: "Tata Steel", logo: "/clients/Tata%20Steel%20Logo.png", products: ["jaw-crusher", "electromagnetic-vibrator"] },
  { id: 6, name: "SAIL", logo: "/clients/Sail%20Logio.png", products: ["jaw-crusher", "electromagnetic-vibrator"] },
  { id: 7, name: "Jindal Steel", logo: "/clients/Jindal_Steel_Limited_Logo.png", products: ["jaw-crusher", "air-classifier"] },
  { id: 8, name: "Dabur India", logo: "/clients/Dabur%20logo.png", products: ["pulveriser", "bagging"] },
  { id: 9, name: "Hindustan Unilever", logo: "/clients/Hindustan_Unilever_Logo%201.png", products: ["bagging", "air-classifier"] },
  { id: 10, name: "Aarti Industries", logo: "/clients/Arti%20logo.png", products: ["pulveriser", "bagging"] },
  { id: 12, name: "Himalaya Wellness", logo: "/clients/Himalaya%20logo.png", products: ["pulveriser", "bagging"] },
  { id: 13, name: "HIL Limited", logo: "/clients/HIL%20logo.jfif", products: ["pulveriser", "jaw-crusher"] },
  { id: 14, name: "AWL Agri Business", logo: "/clients/AWL_Agri_Business_Logo_COLOUR_RGB-2.png", products: ["bagging"] },
  { id: 15, name: "Arya Vaidya Pharmacy", logo: "/clients/AVP%20logo.jfif", products: ["pulveriser", "air-classifier"] },
  { id: 16, name: "Kores India", logo: "/clients/Kores%20Logo.jfif", products: ["pulveriser", "bagging"] },
  { id: 17, name: "Usha Martin", logo: "/clients/Usha%20Martin%20Logo.png", products: ["jaw-crusher", "electromagnetic-vibrator"] },
  { id: 18, name: "RHI Magnesita", logo: "/clients/RHI%20Magnesita%20Logo.png", products: ["pulveriser", "air-classifier"] },
  { id: 21, name: "Kisanveer Satara", logo: "/clients/Kisanveer%20Satara%20SSKL.png", products: ["pulveriser", "bagging"] },
  { id: 22, name: "Maithan Ceramic", logo: "/clients/Maithan%20Ceramic%20Ltd.png", products: ["pulveriser", "jaw-crusher"] },
  { id: 23, name: "Natural Remedies", logo: "/clients/Natural%20remedies%20logo.jfif", products: ["pulveriser", "air-classifier"] },
  { id: 24, name: "Oushadhi", logo: "/clients/Oushadhi%20logo.jfif", products: ["pulveriser", "bagging"] },
  { id: 25, name: "TRL Krosaki", logo: "/clients/trl_krosaki_refractories_limited%20logo.jfif", products: ["pulveriser", "jaw-crusher"] },
  { id: 26, name: "Shilpa Steel", logo: "/clients/Shilpa%20Steel%20Logo.png", products: ["jaw-crusher", "pulveriser"] },
  { id: 27, name: "Welspun Energy", logo: "/clients/Welspun_Energy_Logo.png", products: ["bagging", "electromagnetic-vibrator"] },
  { id: 28, name: "Sanghvi Food", logo: "/clients/Sanghvi%20food%20logo.webp", products: ["bagging", "pulveriser"] },
  { id: 29, name: "Zenex (Ayurvet)", logo: "/clients/Zenex%20Logo%20(Ayurvet%20Ltd).png", products: ["pulveriser", "air-classifier"] },
  { id: 30, name: "Adhunik Group", logo: "/clients/adhuniklogo.png", products: ["jaw-crusher", "pulveriser"] },
  { id: 31, name: "Hira Group", logo: "/clients/hira-logo.png", products: ["jaw-crusher", "electromagnetic-vibrator"] },
  { id: 32, name: "Parakh Agro", logo: "/clients/parakh-agro%20logo.png", products: ["bagging", "pulveriser"] },
  { id: 33, name: "KCI", logo: "/clients/kci-logo.png", products: ["bagging", "air-classifier"] },
  { id: 34, name: "ECOF", logo: "/clients/ecof-logo.png", products: ["pulveriser", "bagging"] },
  { id: 35, name: "Rashmi Group", logo: "/clients/Rashmi%20Grp%20Logo.png", products: ["jaw-crusher", "pulveriser"] },
  { id: 36, name: "Monnet Group", logo: "/clients/Monnet%20Grp%20logo.jpg", products: ["jaw-crusher", "electromagnetic-vibrator"] },
  { id: 37, name: "Tamilnadu Magnesite", logo: "/clients/Tamilnadu%20magnesite%20logo.jfif", products: ["pulveriser", "jaw-crusher"] },
  { id: 38, name: "Arya Vaidya Sala", logo: "/clients/Arya%20Vaidya%20sala%20kottakkal.jfif", products: ["pulveriser", "air-classifier"] },
  { id: 39, name: "ACB", logo: "/clients/ACB%20logo.jfif", products: ["pulveriser", "jaw-crusher"] },
  { id: 40, name: "Indian Herbs", logo: "/clients/Indian%20Herbs%20logo.jfif", products: ["pulveriser", "bagging"] },
  { id: 41, name: "Pan Brand", logo: "/clients/Pan%20brand%20logo.jfif", products: ["pulveriser", "bagging"] },
  { id: 42, name: "SP Group", logo: "/clients/SP%20Logo.png", products: ["jaw-crusher", "electromagnetic-vibrator"] },
]

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
