"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  CheckCircle, 
  Shield, 
  Settings, 
  Wrench, 
  Zap, 
  Wind, 
  Volume2,
  Thermometer,
  Sparkles,
  Layers,
  Droplet,
  Cpu,
  Monitor,
  Scale,
  Package,
  Database,
  RefreshCw,
  Target,
  Link2,
  Sliders,
  ArrowUp,
  MoveHorizontal,
  Puzzle,
  Cog,
  AlertTriangle,
  CheckCircle2,
  Battery,
  VolumeX,
  Clock,
  ChevronDown,
  Building2,
  Info
} from "lucide-react"
import type { Product } from "@/lib/products-data"

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  settings: Settings,
  wrench: Wrench,
  zap: Zap,
  wind: Wind,
  volume: Volume2,
  thermometer: Thermometer,
  sparkles: Sparkles,
  layers: Layers,
  droplet: Droplet,
  cpu: Cpu,
  monitor: Monitor,
  scale: Scale,
  package: Package,
  database: Database,
  refresh: RefreshCw,
  target: Target,
  link: Link2,
  sliders: Sliders,
  repeat: RefreshCw,
  "arrow-up": ArrowUp,
  "move-horizontal": MoveHorizontal,
  puzzle: Puzzle,
  cog: Cog,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle2,
  battery: Battery,
  "volume-x": VolumeX,
  clock: Clock
}

interface ProductDetailTemplateProps {
  product: Product
}

export function ProductDetailTemplate({ product }: ProductDetailTemplateProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "performance" | "variants">("specs")
  
  return (
    <>
      {/* Section 1: Product Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-card to-muted border border-border overflow-hidden sticky top-32">
                <div className="w-full h-full flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-40 h-40 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                      <Cog className="w-20 h-20 text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-primary font-display">{product.model}</span>
                    <p className="mt-2 text-muted-foreground">{product.name}</p>
                    <p className="mt-4 text-xs text-muted-foreground">Product image placeholder</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                {product.category.replace("-", " ")}
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
                {product.name}
              </h1>
              <p className="mt-2 text-xl text-muted-foreground font-display">{product.model}</p>
              <p className="mt-4 text-lg text-primary/90 font-medium">{product.tagline}</p>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                {product.shortSummary || product.description}
              </p>

              {/* Quick Specs Pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {product.specs.map((spec) => (
                  <span key={spec} className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary border border-primary/20">
                    {spec}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/enquiry?product=${product.id}`} className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Enquiry
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-border hover:bg-muted">
                  <Download className="w-4 h-4 mr-2" />
                  Download Brochure
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Product Overview */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Overview</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
              About This Product
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-4xl">
              {product.overview}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Key Features */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Features</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
              Key Features
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || CheckCircle
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-display">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Applications */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Applications</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
              Industries &amp; Use Cases
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              The {product.name} is trusted across multiple industries for diverse applications.
            </p>
          </motion.div>

          <div className="mt-10 grid md:grid-cols-2 gap-8">
            {/* Applications */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Applications</h3>
              <div className="flex flex-wrap gap-2">
                {product.applications.map((app) => (
                  <span
                    key={app}
                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {product.industries.map((industry) => (
                  <span
                    key={industry}
                    className="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Technical Specifications */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Technical Data</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
              Specifications &amp; Performance
            </h2>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
            {[
              { id: "specs", label: "Technical Specifications" },
              { id: "performance", label: "Performance / Output" },
              { id: "variants", label: "Model Variants" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "specs" && (
              <div className="p-8 rounded-2xl bg-card border border-border overflow-x-auto">
                {/* If we have a structured table (like for Pulveriser) */}
                {product.technicalSpecsTable ? (
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border">
                        {product.technicalSpecsTable.headers.map((header) => (
                          <th key={header} className="text-left py-3 px-4 text-muted-foreground font-medium text-sm">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {product.technicalSpecsTable.rows.map((row) => (
                        <tr key={row.parameter} className="border-b border-border last:border-0">
                          <td className="py-4 px-4 text-primary font-semibold">{row.parameter}</td>
                          {row.values.map((value, i) => (
                            <td key={i} className="py-4 px-4 text-foreground">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : product.technicalSpecs ? (
                  /* Fallback to key-value specs */
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                    {Object.entries(product.technicalSpecs).map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-foreground text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-8">
                {/* Performance Output Table */}
                <div className="p-8 rounded-2xl bg-card border border-border overflow-x-auto">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Output Performance by Material</h3>
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-muted-foreground font-medium">Material</th>
                        <th className="text-center py-3 text-muted-foreground font-medium">Fineness</th>
                        <th className="text-right py-3 text-muted-foreground font-medium">Output Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.performanceData.map((data) => (
                        <tr key={data.material} className="border-b border-border last:border-0">
                          <td className="py-4 text-foreground font-medium">{data.material}</td>
                          <td className="py-4 text-center text-primary">{data.fineness}</td>
                          <td className="py-4 text-right font-mono text-foreground">{data.outputRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mesh to Micron Comparison (if available) */}
                {product.meshMicronTable && product.meshMicronTable.length > 0 && (
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <div className="flex items-start gap-3 mb-4">
                      <Info className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Mesh to Micron Reference</h4>
                        <p className="text-xs text-muted-foreground mt-1">Quick conversion guide for particle size specifications</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.meshMicronTable.map((item) => (
                        <div key={item.mesh} className="px-4 py-2 rounded-lg bg-background border border-border">
                          <span className="text-primary font-semibold">{item.mesh} mesh</span>
                          <span className="text-muted-foreground mx-2">=</span>
                          <span className="text-foreground">{item.microns} microns</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "variants" && (
              <div className="space-y-6">
                {/* Model variants table for products with detailed specs */}
                {product.variants[0]?.diameter ? (
                  <div className="p-8 rounded-2xl bg-card border border-border overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Model</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium">Diameter</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium">Rotor RPM</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium">Hammers</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium">Main Motor (HP)</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium">Blower Motor (HP)</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((variant) => (
                          <tr key={variant.model} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-4 text-primary font-bold">{variant.model}</td>
                            <td className="py-4 px-4 text-center text-foreground">{variant.diameter}</td>
                            <td className="py-4 px-4 text-center text-foreground">{variant.rotorRpm}</td>
                            <td className="py-4 px-4 text-center text-foreground">{variant.hammers}</td>
                            <td className="py-4 px-4 text-center text-foreground">{variant.mainMotorHp}</td>
                            <td className="py-4 px-4 text-center text-foreground">{variant.blowerMotorHp}</td>
                            <td className="py-4 px-4 text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/enquiry?product=${product.id}&model=${variant.model}`}>
                                  Enquire
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Card layout for simpler variants */
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.model}
                        className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-primary font-display">{variant.model}</h3>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{variant.description}</p>
                        <div className="space-y-2 text-sm">
                          {variant.capacity && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capacity</span>
                              <span className="text-foreground font-medium">{variant.capacity}</span>
                            </div>
                          )}
                          {variant.power && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Power</span>
                              <span className="text-foreground font-medium">{variant.power}</span>
                            </div>
                          )}
                        </div>
                        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                          <Link href={`/enquiry?product=${product.id}&model=${variant.model}`}>
                            Enquire About This Model
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Section 6: Additional Requirements (if available) */}
      {product.additionalRequirements && product.additionalRequirements.length > 0 && (
        <section className="py-16 lg:py-24 bg-card">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <span className="text-primary text-sm font-medium tracking-wider uppercase">Installation</span>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
                Requirements &amp; Notes
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {product.additionalRequirements.map((req, index) => (
                <motion.div
                  key={req.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 rounded-xl bg-background border border-border"
                >
                  <h3 className="text-lg font-semibold text-foreground font-display mb-4">{req.title}</h3>
                  <ul className="space-y-3">
                    {req.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Related Clients */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-medium tracking-wider uppercase">Trusted By</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
              Customers Using This Product
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedClients.map((client, index) => (
              <motion.div
                key={client}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-6 rounded-xl bg-card border border-border flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{client}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Inline Enquiry Form */}
      <ProductEnquiryForm product={product} />
    </>
  )
}

// Inline Enquiry Form Component
function ProductEnquiryForm({ product }: { product: Product }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    industry: "",
    country: "",
    product: product.name,
    model: "",
    requirements: "",
    email: "",
    phone: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Get in Touch</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground font-display">
            Enquire About {product.name}
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fill out the form below and our team will get back to you within 24 hours.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl bg-background border border-border"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Your name"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Company name"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-2">
                Industry <span className="text-primary">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                <option value="">Select industry</option>
                {product.industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                Country <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Your country"
              />
            </div>

            {/* Product */}
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-foreground mb-2">
                Product of Interest
              </label>
              <input
                type="text"
                id="product"
                name="product"
                value={formData.product}
                readOnly
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground cursor-not-allowed"
              />
            </div>

            {/* Model Variant */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-foreground mb-2">
                Preferred Model
              </label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                <option value="">Select model (optional)</option>
                {product.variants.map((variant) => (
                  <option key={variant.model} value={variant.model}>
                    {variant.model} {variant.capacity ? `- ${variant.capacity}` : variant.diameter ? `- ${variant.diameter}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="you@company.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-primary">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Requirements */}
            <div className="md:col-span-2">
              <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-2">
                Requirement Details
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
                placeholder="Please describe your application, capacity requirements, and any specific needs..."
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-xs text-muted-foreground">
              By submitting this form, you agree to be contacted by TYCO India regarding your enquiry.
            </p>
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              Submit Enquiry
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}
