import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EnquiryHero } from "@/components/enquiry/enquiry-hero"
import { EnquiryForm } from "@/components/enquiry/enquiry-form"
import { ContactInfo } from "@/components/enquiry/contact-info"
import { LocationMap } from "@/components/enquiry/location-map"

export const metadata = {
  title: "Send Enquiry | TYCO India",
  description: "Contact TYCO India for industrial machinery enquiries. Share your process, application, and capacity needs with our team.",
}

export default function EnquiryPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <EnquiryHero />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <EnquiryForm />
            </div>
            <div>
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
      <LocationMap />
      <Footer />
    </main>
  )
}
