import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { StatsSection } from "@/components/home/stats-section"
import { ProductsSection } from "@/components/home/products-section"
import { AboutPreview } from "@/components/home/about-preview"
import { IndustriesSection } from "@/components/home/industries-section"
import { WhyChooseSection } from "@/components/home/why-choose-section"
import { ApplicationGallery } from "@/components/home/application-gallery"
import { ClientsPreview } from "@/components/home/clients-preview"
import { TestimonialsPreview } from "@/components/home/testimonials-preview"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      {/* 1. Hero Section */}
      <HeroSection />
      {/* 1.5. Product Carousel */}
      <HeroCarousel />
      {/* 2. Trust Strip */}
      <StatsSection />
      {/* 3. Product Range Overview */}
      <ProductsSection />
      {/* 4. About TYCO Preview */}
      <AboutPreview />
      {/* 5. Industries Served */}
      <IndustriesSection />
      {/* 6. Why Choose TYCO */}
      <WhyChooseSection />
      {/* 7. Application Gallery */}
      <ApplicationGallery />
      {/* 8. Clients Preview */}
      <ClientsPreview />
      {/* 9. Testimonials Preview */}
      <TestimonialsPreview />
      {/* 10. Enquiry CTA */}
      <CTASection />
      <Footer />
    </main>
  )
}
