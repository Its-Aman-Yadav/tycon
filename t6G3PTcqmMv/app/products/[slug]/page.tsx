import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetailTemplate } from "@/components/products/product-detail-template"
import { RelatedProducts } from "@/components/products/related-products"
import { notFound } from "next/navigation"
import { products, getProductBySlug } from "@/lib/products-data"

// Generate static params for all products
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }))
}

// Generate metadata for each product
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  
  if (!product) {
    return { title: "Product Not Found | TYCO India" }
  }
  
  return {
    title: `${product.name} ${product.model} | TYCO India Industrial Machinery`,
    description: product.tagline,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <ProductDetailTemplate product={product} />
      <RelatedProducts currentProductId={product.id} category={product.category} />
      <Footer />
    </main>
  )
}
