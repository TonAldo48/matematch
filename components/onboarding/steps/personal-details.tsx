"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOnboardingForm } from "@/contexts/onboarding-form-context"
import { NavigationControls } from "@/components/onboarding/navigation-controls"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { schools } from "@/data/profiles"

export function PersonalDetails({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { formData, updateFormData } = useOnboardingForm()
  const [imagePreview, setImagePreview] = useState<string>(formData.profileImage || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        updateFormData({ profileImage: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ name: e.target.value })
  }

  const handleSchoolChange = (value: string) => {
    updateFormData({ school: value })
  }

  const handleGenderChange = (value: string) => {
    updateFormData({ gender: value as typeof formData.gender })
  }

  const canProgress = Boolean(formData.name && formData.school && formData.gender)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
        <p className="text-gray-600">Add your personal details to complete your profile</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={imagePreview} />
              <AvatarFallback>
                {formData.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">Full Name</label>
            <Input
              placeholder="Enter your full name"
              value={formData.name || ""}
              onChange={handleNameChange}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">School</label>
            <Select 
              value={formData.school} 
              onValueChange={handleSchoolChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map(school => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-medium">Gender</label>
            <Select 
              value={formData.gender} 
              onValueChange={handleGenderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <NavigationControls
        onNext={onNext}
        onBack={onBack}
        canProgress={canProgress}
        showBackButton={false}
      />
    </div>
  )
} 