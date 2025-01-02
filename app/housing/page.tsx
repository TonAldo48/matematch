"use client"

import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { HousingContent } from "@/components/housing/housing-content"

export default function HousingPage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "find-housing"

  return (
    <div className="flex h-full">
      <div className="sticky top-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <div className="p-6 bg-gray-50 min-h-full">
          <HousingContent defaultTab={tab} />
        </div>
      </main>
    </div>
  )
} 