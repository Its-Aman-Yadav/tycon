"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { default as indiaMap } from "@svg-maps/india"

// viewBox: "0 0 612 696"
// Geo -> SVG: x = (lon-68)/(97-68)*612, y = (37-lat)/(37-8)*696

const pins = {
  hq: [
    { name: "Nagpur HQ & Works", sub: "Manufacturing · Maharashtra", cx: 233.8, cy: 380.4 },
  ],
  branch: [
    { name: "Delhi NCR", cx: 192.0, cy: 199.2, highlight: true },
    { name: "Mumbai",    cx: 103.0, cy: 430.1 },
    { name: "Ahmedabad", cx: 96.7,  cy: 335.3 },
    { name: "Kolkata",   cx: 429.7, cy: 346.3 },
    { name: "Hyderabad", cx: 221.4, cy: 470.6 },
    { name: "Chennai",   cx: 258.9, cy: 574.1 },
    { name: "Bangalore", cx: 202.4, cy: 576.7 },
  ],
}

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
          className="relative rounded-2xl border border-border overflow-hidden bg-background"
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(245,130,32,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(245,130,32,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <svg
            viewBox="0 0 612 696"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            style={{ display: "block" }}
          >
            {/* India state outlines */}
            <g
              fill="rgba(245,130,32,0.10)"
              stroke="rgba(245,130,32,0.45)"
              strokeWidth="0.6"
              strokeLinejoin="round"
            >
              {indiaMap.locations.map((loc) => (
                <path key={loc.id} d={loc.path} />
              ))}
            </g>

            {/* Branch city dots */}
            {pins.branch.map((city) => (
              <g key={city.name}>
                {city.highlight && (
                  <>
                    {/* Delhi NCR — highlighted */}
                    <circle cx={city.cx} cy={city.cy} r="14" fill="rgba(245,130,32,0.08)" />
                    <circle cx={city.cx} cy={city.cy} r="7"  fill="rgba(245,130,32,0.22)" stroke="rgba(245,130,32,0.9)" strokeWidth="1.2" />
                    <circle cx={city.cx} cy={city.cy} r="3"  fill="rgb(245,130,32)" />
                    <rect   x={city.cx + 10} y={city.cy - 16} width="70" height="28" rx="4"
                            fill="rgba(15,15,15,0.85)" stroke="rgba(245,130,32,0.5)" strokeWidth="0.8" />
                    <text x={city.cx + 16} y={city.cy - 2}
                          fontSize="9" fontWeight="700" fill="rgb(245,130,32)" fontFamily="system-ui,sans-serif">
                      Delhi NCR
                    </text>
                    <text x={city.cx + 16} y={city.cy + 9}
                          fontSize="7" fill="rgba(255,255,255,0.55)" fontFamily="system-ui,sans-serif">
                      Branch
                    </text>
                  </>
                )}
                {!city.highlight && (
                  <>
                    <circle cx={city.cx} cy={city.cy} r="4" fill="rgba(245,130,32,0.25)" stroke="rgba(245,130,32,0.55)" strokeWidth="0.8" />
                    <text x={city.cx + 6} y={city.cy + 3.5}
                          fontSize="8" fill="rgba(255,255,255,0.45)" fontFamily="system-ui,sans-serif">
                      {city.name}
                    </text>
                  </>
                )}
              </g>
            ))}

            {/* Nagpur HQ — primary pulsing marker */}
            {pins.hq.map((loc) => (
              <g key={loc.name}>
                <circle cx={loc.cx} cy={loc.cy} r="22" fill="rgba(245,130,32,0.06)" />
                <circle cx={loc.cx} cy={loc.cy} r="13" fill="rgba(245,130,32,0.20)" stroke="rgba(245,130,32,1)" strokeWidth="1.8" />
                <circle cx={loc.cx} cy={loc.cy} r="5"  fill="rgb(245,130,32)" />
                <rect   x={loc.cx + 16} y={loc.cy - 20} width="120" height="36" rx="5"
                        fill="rgba(15,15,15,0.88)" stroke="rgba(245,130,32,0.65)" strokeWidth="1" />
                <text x={loc.cx + 24} y={loc.cy - 5}
                      fontSize="10" fontWeight="700" fill="rgb(245,130,32)" fontFamily="system-ui,sans-serif">
                  {loc.name}
                </text>
                <text x={loc.cx + 24} y={loc.cy + 10}
                      fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="system-ui,sans-serif">
                  {loc.sub}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-3">
            <div className="flex items-center gap-5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary" />
                <span className="text-muted-foreground">HQ / Manufacturing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-primary/70 bg-primary/20" />
                <span className="text-muted-foreground">Branch / Sales</span>
              </div>
            </div>
          </div>

          {/* Top label */}
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Pan-India Presence</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
