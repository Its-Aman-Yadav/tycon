import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AboutHero } from "@/components/about/about-hero"
import { CompanyStory } from "@/components/about/company-story"
import { WhatWeDo } from "@/components/about/what-we-do"
import { Values } from "@/components/about/values"
import { ManufacturingReach } from "@/components/about/manufacturing-reach"
import { AboutCTA } from "@/components/about/about-cta"

export const metadata = {
  title: "About TYCO India | Industrial Engineering Since 1977",
  description: "TYCO India - Manufacturer of industrial processing equipment since 1977. Factory in Nagpur serving multiple process industries with practical and durable solutions.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AboutHero />
      <CompanyStory />
      <WhatWeDo />
      <Values />
      <ManufacturingReach />
      <AboutCTA />
      <Footer />
    </main>
  )
}
