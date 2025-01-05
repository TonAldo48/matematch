"use client"

import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { doc, setDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

export function Summary() {
  const { onboardingData, prevStep } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      // Store everything in the user profile
      const userProfileRef = doc(db, "userProfiles", user.uid)
      await setDoc(userProfileRef, {
        // Basic info
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
        email: user.email,
        
        // Company & Role info
        role: onboardingData.role,
        companyName: onboardingData.companyName,
        location: onboardingData.location,
        internshipDates: onboardingData.internshipDates,
        
        // Housing preferences
        budget: onboardingData.budget,
        moveInDate: onboardingData.moveInDate,
        
        // Living preferences
        preferences: {
          cleanliness: onboardingData.cleanlinessLevel,
          smoking: onboardingData.smokingPreference,
          pets: onboardingData.petsPreference,
          lifestyle: onboardingData.lifestylePreference
        },
        
        // Metadata
        updatedAt: serverTimestamp(),
        hasCompletedOnboarding: true,
        status: 'active'
      }, { merge: true })
      
      toast.success("Profile saved successfully!")
      router.push('/')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Review Your Information
        </h3>
        <p className="text-gray-600">
          Please review your information before finalizing your profile.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Basic Information</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.firstName} {onboardingData.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Age</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.age}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gender</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.gender?.replace('_', ' ')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Company & Role</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Company</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.companyName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.role}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Address</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.location?.address}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Term</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.internshipDates?.term} {onboardingData.internshipDates?.year}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Budget & Move-in</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Budget Range</dt>
              <dd className="text-sm font-medium text-gray-900">
                ${onboardingData.budget?.min} - ${onboardingData.budget?.max}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Move-in Date</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.moveInDate && formatDate(onboardingData.moveInDate)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Living Preferences</h4>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Cleanliness Level</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.cleanlinessLevel?.replace('_', ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Smoking Preference</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.smokingPreference?.replace('_', ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Pets Preference</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.petsPreference}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Lifestyle</dt>
              <dd className="text-sm font-medium text-gray-900">
                {onboardingData.lifestylePreference?.replace('_', ' ')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              Complete Setup
              <Check className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 