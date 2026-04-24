"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Send, CheckCircle, Download } from "lucide-react"

const products = [
  { value: "", label: "Select a product" },
  { value: "pulveriser", label: "Pulveriser" },
  { value: "spices-pulverizer", label: "Spices Pulverizer" },
  { value: "automatic-weighing-bagging-machine", label: "Automatic Weighing & Bagging Machine" },
  { value: "air-classifier", label: "Air Classifier" },
  { value: "material-handling-equipments", label: "Material Handling Equipments" },
  { value: "jaw-crusher", label: "Jaw Crusher" },
  { value: "electromagnetic-vibrator", label: "Electromagnetic Vibrator" },
  { value: "other", label: "Other / Multiple Products" },
]

const industries = [
  { value: "", label: "Select your industry" },
  { value: "food-processing", label: "Food Processing" },
  { value: "spices-processing", label: "Spices Processing" },
  { value: "chemicals", label: "Chemicals" },
  { value: "fertilizer", label: "Fertilizer" },
  { value: "sugar", label: "Sugar" },
  { value: "cement-minerals", label: "Cement and Minerals" },
  { value: "steel-industrial", label: "Steel and Industrial Processing" },
  { value: "warehousing-packaging", label: "Warehousing and Packaging" },
  { value: "other", label: "Other" },
]

const applications = [
  { value: "", label: "Select application type" },
  { value: "grinding", label: "Grinding / Pulverizing" },
  { value: "classification", label: "Classification / Separation" },
  { value: "bagging", label: "Weighing / Bagging" },
  { value: "crushing", label: "Crushing" },
  { value: "material-handling", label: "Material Handling / Conveying" },
  { value: "feeding", label: "Feeding / Vibrating" },
  { value: "complete-system", label: "Complete System / Turnkey" },
  { value: "other", label: "Other" },
]

const requirementTypes = [
  { value: "", label: "Select requirement type" },
  { value: "new-purchase", label: "New Equipment Purchase" },
  { value: "replacement", label: "Replacement of Existing Machine" },
  { value: "capacity-expansion", label: "Capacity Expansion" },
  { value: "spare-parts", label: "Spare Parts" },
  { value: "service-maintenance", label: "Service / Maintenance" },
  { value: "consultation", label: "Technical Consultation" },
  { value: "quotation", label: "Price Quotation" },
]

const countries = [
  { value: "", label: "Select your country" },
  { value: "india", label: "India" },
  { value: "uae", label: "United Arab Emirates" },
  { value: "saudi-arabia", label: "Saudi Arabia" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "nepal", label: "Nepal" },
  { value: "sri-lanka", label: "Sri Lanka" },
  { value: "kenya", label: "Kenya" },
  { value: "nigeria", label: "Nigeria" },
  { value: "south-africa", label: "South Africa" },
  { value: "usa", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "other", label: "Other" },
]

export function EnquiryForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestBrochure, setRequestBrochure] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 rounded-2xl bg-card border border-border text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-display">Thank You!</h2>
        <p className="mt-4 text-muted-foreground">
          Your enquiry has been submitted successfully. Our team will contact you within 24 hours.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="mt-8"
        >
          Submit Another Enquiry
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8 lg:p-12 rounded-2xl bg-card border border-border">
        <h2 className="text-2xl font-bold text-foreground font-display mb-2">Enquiry Form</h2>
        <p className="text-muted-foreground mb-8">Fill in your details and requirements below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Company */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Name <span className="text-primary">*</span>
              </label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Your full name"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company <span className="text-primary">*</span>
              </label>
              <Input
                id="company"
                name="company"
                required
                placeholder="Company name"
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Industry and Country */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-foreground mb-2">
                Industry <span className="text-primary">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                required
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                Country <span className="text-primary">*</span>
              </label>
              <select
                id="country"
                name="country"
                required
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product and Application */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-foreground mb-2">
                Product of Interest <span className="text-primary">*</span>
              </label>
              <select
                id="product"
                name="product"
                required
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {products.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="application" className="block text-sm font-medium text-foreground mb-2">
                Application Type
              </label>
              <select
                id="application"
                name="application"
                className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {applications.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Requirement Type */}
          <div>
            <label htmlFor="requirementType" className="block text-sm font-medium text-foreground mb-2">
              Requirement Type <span className="text-primary">*</span>
            </label>
            <select
              id="requirementType"
              name="requirementType"
              required
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {requirementTypes.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Contact fields */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email <span className="text-primary">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="bg-background border-border"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone <span className="text-primary">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message / Requirements <span className="text-primary">*</span>
            </label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Please describe your requirements, including material to be processed, capacity needed, and any specific needs..."
              className="bg-background border-border resize-none"
            />
          </div>

          {/* Brochure Request Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requestBrochure"
              name="requestBrochure"
              checked={requestBrochure}
              onChange={(e) => setRequestBrochure(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <label htmlFor="requestBrochure" className="text-sm text-muted-foreground flex items-center gap-2">
              <Download className="w-4 h-4" />
              Also send me the product brochure
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Enquiry
              </span>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
