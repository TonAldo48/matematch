"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyLogo } from "@/components/ui/company-logo"
import { MapPin, Mail, Phone, RefreshCw, Pencil, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditProfileDialog } from "./edit-profile-dialog"
import { useState } from "react"

interface ProfileViewProps {
  profile: {
    name: string
    role: string
    company: string
    location: string
    monthlyBudget: number
    bio: string
    email: string
    phone: string
    school?: string
    gender?: string
    profileImage?: string
  }
}

export function ProfileView({ profile: initialProfile }: ProfileViewProps) {
  const router = useRouter()
  // Add state to manage profile data
  const [profile, setProfile] = useState(initialProfile)

  const handleSaveProfile = async (updatedProfile: typeof profile) => {
    // Here you would typically save to your backend
    console.log('Saving profile:', updatedProfile)
    // Update local state instead of reloading
    setProfile(updatedProfile)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profileImage} />
            <AvatarFallback className="text-lg">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">{profile.role} at {profile.company}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/onboarding">
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Onboarding
            </Link>
          </Button>
          <EditProfileDialog
            profile={profile}
            onSave={handleSaveProfile}
            trigger={
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            }
          />
        </div>
      </div>

      {/* Internship Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Internship Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CompanyLogo company={profile.company} />
              <div>
                <h3 className="font-medium">Company</h3>
                <p>{profile.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">Location</h3>
                <p>{profile.location}</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium">Role</h3>
              <p>{profile.role}</p>
            </div>
            <div>
              <h3 className="font-medium">Dates</h3>
              <p>Summer 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Housing Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Housing Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium">Monthly Budget</h3>
            <p>${profile.monthlyBudget.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-medium">Bio</h3>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Phone className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p>{profile.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Education</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium">School</h3>
              <p>{profile.school || "Grambling State University"}</p>
            </div>
          </div>
          {profile.gender && profile.gender !== 'Prefer not to say' && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg 
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Gender</h3>
                <p>{profile.gender}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 