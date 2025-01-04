"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface OnboardingFormData {
  company?: string
  availableLocations?: string[]
  location?: string
  role?: string
  budget?: string
  bio?: string
  name?: string
  school?: string
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
  profileImage?: string // Base64 or URL
}

interface OnboardingFormContextType {
  formData: OnboardingFormData
  updateFormData: (data: Partial<OnboardingFormData>) => void
}

const OnboardingFormContext = createContext<OnboardingFormContextType | undefined>(undefined)

export function OnboardingFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<OnboardingFormData>({})
  const pathname = usePathname()
  const isEditMode = pathname?.startsWith('/profile/edit')

  useEffect(() => {
    if (isEditMode) {
      // In a real app, fetch this from your API/database
      // For now, using mock data
      setFormData({
        name: "David Nintang",
        role: "Software Engineering Intern",
        company: "Apple",
        location: "Cupertino, CA",
        monthlyBudget: "2500",
        bio: "SWE Intern at Meta for Summer 2024. I'm a clean, organized person who enjoys both socializing and quiet time. Looking for housing near Menlo Park office. I'm an early riser, enjoy cooking, and like to keep common areas tidy. Hoping to find roommates who are also interns and share similar schedules.",
        email: "dnintang@gsumail.gram.edu",
        phone: "3187506130",
        school: "Your School",
        gender: "Male",
        // profileImage would be here if exists
      })
    }
  }, [isEditMode])

  const updateFormData = (newData: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  return (
    <OnboardingFormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </OnboardingFormContext.Provider>
  )
}

export function useOnboardingForm() {
  const context = useContext(OnboardingFormContext)
  if (context === undefined) {
    throw new Error('useOnboardingForm must be used within an OnboardingFormProvider')
  }
  return context
} 