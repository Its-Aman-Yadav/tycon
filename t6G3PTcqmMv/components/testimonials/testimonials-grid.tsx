"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "We installed the Automatic Weighing and Bagging Machine for our fertilizer packing line. The consistency of bag weights has improved significantly, and the output rate meets our daily dispatch requirements reliably.",
    customerName: "Operations Manager",
    industry: "Fertilizer",
    product: "Automatic Weighing & Bagging Machine",
    productSlug: "automatic-weighing-bagging-machine",
  },
  {
    quote: "The Pulveriser handles our industrial grinding work without issues. We process hard materials daily, and the machine has maintained steady performance over the past three years with minimal downtime.",
    customerName: "Plant Supervisor",
    industry: "Chemicals",
    product: "Pulveriser",
    productSlug: "pulveriser",
  },
  {
    quote: "For our spice processing unit, the Spices Pulverizer was the right choice. It preserves the aroma and colour of our products, which is critical for customer acceptance. The build quality is solid.",
    customerName: "Production Head",
    industry: "Food Processing",
    product: "Spices Pulverizer",
    productSlug: "spices-pulverizer",
  },
  {
    quote: "We use the Air Classifier to achieve consistent fineness in our powder output. The separation efficiency has helped us meet product specifications without repeated rework.",
    customerName: "Quality Control Manager",
    industry: "Minerals Processing",
    product: "Air Classifier",
    productSlug: "air-classifier",
  },
  {
    quote: "The Material Handling system TYCO supplied for our plant has streamlined our internal logistics. Conveyors, elevators, and feeders work well together, reducing manual handling and improving overall efficiency.",
    customerName: "Maintenance Engineer",
    industry: "Steel Processing",
    product: "Material Handling Equipments",
    productSlug: "material-handling-equipments",
  },
]

export function TestimonialsGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.product}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 flex flex-col">
                <Quote className="w-8 h-8 text-primary/30 mb-4 flex-shrink-0" />

                <blockquote className="text-foreground leading-relaxed mb-6 flex-grow">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                <div className="pt-4 border-t border-border space-y-3">
                  <div>
                    <div className="font-medium text-foreground">{testimonial.customerName}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.industry}</div>
                  </div>
                  
                  <a 
                    href={`/products/${testimonial.productSlug}`}
                    className="inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {testimonial.product}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
