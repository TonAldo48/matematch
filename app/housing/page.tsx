"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from "@/components/sidebar"
import { HousingContent } from "@/components/housing/housing-content"

export default function HousingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "find-housing"

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, router])

  if (!user) {
    return null
  }

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