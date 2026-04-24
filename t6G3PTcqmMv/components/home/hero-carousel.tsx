"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

const carouselItems = [
  { src: "/products/carousel/P-01_tyco-india-pulverizer.jpg", alt: "Industrial Pulverizer" },
  { src: "/products/carousel/P-02_tyco-india-spices-pulverizer.jpg", alt: "Spices Pulverizer" },
  { src: "/products/carousel/P-03_tyco-india-weighing-bagging-machine.jpg", alt: "Weighing & Bagging Machine" },
  { src: "/products/carousel/P-04_tyco-india-air-classifiers.jpg", alt: "Air Classifier" },
  { src: "/products/carousel/P-05_tyco-india-material-handling-equipments.jpg", alt: "Material Handling Equipment" },
  { src: "/products/carousel/P-06_tyco-india-jaw-crusher.jpg", alt: "Jaw Crusher" },
  { src: "/products/carousel/P-07_tyco-india-electromagnetic-vibrator.jpg", alt: "Electromagnetic Vibrator" },
]

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const plugin = React.useMemo(
    () => Autoplay({ delay: 6000, stopOnInteraction: false }),
    []
  )

  React.useEffect(() => {
    if (!api) return

    // Force start autoplay
    const autoplay = api.plugins()?.autoplay
    if (autoplay) {
      autoplay.play()
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Carousel
          setApi={setApi}
          plugins={[plugin]}
          className="w-full relative group"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-0">
            {carouselItems.map((item, index) => (
              <CarouselItem key={index} className="pl-0 basis-full">
                <div className="p-1">
                  <div className="relative aspect-[21/9] md:aspect-[21/8] rounded-3xl overflow-hidden bg-white border border-border group/item shadow-2xl transition-all duration-300">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover"
                    />
                    {/* Subtle gradient for depth without text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex">
            <CarouselPrevious className="left-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/20 hover:bg-primary text-white border-white/20 backdrop-blur-sm shadow-2xl size-14" />
            <CarouselNext className="right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/20 hover:bg-primary text-white border-white/20 backdrop-blur-sm shadow-2xl size-14" />
          </div>
          
          {/* Functional manual indicators */}
          <div className="mt-10 flex justify-center gap-3">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 transition-all duration-300 rounded-full ${
                  current === index 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-border hover:bg-primary/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  )
}
