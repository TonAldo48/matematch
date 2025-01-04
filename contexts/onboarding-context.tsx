"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'

interface OnboardingContextType {
  isComplete: boolean
  setComplete: (value: boolean) => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isComplete, setComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isComplete) {
      router.push('/onboarding')
    }
  }, [user, isComplete, router])

  return (
    <OnboardingContext.Provider value={{ isComplete, setComplete, currentStep, setCurrentStep }}>
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