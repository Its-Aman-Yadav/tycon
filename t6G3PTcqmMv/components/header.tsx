"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About TYCO", href: "/about" },
  { 
    name: "Products", 
    href: "/products",
    submenu: [
      { name: "Pulveriser", href: "/products/pulveriser" },
      { name: "Spices Pulverizer", href: "/products/spices-pulverizer" },
      { name: "Automatic Weighing & Bagging Machine", href: "/products/automatic-weighing-bagging-machine" },
      { name: "Air Classifier", href: "/products/air-classifier" },
      { name: "Material Handling Equipments", href: "/products/material-handling-equipments" },
      { name: "Jaw Crusher", href: "/products/jaw-crusher" },
      { name: "Electromagnetic Vibrator", href: "/products/electromagnetic-vibrator" },
    ]
  },
  { name: "Industries Served", href: "/industries" },
  { name: "Clients", href: "/clients" },
  { name: "Testimonials", href: "/testimonials" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
            <Image 
              src="/tyco-india-logo.png" 
              alt="TYCO India" 
              width={160} 
              height={50} 
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {item.name}
                {item.submenu && <ChevronDown className="h-4 w-4" />}
              </Link>
              
              {item.submenu && activeSubmenu === item.name && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-md bg-card border border-border shadow-lg py-2 animate-in fade-in-10 slide-in-from-top-2">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/enquiry">Send Enquiry</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="space-y-1 px-6 py-4">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                {item.submenu && (
                  <div className="pl-4 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/enquiry">Send Enquiry</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
