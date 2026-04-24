import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientsHero } from "@/components/clients/clients-hero"
import { ClientsFilterGrid } from "@/components/clients/clients-filter-grid"
import { ClientsCTA } from "@/components/clients/clients-cta"

export const metadata = {
  title: "Our Clients | TYCO India",
  description: "TYCO products are used by a broad base of industrial customers across multiple applications. Trusted by industrial leaders.",
}

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ClientsHero />
      <ClientsFilterGrid />
      <ClientsCTA />
      <Footer />
    </main>
  )
}
