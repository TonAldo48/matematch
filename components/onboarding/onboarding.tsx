"use client"

import { useOnboarding } from "@/contexts/onboarding-context"
import { Welcome } from "./steps/welcome"
import { BasicInfo } from "./steps/basic-info"
import { CompanyInfo } from "./steps/company-info"
import { BudgetPreferences } from "./steps/budget-preferences"
import { LivingPreferences } from "./steps/living-preferences"
import { Summary } from "./steps/summary"
import { Progress } from "@/components/ui/progress"

export function Onboarding() {
  const { currentStep, totalSteps } = useOnboarding()
  
  const progress = (currentStep / totalSteps) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Welcome />
      case 2:
        return <BasicInfo />
      case 3:
        return <CompanyInfo />
      case 4:
        return <BudgetPreferences />
      case 5:
        return <LivingPreferences />
      case 6:
        return <Summary />
      default:
        return <Welcome />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to MateMatch
          </h2>
          <p className="text-center text-gray-600">
            Let's get to know you better
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-center text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          {renderStep()}
        </div>
      </div>
    </div>
  )
} 