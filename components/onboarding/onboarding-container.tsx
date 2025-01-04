"use client"

import { useState, useEffect } from "react"
import { RoleSelect } from "./steps/role-select"
import { LocationSelect } from "./steps/location-select"
import { OnboardingFormProvider } from "@/contexts/onboarding-form-context"
import { PersonalDetails } from "./steps/personal-details"
import { useRouter } from "next/navigation"

const STEPS = [
  PersonalDetails,
  RoleSelect,
  LocationSelect,
  // Add other steps here
]

interface OnboardingContainerProps {
  mode?: "create" | "edit"
}

export function OnboardingContainer({ mode = "create" }: OnboardingContainerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // On last step completion
      router.push('/profile')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else if (mode === "edit") {
      // If on first step in edit mode, go back to profile
      router.push('/profile')
    }
  }

  const CurrentStepComponent = STEPS[currentStep]

  return (
    <OnboardingFormProvider>
      <div className="max-w-2xl mx-auto p-6">
        <CurrentStepComponent 
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </OnboardingFormProvider>
  )
} 