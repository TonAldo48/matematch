"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Users, 
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserProfile {
  firstName: string
  currentPreferencesId?: string
  hasCompletedOnboarding?: boolean
}

interface OnboardingPreferences {
  companyName: string
  role: string
  location: {
    address: string
  }
  internshipDates?: {
    term: string
    year: number
  }
}

export function HomeContent() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<OnboardingPreferences | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      
      try {
        // Fetch user profile
        const userProfileRef = doc(db, "userProfiles", user.uid)
        const userProfileSnap = await getDoc(userProfileRef)
        
        if (userProfileSnap.exists()) {
          const profileData = userProfileSnap.data() as UserProfile
          setProfile(profileData)

          // If user has preferences, fetch them
          if (profileData.currentPreferencesId) {
            const preferencesRef = doc(db, "onboardingPreferences", profileData.currentPreferencesId)
            const preferencesSnap = await getDoc(preferencesRef)
            
            if (preferencesSnap.exists()) {
              setPreferences(preferencesSnap.data() as OnboardingPreferences)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [user])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          Welcome back{profile?.firstName ? `, ${profile.firstName}` : ""}! 👋
        </h1>
        <p className="text-gray-600">
          Find and connect with other interns for summer housing
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {!profile?.hasCompletedOnboarding ? (
          <Card className="p-6 border-2 border-teal-100 bg-teal-50/50">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Complete Your Profile</h2>
                <p className="text-sm text-gray-600">Help others find you as a potential roommate</p>
              </div>
              <Badge variant="secondary" className="bg-teal-100">Required</Badge>
            </div>
            <Link href="/onboarding">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Start Onboarding
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6 border-2 border-blue-100 bg-blue-50/50">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Update Profile</h2>
                <p className="text-sm text-gray-600">Keep your preferences up to date</p>
              </div>
            </div>
            <Link href="/profile">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        )}

        <Card className="p-6 border-2 border-blue-100 bg-blue-50/50">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Find Housing</h2>
              <p className="text-sm text-gray-600">Browse available listings near your internship</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100">12 New</Badge>
          </div>
          <Link href="/housing">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Browse Listings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Status Overview */}
      {preferences && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Housing Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Internship Location</p>
                <p className="text-sm text-gray-600">
                  {preferences.companyName}, {preferences.location.address}
                </p>
              </div>
            </div>
            
            {preferences.internshipDates && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Internship Date</p>
                  <p className="text-sm text-gray-600">
                    {preferences.internshipDates.term && preferences.internshipDates.year ? 
                      `${preferences.internshipDates.term} ${preferences.internshipDates.year}` :
                      'Term not specified'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Housing Search Area</p>
                <p className="text-sm text-gray-600">Within 5 miles of office</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Activity & Matches */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">New Match Found</p>
                <p className="text-sm text-gray-600">3 interns looking near Cupertino</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Pending Responses</p>
                <p className="text-sm text-gray-600">2 housing inquiries awaiting reply</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Potential Roommates</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-medium">
                  JD
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-600">Apple, iOS Engineer Intern</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-medium">
                  AS
                </div>
                <div>
                  <p className="font-medium">Alice Smith</p>
                  <p className="text-sm text-gray-600">Apple, ML Engineer Intern</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 