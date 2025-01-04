"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface CompanyLogoProps {
  company: string
  className?: string
}

export function CompanyLogo({ company, className }: CompanyLogoProps) {
  // Common tech companies with known domains
  const commonDomains: { [key: string]: string } = {
    "Google": "google.com",
    "Meta": "meta.com",
    "Apple": "apple.com",
    "Microsoft": "microsoft.com",
    "Amazon": "amazon.com"
  }

  const domain = commonDomains[company] || `${company.toLowerCase().replace(/\s+/g, '')}.com`
  const logoUrl = `https://logo.clearbit.com/${domain}`

  return (
    <div className={cn("relative w-8 h-8", className)}>
      <Image
        src={logoUrl}
        alt={`${company} logo`}
        fill
        className="object-contain"
        onError={(e) => {
          // Fallback to initials
          e.currentTarget.style.display = 'none'
          const fallback = e.currentTarget.parentElement
          if (fallback) {
            fallback.innerHTML = `
              <div class="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <span class="text-sm font-medium text-gray-600">
                  ${company[0]}
                </span>
              </div>
            `
          }
        }}
      />
    </div>
  )
} 