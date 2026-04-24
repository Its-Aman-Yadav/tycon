"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Building } from "lucide-react"

const clientLogos = [
  { name: "Tata Steel", logo: "/clients/Tata%20Steel%20Logo.png" },
  { name: "Jindal Steel", logo: "/clients/Jindal_Steel_Limited_Logo.png" },
  { name: "Dabur", logo: "/clients/Dabur%20logo.png" },
  { name: "Himalaya", logo: "/clients/Himalaya%20logo.png" },
  { name: "Indian Herbs", logo: "/clients/Indian%20Herbs%20logo.jfif" },
  { name: "Pan Brand", logo: "/clients/Pan%20brand%20logo.jfif" },
  { name: "SP Group", logo: "/clients/SP%20Logo.png" },
  { name: "Sail", logo: "/clients/Sail%20Logio.png" },
  { name: "Usha Martin", logo: "/clients/Usha%20Martin%20Logo.png" },
  { name: "Welspun Energy", logo: "/clients/Welspun_Energy_Logo.png" },
  { name: "Arti", logo: "/clients/Arti%20logo.png" },
  { name: "HIL", logo: "/clients/HIL%20logo.jfif" },
  { name: "ACB", logo: "/clients/ACB%20logo.jfif" },
  { name: "AVP", logo: "/clients/AVP%20logo.jfif" },
  { name: "Hira", logo: "/clients/hira-logo.png" },
]

export function ClientsPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-card border-y border-border overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Clients</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display text-balance">
            Trusted by Industrial Leaders
          </h2>
        </motion.div>

        {/* Scrolling logo strip */}
        <div className="relative">
          {/* Logo strip with animation */}
          <div className="flex animate-scroll">
            {[...clientLogos, ...clientLogos].map((client, index) => (
              <div
                key={`${client}-${index}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <div className="w-40 h-20 rounded-lg bg-white border border-border flex items-center justify-center px-4 hover:border-primary/30 transition-colors shadow-sm">
                  <div className="relative w-full h-full">
                    <Image
                      src={client.logo}
                      alt={client.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Button asChild variant="outline">
            <Link href="/clients" className="flex items-center gap-2">
              View All Clients
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
