"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Building2 } from "lucide-react"

const offices = [
  {
    name: "Nagpur Works",
    type: "Manufacturing",
    address: "C-68, M.I.D.C. Industrial Area\nHingna, Nagpur – 440028\nMaharashtra, India",
    phone: "+91 83084 89200 / 94224 44120",
    email: "sales@tyco-india.com",
    isPrimary: true,
  },
]

const branchCities = [
  "Mumbai", "Ahmedabad", "Chennai", "Kolkata", "Hyderabad", 
  "Bangalore", "Delhi", "Delhi NCR", "Jaipur", "Indore", "Coimbatore"
]

export function ContactInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Office Cards */}
      {offices.map((office) => (
        <div 
          key={office.name}
          className={`p-6 rounded-2xl border ${
            office.isPrimary 
              ? 'bg-primary/5 border-primary/20' 
              : 'bg-card border-border'
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              office.isPrimary ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <Building2 className={`w-5 h-5 ${office.isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{office.name}</h3>
              <span className="text-xs text-muted-foreground">{office.type}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground whitespace-pre-line">{office.address}</span>
            </div>
            <div className="flex gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a href={`tel:${office.phone}`} className="text-foreground hover:text-primary transition-colors">
                {office.phone}
              </a>
            </div>
            <div className="flex gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a href={`mailto:${office.email}`} className="text-foreground hover:text-primary transition-colors">
                {office.email}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* General Contact */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-4">General Enquiries</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <a href="tel:+918308489200" className="text-foreground hover:text-primary transition-colors block">
                +91 83084 89200
              </a>
              <a href="tel:+919422444120" className="text-foreground hover:text-primary transition-colors block">
                +91 94224 44120
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <a href="mailto:sales@tyco-india.com" className="text-foreground hover:text-primary transition-colors block">
                sales@tyco-india.com
              </a>
              <a href="mailto:himanshu@tyco-india.com" className="text-foreground hover:text-primary transition-colors block">
                himanshu@tyco-india.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Cities */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-3">Branch Presence</h3>
        <p className="text-xs text-muted-foreground mb-4">Sales and service support across India</p>
        <div className="flex flex-wrap gap-2">
          {branchCities.map((city) => (
            <span 
              key={city}
              className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
            >
              {city}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
