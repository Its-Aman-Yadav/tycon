"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Send } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,130,32,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,130,32,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/50" />
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">Since 1977</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight font-display text-balance">
              Engineered Industrial Processing Systems{" "}
              <span className="text-primary">Since 1977</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 text-pretty">
              TYCO India manufactures rugged industrial machinery for grinding, classification, 
              bagging, and material handling across multiple industries.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                <Link href="/products" className="flex items-center gap-2">
                  Explore Products
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:bg-muted group">
                <Link href="/enquiry" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Enquiry
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image/Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-card border border-border">
              {/* Industrial machinery visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full p-8">
                  {/* Abstract machinery representation */}
                  <div className="absolute inset-8 border border-primary/20 rounded-lg" />
                  <div className="absolute inset-16 border border-primary/30 rounded-lg animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                  
                  {/* Gear icons */}
                  <div className="absolute top-12 right-12 w-16 h-16 border-4 border-primary/40 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/20 rounded-full" />
                  </div>
                  <div className="absolute bottom-16 left-12 w-12 h-12 border-4 border-muted-foreground/30 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: "8s" }}>
                    <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
                  </div>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary font-display">47+</div>
                      <div className="text-sm text-muted-foreground mt-2">Years of Excellence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stats card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">1500+</div>
                  <div className="text-xs text-muted-foreground">Satisfied Customers</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
