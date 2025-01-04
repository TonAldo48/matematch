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
import { companies } from "@/data/profiles"
import { MapPin, Search, Plus, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useOnboardingForm } from "@/contexts/onboarding-form-context"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NavigationControls } from "@/components/onboarding/navigation-controls"

interface CustomLocation {
  city: string
  state: string
}

export function LocationSelect({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { formData, updateFormData } = useOnboardingForm()
  const [searchQuery, setSearchQuery] = useState("")
  const [customLocation, setCustomLocation] = useState<CustomLocation>({ city: "", state: "" })
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [error, setError] = useState("")

  // Initialize with existing location if any
  useEffect(() => {
    if (formData.location) {
      const [city, state] = formData.location.split(", ")
      setCustomLocation({ city, state })
    }
  }, [formData.location])

  const filteredLocations = (formData.availableLocations || []).filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLocationSelect = (location: string) => {
    updateFormData({ location })
    onNext() // Automatically navigate after selection
  }

  const validateLocation = ({ city, state }: CustomLocation) => {
    if (!city.trim()) return "City is required"
    if (!state.trim()) return "State is required"
    if (state.length !== 2) return "Please use 2-letter state code (e.g., CA)"
    if (!/^[A-Za-z\s]+$/.test(city)) return "City should only contain letters"
    if (!/^[A-Za-z]{2}$/.test(state)) return "Invalid state code format"
    return ""
  }

  const handleCustomLocation = () => {
    const validationError = validateLocation(customLocation)
    if (validationError) {
      setError(validationError)
      return
    }

    const formattedLocation = `${customLocation.city}, ${customLocation.state.toUpperCase()}`
    updateFormData({ location: formattedLocation })
    onNext() // Automatically navigate after adding custom location
  }

  // Check if we can progress
  const canProgress = Boolean(formData.location)

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-2">Which office location?</h2>
        <p className="text-gray-600">
          {formData.company ? 
            `Select your office location at ${formData.company}` :
            "Select your office location"
          }
        </p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {/* Show available locations */}
        {filteredLocations.map((location) => (
          <motion.div
            key={location}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="cursor-pointer hover:border-teal-500 transition-colors"
              onClick={() => handleLocationSelect(location)}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <CardTitle>{location}</CardTitle>
                    <CardDescription>Office Location</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}

        {/* Custom location input */}
        {(!filteredLocations.length || showCustomInput) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">
                  {!filteredLocations.length ? 
                    "Can't find your location?" :
                    "Add a different location"
                  }
                </CardTitle>
                <CardContent className="p-0 pt-4">
                  <div className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          placeholder="Enter city"
                          value={customLocation.city}
                          onChange={(e) => {
                            setError("")
                            setCustomLocation(prev => ({
                              ...prev,
                              city: e.target.value
                            }))
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          placeholder="CA"
                          maxLength={2}
                          value={customLocation.state}
                          onChange={(e) => {
                            setError("")
                            setCustomLocation(prev => ({
                              ...prev,
                              state: e.target.value.toUpperCase()
                            }))
                          }}
                        />
                        <p className="text-xs text-gray-500">
                          Use 2-letter state code (e.g., CA for California)
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCustomLocation}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      Add Location
                    </Button>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Option to add custom location when locations exist */}
        {filteredLocations.length > 0 && !showCustomInput && (
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setShowCustomInput(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Different Location
          </Button>
        )}
      </div>

      <NavigationControls 
        onNext={onNext}
        onBack={onBack}
        canProgress={canProgress}
      />
    </div>
  )
} 