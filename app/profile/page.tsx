"use client"

import { Sidebar } from "@/components/sidebar"
import { ProfileView } from "@/components/profile/profile-view"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getProfileByUserId } from "@/lib/firebase/profiles"
import { Skeleton } from "@/components/ui/skeleton"
import { Profile } from "@/types/profile"
import { doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface OnboardingPreferences {
  companyName: string
  location: {
    address: string
  }
  budget: {
    min: number
    max: number
  }
  role: string
  preferences: {
    cleanliness: string
    smoking: string
    pets: string
    lifestyle: string
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch user profile using the utility function
        const profileData = await getProfileByUserId(user.uid)
        if (profileData) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="sticky top-0 h-full">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto h-full">
          <div className="bg-gray-50 min-h-full p-6">
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  const formatDate = (date: Date | Timestamp | undefined | string) => {
    if (!date) return undefined
    let dateObj: Date
    if (date instanceof Timestamp) {
      dateObj = date.toDate()
    } else if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return undefined
    }
    if (isNaN(dateObj.getTime())) return undefined
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formattedProfile = profile ? {
    name: profile.name,
    role: profile.role,
    company: profile.company,
    location: profile.location,
    monthlyBudget: `$${profile.monthlyBudget.toLocaleString()}`,
    bio: profile.bio,
    email: profile.email,
    phone: profile.phone,
    school: profile.school,
    gender: profile.gender,
    profileImage: profile.profileImage,
    internshipDates: {
      term: profile.internshipSeason,
      year: profile.internshipYear
    },
    preferences: {
      cleanliness: "", // These fields are not in our Profile type
      smoking: "",
      pets: "",
      lifestyle: ""
    },
    moveInDate: profile.moveInDate ? formatDate(profile.moveInDate) : undefined
  } : undefined

  return (
    <div className="flex h-full">
      <div className="sticky top-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <div className="bg-gray-50 min-h-full">
          <ProfileView profile={formattedProfile} />
        </div>
      </main>
    </div>
  )
} 