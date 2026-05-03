import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientsFilterGrid } from "@/components/clients/clients-filter-grid"

export const metadata = {
  title: "Our Clients | TYCO India",
  description: "TYCO products are used by a broad base of industrial customers across multiple applications. Trusted by industrial leaders.",
}

export default function ClientsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 lg:pt-32">
        <ClientsFilterGrid />
      </div>
      <Footer />
    </main>
  )
}
