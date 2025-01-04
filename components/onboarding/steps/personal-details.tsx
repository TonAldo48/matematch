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
import { useState, useRef } from "react"
import { useOnboardingForm } from "@/contexts/onboarding-form-context"
import { NavigationControls } from "@/components/onboarding/navigation-controls"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ school: e.target.value })
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
          <CardDescription>Add a photo to help others recognize you</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={imagePreview} />
              <AvatarFallback className="text-2xl">
                {formData.name?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
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
            <Input
              placeholder="Enter your school name"
              value={formData.school || ""}
              onChange={handleSchoolChange}
            />
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
      />
    </div>
  )
} 