"use client"

import { Button } from "@/components/ui/button"
import { useOnboarding } from "@/contexts/onboarding-context"
import { CompanySelect } from "./company-select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CompanyInfo() {
  const { onboardingData, updateOnboardingData, nextStep, prevStep } = useOnboarding()
  const [errors, setErrors] = useState<{
    company?: string
    role?: string
    term?: string
  }>({})

  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear + 1]
  const terms = ['Spring', 'Summer', 'Fall', 'Winter'] as const

  const handleCompanyLocationSelect = (company: string, location: string) => {
    updateOnboardingData({
      companyName: company,
      location: {
        address: location
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}

    if (!onboardingData.companyName) {
      newErrors.company = "Please select a company"
    }
    if (!onboardingData.role?.trim()) {
      newErrors.role = "Please enter your role"
    }
    if (!onboardingData.internshipDates?.term || !onboardingData.internshipDates?.year) {
      newErrors.term = "Please select both term and year"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Tell us about your internship
        </h3>
        <p className="text-gray-600">
          This helps us find housing options and roommates near your workplace.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Company & Location
          </label>
          <CompanySelect
            onSelect={handleCompanyLocationSelect}
            initialCompany={onboardingData.companyName}
            initialLocation={onboardingData.location?.address}
          />
          {errors.company && (
            <p className="text-sm text-red-500">{errors.company}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Role
          </label>
          <Input
            placeholder="e.g. Software Engineering Intern"
            value={onboardingData.role || ""}
            onChange={(e) => updateOnboardingData({ role: e.target.value })}
            className={errors.role ? "border-red-500" : ""}
          />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role}</p>
          )}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Internship Term
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                value={onboardingData.internshipDates?.term}
                onValueChange={(term) => 
                  updateOnboardingData({
                    internshipDates: {
                      term: term as typeof terms[number],
                      year: onboardingData.internshipDates?.year || currentYear
                    }
                  })
                }
              >
                <SelectTrigger className={errors.term ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={onboardingData.internshipDates?.year?.toString()}
                onValueChange={(year) =>
                  updateOnboardingData({
                    internshipDates: {
                      term: onboardingData.internshipDates?.term || terms[0],
                      year: parseInt(year)
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {errors.term && (
            <p className="text-sm text-red-500">{errors.term}</p>
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