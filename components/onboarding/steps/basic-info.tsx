"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function BasicInfo() {
  const { onboardingData, updateOnboardingData, nextStep, previousStep } = useOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!onboardingData.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!onboardingData.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!onboardingData.age || onboardingData.age < 18) {
      newErrors.age = "You must be at least 18 years old"
    }
    if (!onboardingData.gender) {
      newErrors.gender = "Please select your gender"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Tell us about yourself
        </h3>
        <p className="text-gray-600">
          This information helps us create your profile and find compatible roommates.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <Input
              id="firstName"
              value={onboardingData.firstName || ""}
              onChange={(e) => updateOnboardingData({ firstName: e.target.value })}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <Input
              id="lastName"
              value={onboardingData.lastName || ""}
              onChange={(e) => updateOnboardingData({ lastName: e.target.value })}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium text-gray-700">
            Age
          </label>
          <Input
            id="age"
            type="number"
            min="18"
            max="120"
            value={onboardingData.age || ""}
            onChange={(e) => updateOnboardingData({ age: parseInt(e.target.value) })}
            className={errors.age ? "border-red-500" : ""}
          />
          {errors.age && (
            <p className="text-sm text-red-500">{errors.age}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Gender
          </label>
          <Select
            value={onboardingData.gender || ""}
            onValueChange={(value) => updateOnboardingData({ gender: value })}
          >
            <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non_binary">Non-binary</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
} 