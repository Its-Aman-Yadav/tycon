"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Building } from "lucide-react"

const clientLogos = [
  { name: "Tata Steel", logo: "/FinalLogo/Tatasteel.png" },
  { name: "Jindal Steel", logo: "/FinalLogo/Jindalsteel.png" },
  { name: "Dabur", logo: "/FinalLogo/Dabur.png" },
  { name: "Himalaya", logo: "/clients/Himalaya%20logo.png" },
  { name: "Indian Herbs", logo: "/FinalLogo/Indianherbs.png" },
  { name: "Pan Brand", logo: "/FinalLogo/Panbrand.png" },
  { name: "SP Group", logo: "/FinalLogo/SPRefractories.png" },
  { name: "Sail", logo: "/FinalLogo/Sail.png" },
  { name: "Usha Martin", logo: "/FinalLogo/Ushamartin.png" },
  { name: "Welspun Energy", logo: "/FinalLogo/Wellspun.png" },
  { name: "Arti", logo: "/FinalLogo/Arti.png" },
  { name: "HIL", logo: "/clients/HIL%20logo.jfif" },
  { name: "ACB", logo: "/FinalLogo/ACB.png" },
  { name: "AVP", logo: "/FinalLogo/AVP.png" },
  { name: "Hira", logo: "/FinalLogo/Hira.png" },
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
