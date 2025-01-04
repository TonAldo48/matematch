"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { techCompanies } from "@/data/companies"
import { CompanyLogo } from "@/components/ui/company-logo"
import { useState, useEffect } from "react"
import { Search, MapPin } from "lucide-react"
import { useOnboardingForm } from "@/contexts/onboarding-form-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NavigationControls } from "@/components/onboarding/navigation-controls"

export function RoleSelect({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { formData, updateFormData } = useOnboardingForm()
  const [searchQuery, setSearchQuery] = useState("")
  const [customCompany, setCustomCompany] = useState("")
  
  // Initialize with existing company if any
  useEffect(() => {
    if (formData.company) {
      setCustomCompany(formData.company)
    }
  }, [formData.company])

  const filteredCompanies = techCompanies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCompanySelect = (company: typeof techCompanies[0]) => {
    updateFormData({ 
      company: company.name,
      availableLocations: company.locations 
    })
    onNext() // Automatically navigate after selection
  }

  const handleCustomCompany = () => {
    if (customCompany.trim()) {
      updateFormData({ 
        company: customCompany,
        availableLocations: [] 
      })
      onNext() // Automatically navigate after adding custom company
    }
  }

  // Check if we can progress
  const canProgress = Boolean(formData.company)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-2">Where will you be interning?</h2>
        <p className="text-gray-600">Select your internship company</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid gap-4">
          {filteredCompanies.map((company) => (
            <motion.div
              key={company.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => handleCompanySelect(company)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CompanyLogo company={company.name} />
                    <div className="flex-1">
                      <CardTitle>{company.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.locations.length} locations available
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}

          {/* Custom company input */}
          {searchQuery && !filteredCompanies.length && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Can't find your company?</CardTitle>
                  <CardContent className="p-0 pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter company name"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                      />
                      <Button 
                        onClick={handleCustomCompany}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <NavigationControls 
        onNext={onNext}
        onBack={onBack}
        canProgress={canProgress}
        showBack={false} // This is the first step
      />
    </div>
  )
} 