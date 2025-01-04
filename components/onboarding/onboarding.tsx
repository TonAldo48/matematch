"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Welcome } from "./steps/welcome"
import { RoleSelect } from "./steps/role-select"
import { LocationSelect } from "./steps/location-select"
import { PreferencesSelect } from "./steps/preferences-select"
import { Completion } from "./steps/completion"
import { Progress } from "@/components/ui/progress"
import { OnboardingFormProvider } from "@/contexts/onboarding-form-context"

const steps = [
  { component: Welcome, title: "Welcome" },
  { component: RoleSelect, title: "Company" },
  { component: LocationSelect, title: "Location" },
  { component: PreferencesSelect, title: "Preferences" },
  { component: Completion, title: "All Set!" },
]

export function Onboarding() {
  const { currentStep, setCurrentStep } = useOnboarding()
  const CurrentStep = steps[currentStep].component

  return (
    <OnboardingFormProvider>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-2xl mx-auto pt-20 px-4">
          <div className="mb-8">
            <Progress value={(currentStep / (steps.length - 1)) * 100} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStep onNext={() => setCurrentStep(currentStep + 1)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </OnboardingFormProvider>
  )
} 