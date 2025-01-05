"use client"

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingContextType {
  currentStep: number
  totalSteps: number
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  onboardingData: {
    firstName?: string
    lastName?: string
    age?: number
    gender?: string
    companyName?: string
    role?: string
    location?: {
      address?: string
    }
    budget?: {
      min?: number
      max?: number
    }
    moveInDate?: Date
    internshipDates?: {
      term: 'Spring' | 'Summer' | 'Fall' | 'Winter'
      year: number
    }
    cleanlinessLevel?: string
    smokingPreference?: string
    petsPreference?: string
    lifestylePreference?: string
  }
  updateOnboardingData: (data: Partial<OnboardingContextType['onboardingData']>) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState({})
  const router = useRouter()
  const totalSteps = 6  // Updated from 5 to 6 to include the company info step

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Redirect to profile or dashboard when onboarding is complete
      router.push('/profile')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }

  const updateOnboardingData = (data: Partial<OnboardingContextType['onboardingData']>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  return (
    <OnboardingContext.Provider value={{ 
      currentStep, 
      totalSteps, 
      nextStep, 
      prevStep, 
      goToStep,
      onboardingData,
      updateOnboardingData
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
} 