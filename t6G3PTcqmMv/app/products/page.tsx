import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsHero } from "@/components/products/products-hero"
import { ProductsFilter } from "@/components/products/products-filter"
import { ProductsGrid } from "@/components/products/products-grid"
import { ProductSelector } from "@/components/products/product-selector"
import { ProductsCTA } from "@/components/products/products-cta"
import { Suspense } from "react"

export const metadata = {
  title: "Products | TYCO India Industrial Machinery",
  description: "Explore TYCO's range of industrial equipment for processing, classification, bagging, and handling designed for practical performance across multiple industries.",
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProductsHero />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Suspense fallback={<div className="text-muted-foreground">Loading products...</div>}>
            <ProductsFilter />
            <ProductsGrid />
          </Suspense>
        </div>
      </section>
      <ProductSelector />
      <ProductsCTA />
      <Footer />
    </main>
  )
}
