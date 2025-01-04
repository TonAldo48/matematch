// Core Database Types

// Users & Authentication
interface User {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

// Profiles (Already defined, but let's refine)
interface Profile {
  id: string
  userId: string // Reference to auth user
  name: string
  email: string
  phone: string
  school: string
  role: string
  company: string
  location: string
  monthlyBudget: number
  bio: string
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
  profileImage?: string
  internshipDetails: {
    season: 'Summer' | 'Fall' | 'Winter' | 'Spring'
    year: number
    startDate: Date
    endDate: Date
  }
  housingPreferences: {
    budget: {
      min: number
      max: number
    }
    lookingForRoommates: boolean
    preferredRoommateCount?: number
    moveInDate?: Date
    moveOutDate?: Date
    preferredLocations: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// Housing Listings
interface HousingListing {
  id: string
  userId: string // Who posted it
  title: string
  description: string
  location: {
    address: string
    city: string
    state: string
    zip: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  details: {
    price: number
    bedrooms: number
    bathrooms: number
    squareFeet?: number
    furnished: boolean
    parking?: boolean
    pets?: boolean
  }
  availability: {
    startDate: Date
    endDate?: Date
    minimumStay?: number // in months
  }
  images: string[] // URLs
  amenities: string[]
  status: 'available' | 'pending' | 'rented'
  createdAt: Date
  updatedAt: Date
}

// Roommate Matches
interface RoommateMatch {
  id: string
  profileIds: string[] // Array of profile IDs
  status: 'pending' | 'accepted' | 'rejected'
  initiatorId: string
  matchScore: number
  matchCriteria: {
    company: boolean
    location: boolean
    budget: boolean
    dates: boolean
  }
  createdAt: Date
  updatedAt: Date
} 