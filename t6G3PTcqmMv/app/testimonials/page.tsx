import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TestimonialsHero } from "@/components/testimonials/testimonials-hero"
import { TestimonialsGrid } from "@/components/testimonials/testimonials-grid"
import { TestimonialsCTA } from "@/components/testimonials/testimonials-cta"

export const metadata = {
  title: "Testimonials | TYCO India",
  description: "Read what our clients say about TYCO India. Real feedback from manufacturers who trust our industrial machinery.",
}

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <TestimonialsHero />
      <TestimonialsGrid />
      <TestimonialsCTA />
      <Footer />
    </main>
  )
}
