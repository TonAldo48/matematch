"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyLogo } from "@/components/ui/company-logo"
import { MapPin, Mail, Phone, RefreshCw, Pencil, GraduationCap, Scale, Cigarette, PawPrint, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditProfileDialog } from "./edit-profile-dialog"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EditableHousingCard } from "./editable-housing-card"
import { EditableInternshipCard } from "./editable-internship-card"
import { EditableEducationCard } from "./editable-education-card"

interface ProfileViewProps {
  profile?: {
    name: string
    role: string
    company: string
    location: string
    monthlyBudget: string
    bio: string
    email: string
    phone: string
    school?: string
    gender?: string
    profileImage?: string
    internshipDates?: {
      term: string
      year: number
    }
    preferences?: {
      cleanliness: string
      smoking: string
      pets: string
      lifestyle: string
    }
    moveInDate?: string
  }
}

export function ProfileView({ profile: initialProfileData }: ProfileViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState(initialProfileData)
  const [loading, setLoading] = useState(!initialProfileData)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPreferences, setEditedPreferences] = useState({
    monthlyBudget: {
      min: "",
      max: ""
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return
      
      try {
        const userDoc = await getDoc(doc(db, "userProfiles", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log('Raw Firestore data:', userData)
          
          const formattedProfile = {
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role || "",
            company: userData.companyName || "",
            location: userData.location?.address || "",
            monthlyBudget: userData.budget ? `${userData.budget.min} - ${userData.budget.max}` : "Not specified",
            bio: userData.bio || "",
            email: userData.email || "",
            phone: userData.phone || "",
            school: userData.school || "",
            gender: userData.gender || "",
            profileImage: userData.profileImage || "",
            internshipDates: userData.internshipDates ? {
              term: userData.internshipDates.term || "",
              year: userData.internshipDates.year || new Date().getFullYear()
            } : {
              term: "",
              year: new Date().getFullYear()
            },
            preferences: {
              cleanliness: userData.preferences?.cleanliness || "",
              smoking: userData.preferences?.smoking || "",
              pets: userData.preferences?.pets || "",
              lifestyle: userData.preferences?.lifestyle || ""
            },
            moveInDate: userData.moveInDate ? new Date(userData.moveInDate.seconds * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : undefined
          }
          
          console.log('Formatted profile data:', formattedProfile)
          setProfile(formattedProfile)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setLoading(false)
      }
    }

    if (!initialProfileData) {
      fetchProfile()
    }
  }, [user?.uid, initialProfileData])

  useEffect(() => {
    if (profile?.monthlyBudget) {
      const [min, max] = profile.monthlyBudget.split(' - ')
      setEditedPreferences({
        monthlyBudget: {
          min: min.replace('$', ''),
          max: max || ''
        }
      })
    }
  }, [profile])

  const handleSaveProfile = async (updatedProfile: typeof profile) => {
    if (!user?.uid || !updatedProfile || !updatedProfile.name) return
    
    try {
      const userRef = doc(db, "userProfiles", user.uid)
      
      const firestoreData = {
        firstName: updatedProfile.name.split(' ')[0],
        lastName: updatedProfile.name.split(' ').slice(1).join(' '),
        role: updatedProfile.role || null,
        companyName: updatedProfile.company || null,
        location: updatedProfile.location ? { address: updatedProfile.location } : null,
        budget: updatedProfile.monthlyBudget !== "Not specified" 
          ? { min: parseInt(updatedProfile.monthlyBudget.split(' - ')[0]), max: parseInt(updatedProfile.monthlyBudget.split(' - ')[1]) }
          : null,
        bio: updatedProfile.bio || null,
        email: updatedProfile.email,
        phone: updatedProfile.phone || null,
        school: updatedProfile.school || null,
        gender: updatedProfile.gender || null,
        profileImage: updatedProfile.profileImage || null,
        internshipDates: updatedProfile.internshipDates || null,
        preferences: updatedProfile.preferences || null,
        moveInDate: updatedProfile.moveInDate || null,
        updatedAt: serverTimestamp()
      }

      const cleanData = Object.fromEntries(
        Object.entries(firestoreData).filter(([_, value]) => value !== null)
      )
      
      await updateDoc(userRef, cleanData)
      setProfile(updatedProfile)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const handleSave = async () => {
    if (!user?.uid) return
    try {
      const userRef = doc(db, "userProfiles", user.uid)
      await updateDoc(userRef, {
        budget: {
          min: parseInt(editedPreferences.monthlyBudget.min),
          max: parseInt(editedPreferences.monthlyBudget.max)
        },
        updatedAt: serverTimestamp()
      })
      
      if (profile) {
        setProfile({
          ...profile,
          monthlyBudget: `${editedPreferences.monthlyBudget.min} - ${editedPreferences.monthlyBudget.max}`
        })
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating preferences:", error)
    }
  }

  const handleHousingUpdate = (newData: any) => {
    setProfile(prev => {
      if (!prev) return prev
      return {
        ...prev,
        monthlyBudget: newData.monthlyBudget ? `$${newData.monthlyBudget.min} - ${newData.monthlyBudget.max}` : prev.monthlyBudget,
        moveInDate: newData.moveInDate ? new Date(newData.moveInDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : prev.moveInDate
      }
    })
  }

  const handleInternshipUpdate = (newData: any) => {
    setProfile(prev => {
      if (!prev) return prev
      return {
        ...prev,
        company: newData.companyName,
        role: newData.role,
        location: newData.location.address,
        internshipDates: newData.internshipDates || prev.internshipDates
      }
    })
  }

  const handleEducationUpdate = (newData: any) => {
    setProfile(prev => {
      if (!prev) return prev
      return {
        ...prev,
        school: newData.school,
        gender: newData.gender
      }
    })
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading profile...</div>
  }

  if (!profile) {
    return <div className="max-w-4xl mx-auto p-6">Profile not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profileImage} />
            <AvatarFallback className="text-lg">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-gray-600">
                {profile.role} {profile.company && `at ${profile.company}`}
              </p>
            </div>
            {profile.bio && (
              <p className="text-gray-600 max-w-lg">{profile.bio}</p>
            )}
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
      {user && profile && (
        <EditableInternshipCard
          userId={user.uid}
          company={profile.company}
          role={profile.role}
          location={profile.location}
          internshipDates={profile.internshipDates}
          onUpdate={handleInternshipUpdate}
        />
      )}

      {/* Housing Preferences Card */}
      {user && profile && (
        <EditableHousingCard
          userId={user.uid}
          monthlyBudget={profile.monthlyBudget}
          moveInDate={profile.moveInDate}
          onUpdate={handleHousingUpdate}
        />
      )}

      {/* Living Preferences Card */}
      {profile.preferences && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Living Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {profile.preferences.cleanliness && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Scale className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">Cleanliness Level</h3>
                  <p>{profile.preferences.cleanliness}</p>
                </div>
              </div>
            )}
            {profile.preferences.smoking && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Cigarette className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">Smoking Preference</h3>
                  <p>{profile.preferences.smoking}</p>
                </div>
              </div>
            )}
            {profile.preferences.pets && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <PawPrint className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">Pet Preference</h3>
                  <p>{profile.preferences.pets}</p>
                </div>
              </div>
            )}
            {profile.preferences.lifestyle && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {profile.preferences.lifestyle.includes('Night') ? (
                    <Moon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Sun className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Lifestyle</h3>
                  <p>{profile.preferences.lifestyle}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Housing Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Monthly Budget Range</label>
              <div className="flex gap-2 items-center mt-1">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={editedPreferences.monthlyBudget.min}
                    onChange={(e) => setEditedPreferences(prev => ({
                      ...prev,
                      monthlyBudget: {
                        ...prev.monthlyBudget,
                        min: e.target.value
                      }
                    }))}
                  />
                </div>
                <span>-</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max"
                    value={editedPreferences.monthlyBudget.max}
                    onChange={(e) => setEditedPreferences(prev => ({
                      ...prev,
                      monthlyBudget: {
                        ...prev.monthlyBudget,
                        max: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Education Card */}
      {user && profile && (
        <EditableEducationCard
          userId={user.uid}
          school={profile.school}
          gender={profile.gender}
          onUpdate={handleEducationUpdate}
        />
      )}

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
          {profile.phone && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <p>{profile.phone}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 