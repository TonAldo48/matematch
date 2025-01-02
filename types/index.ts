import { LucideIcon } from "lucide-react"

export interface RouteConfig {
  label: string
  icon: LucideIcon
  href?: string
  items?: {
    label: string
    icon: LucideIcon
    href: string
  }[]
}

export interface InterestedUser {
  id: string
  name: string
  company: string
  role: string
  email?: string
  dates: string
}

export interface ListingInterest {
  listingId: string
  listingTitle: string
  listingUrl: string
  users: InterestedUser[]
  timestamp: number
}

export interface SavedListing {
  id: string
  userId: string
  listingId: string
  listingTitle: string
  listingUrl: string
  listingImage: string
  price: {
    amount: number
    currency: string
    period: string
  }
  savedAt: number
  notes?: string
} 