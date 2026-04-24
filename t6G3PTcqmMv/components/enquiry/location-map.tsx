"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

export function LocationMap() {
  return (
    <section className="py-16 lg:py-24 bg-card/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Our Locations
          </h2>
          <p className="mt-4 text-muted-foreground">
            Manufacturing and sales presence across India
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl border border-border overflow-hidden bg-background"
        >
          {/* Map Placeholder Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(245,130,32,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,130,32,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          {/* India Outline Simplified */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-full max-w-lg opacity-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path 
                d="M200 50 L280 80 L320 150 L340 220 L300 300 L260 350 L200 380 L140 350 L100 300 L80 220 L100 150 L140 80 Z"
                className="text-primary"
              />
            </svg>
          </div>

          {/* Location Markers */}
          <div className="absolute inset-0">
            {/* Nagpur - Center India */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative group cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary/30 animate-ping" />
                <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="font-semibold text-foreground text-sm">Nagpur Works</div>
                  <div className="text-xs text-muted-foreground">Manufacturing</div>
                </div>
              </div>
            </div>

            {/* Pune - West India */}
            <div className="absolute left-[35%] top-[55%]">
              <div className="relative group cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-primary/70" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="font-semibold text-foreground text-sm">Pune Office</div>
                  <div className="text-xs text-muted-foreground">Sales & Service</div>
                </div>
              </div>
            </div>

            {/* Branch Cities - Smaller dots */}
            {[
              { name: "Mumbai", left: "28%", top: "52%" },
              { name: "Chennai", left: "55%", top: "75%" },
              { name: "Kolkata", left: "75%", top: "45%" },
              { name: "Delhi", left: "45%", top: "25%" },
              { name: "Bangalore", left: "48%", top: "72%" },
              { name: "Hyderabad", left: "52%", top: "58%" },
              { name: "Ahmedabad", left: "30%", top: "40%" },
            ].map((city) => (
              <div 
                key={city.name}
                className="absolute w-2 h-2 rounded-full bg-muted-foreground/50"
                style={{ left: city.left, top: city.top }}
                title={city.name}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg p-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Manufacturing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
                <span className="text-muted-foreground">Office</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                <span className="text-muted-foreground">Branch</span>
              </div>
            </div>
          </div>

          {/* Placeholder Label */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Pan-India Presence</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
