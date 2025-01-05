"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ArrowLeft, ArrowRight, DollarSign, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboarding } from "@/contexts/onboarding-context"

export function BudgetPreferences() {
  const { onboardingData, updateOnboardingData, nextStep, prevStep } = useOnboarding()
  const [errors, setErrors] = useState<{
    budget?: string
    moveInDate?: string
  }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}

    if (!onboardingData.budget?.min || !onboardingData.budget?.max) {
      newErrors.budget = "Please enter both minimum and maximum budget"
    } else if (onboardingData.budget.min > onboardingData.budget.max) {
      newErrors.budget = "Minimum budget cannot be greater than maximum"
    } else if (onboardingData.budget.min < 0 || onboardingData.budget.max < 0) {
      newErrors.budget = "Budget cannot be negative"
    }

    if (!onboardingData.moveInDate) {
      newErrors.moveInDate = "Please select your preferred move-in date"
    } else {
      const selectedDate = new Date(onboardingData.moveInDate)
      const today = new Date()
      if (selectedDate < today) {
        newErrors.moveInDate = "Move-in date cannot be in the past"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value.replace(/\D/g, '')))
    updateOnboardingData({
      budget: {
        ...onboardingData.budget,
        [type]: numValue
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Monthly Budget Range
        </h3>
        <p className="text-gray-600">
          Set your preferred monthly housing budget range.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="minBudget" className="text-sm font-medium text-gray-700">
                Minimum Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="minBudget"
                  type="text"
                  placeholder="0"
                  value={onboardingData.budget?.min || ''}
                  onChange={(e) => handleBudgetChange('min', e.target.value)}
                  className={cn(
                    "pl-9",
                    errors.budget && "border-red-500"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="maxBudget" className="text-sm font-medium text-gray-700">
                Maximum Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="maxBudget"
                  type="text"
                  placeholder="0"
                  value={onboardingData.budget?.max || ''}
                  onChange={(e) => handleBudgetChange('max', e.target.value)}
                  className={cn(
                    "pl-9",
                    errors.budget && "border-red-500"
                  )}
                />
              </div>
            </div>
          </div>
          {errors.budget && (
            <p className="text-sm text-red-500">{errors.budget}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="moveInDate" className="text-sm font-medium text-gray-700">
            Preferred Move-in Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="moveInDate"
              type="date"
              value={onboardingData.moveInDate ? new Date(onboardingData.moveInDate).toISOString().split('T')[0] : ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => updateOnboardingData({ moveInDate: new Date(e.target.value) })}
              className={cn(
                "pl-9",
                errors.moveInDate && "border-red-500"
              )}
            />
          </div>
          {errors.moveInDate && (
            <p className="text-sm text-red-500">{errors.moveInDate}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
} 