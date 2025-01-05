"use client"

import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/contexts/onboarding-context"
import { ArrowRight } from "lucide-react"

export function Welcome() {
  const { nextStep } = useOnboarding()

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Find Your Perfect Roommate Match
        </h3>
        <p className="text-gray-600">
          We'll guide you through a few quick steps to understand your preferences and help you find the perfect roommate match.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">What to expect:</h4>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                1
              </div>
            </div>
            <p className="ml-3 text-gray-600">
              Basic information about yourself
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                2
              </div>
            </div>
            <p className="ml-3 text-gray-600">
              Your location preferences and budget
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                3
              </div>
            </div>
            <p className="ml-3 text-gray-600">
              Living preferences and lifestyle
            </p>
          </li>
        </ul>
      </div>

      <div className="pt-4">
        <Button
          onClick={nextStep}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          Let's Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 