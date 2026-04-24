import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { IndustriesHero } from "@/components/industries/industries-hero"
import { IndustriesGrid } from "@/components/industries/industries-grid"
import { IndustryProductMapping } from "@/components/industries/industry-product-mapping"
import { IndustriesCTA } from "@/components/industries/industries-cta"

export const metadata = {
  title: "Industries Served | TYCO India",
  description: "TYCO machinery supports a broad range of industrial processing and handling applications across food, spices, chemicals, fertilizer, sugar, cement, steel, and warehousing sectors.",
}

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <IndustriesHero />
      <IndustriesGrid />
      <IndustryProductMapping />
      <IndustriesCTA />
      <Footer />
    </main>
  )
}
