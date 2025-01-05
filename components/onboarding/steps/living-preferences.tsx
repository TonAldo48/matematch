"use client"

import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Sparkles, Cigarette, PawPrint, Sun, Moon, Scale } from "lucide-react"

export function LivingPreferences() {
  const { onboardingData, updateOnboardingData, nextStep, previousStep } = useOnboarding()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!onboardingData.cleanlinessLevel) {
      newErrors.cleanliness = "Please select your cleanliness level"
    }
    if (!onboardingData.smokingPreference) {
      newErrors.smoking = "Please select your smoking preference"
    }
    if (!onboardingData.petsPreference) {
      newErrors.pets = "Please select your pets preference"
    }
    if (!onboardingData.lifestylePreference) {
      newErrors.lifestyle = "Please select your lifestyle preference"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  const PreferenceCard = ({ 
    selected, 
    onClick, 
    icon: Icon,
    title, 
    description 
  }: { 
    selected: boolean
    onClick: () => void
    icon: any
    title: string
    description: string 
  }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border-2 ${
        selected 
          ? "border-teal-600 bg-teal-50" 
          : "border-gray-200 hover:border-gray-300 bg-white"
      } p-4 transition-all`}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <Icon className={selected ? "text-teal-600" : "text-gray-500"} size={24} />
        <div>
          <div className={selected ? "font-medium text-teal-900" : "font-medium text-gray-900"}>
            {title}
          </div>
          <div className="text-sm text-gray-500">
            {description}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Living Preferences
        </h3>
        <p className="text-gray-600">
          Help us understand your lifestyle for better matching.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cleanliness Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            <PreferenceCard
              selected={onboardingData.cleanlinessLevel === 'very_clean'}
              onClick={() => updateOnboardingData({ cleanlinessLevel: 'very_clean' })}
              icon={Sparkles}
              title="Very Clean"
              description="Daily cleaning routine"
            />
            <PreferenceCard
              selected={onboardingData.cleanlinessLevel === 'clean'}
              onClick={() => updateOnboardingData({ cleanlinessLevel: 'clean' })}
              icon={Sparkles}
              title="Clean"
              description="Regular cleaning"
            />
            <PreferenceCard
              selected={onboardingData.cleanlinessLevel === 'moderate'}
              onClick={() => updateOnboardingData({ cleanlinessLevel: 'moderate' })}
              icon={Sparkles}
              title="Moderate"
              description="Weekly cleaning"
            />
            <PreferenceCard
              selected={onboardingData.cleanlinessLevel === 'relaxed'}
              onClick={() => updateOnboardingData({ cleanlinessLevel: 'relaxed' })}
              icon={Sparkles}
              title="Relaxed"
              description="Clean when needed"
            />
          </div>
          {errors.cleanliness && (
            <p className="mt-2 text-sm text-red-500">{errors.cleanliness}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Smoking Preference
          </label>
          <div className="grid grid-cols-3 gap-3">
            <PreferenceCard
              selected={onboardingData.smokingPreference === 'yes'}
              onClick={() => updateOnboardingData({ smokingPreference: 'yes' })}
              icon={Cigarette}
              title="Yes"
              description="Smoking allowed"
            />
            <PreferenceCard
              selected={onboardingData.smokingPreference === 'outside_only'}
              onClick={() => updateOnboardingData({ smokingPreference: 'outside_only' })}
              icon={Cigarette}
              title="Outside Only"
              description="Outside smoking"
            />
            <PreferenceCard
              selected={onboardingData.smokingPreference === 'no'}
              onClick={() => updateOnboardingData({ smokingPreference: 'no' })}
              icon={Cigarette}
              title="No"
              description="No smoking"
            />
          </div>
          {errors.smoking && (
            <p className="mt-2 text-sm text-red-500">{errors.smoking}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pets Preference
          </label>
          <div className="grid grid-cols-3 gap-3">
            <PreferenceCard
              selected={onboardingData.petsPreference === 'yes'}
              onClick={() => updateOnboardingData({ petsPreference: 'yes' })}
              icon={PawPrint}
              title="Yes"
              description="Pets welcome"
            />
            <PreferenceCard
              selected={onboardingData.petsPreference === 'depends'}
              onClick={() => updateOnboardingData({ petsPreference: 'depends' })}
              icon={Scale}
              title="Depends"
              description="Case by case"
            />
            <PreferenceCard
              selected={onboardingData.petsPreference === 'no'}
              onClick={() => updateOnboardingData({ petsPreference: 'no' })}
              icon={PawPrint}
              title="No"
              description="No pets"
            />
          </div>
          {errors.pets && (
            <p className="mt-2 text-sm text-red-500">{errors.pets}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lifestyle Preference
          </label>
          <div className="grid grid-cols-3 gap-3">
            <PreferenceCard
              selected={onboardingData.lifestylePreference === 'early_bird'}
              onClick={() => updateOnboardingData({ lifestylePreference: 'early_bird' })}
              icon={Sun}
              title="Early Bird"
              description="Early riser"
            />
            <PreferenceCard
              selected={onboardingData.lifestylePreference === 'balanced'}
              onClick={() => updateOnboardingData({ lifestylePreference: 'balanced' })}
              icon={Scale}
              title="Balanced"
              description="Flexible schedule"
            />
            <PreferenceCard
              selected={onboardingData.lifestylePreference === 'night_owl'}
              onClick={() => updateOnboardingData({ lifestylePreference: 'night_owl' })}
              icon={Moon}
              title="Night Owl"
              description="Late nights"
            />
          </div>
          {errors.lifestyle && (
            <p className="mt-2 text-sm text-red-500">{errors.lifestyle}</p>
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