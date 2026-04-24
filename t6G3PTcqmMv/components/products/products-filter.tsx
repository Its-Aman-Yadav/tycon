"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "All Products" },
  { id: "grinding", name: "Grinding Equipment" },
  { id: "packaging", name: "Packaging Machines" },
  { id: "separation", name: "Separation Systems" },
  { id: "handling", name: "Material Handling" },
  { id: "crushing", name: "Crushing Equipment" },
  { id: "feeding", name: "Feeding Systems" },
]

export function ProductsFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentCategory = searchParams.get("category") || "all"

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === "all") {
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="mb-12">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              currentCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}
