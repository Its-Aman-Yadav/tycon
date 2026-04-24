import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  company: [
    { name: "About TYCO", href: "/about" },
    { name: "Industries Served", href: "/industries" },
    { name: "Clients", href: "/clients" },
    { name: "Testimonials", href: "/testimonials" },
  ],
  products: [
    { name: "Pulveriser", href: "/products/pulveriser" },
    { name: "Spices Pulverizer", href: "/products/spices-pulverizer" },
    { name: "Weighing & Bagging Machine", href: "/products/automatic-weighing-bagging-machine" },
    { name: "Air Classifier", href: "/products/air-classifier" },
    { name: "Jaw Crusher", href: "/products/jaw-crusher" },
  ],
  support: [
    { name: "Send Enquiry", href: "/enquiry" },
    { name: "All Products", href: "/products" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image 
                src="/tyco-india-logo.png" 
                alt="TYCO India" 
                width={140} 
                height={45} 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              Manufacturing excellence since 1977. TYCO India is a leading manufacturer of industrial machinery, 
              trusted by global industries for precision engineering and reliable performance.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>C-68, M.I.D.C. Industrial Area, Hingna, Nagpur – 440028</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 83084 89200 / 94224 44120</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>sales@tyco-india.com</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex justify-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TYCO India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
