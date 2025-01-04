"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Label } from "@/components/ui/label"

interface EditProfileFormProps {
  initialData: {
    name: string
    role: string
    company: string
    location: string
    monthlyBudget: string
    bio: string
    email: string
    phone: string
    school?: string
    gender?: string
    profileImage?: string
  }
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [imagePreview, setImagePreview] = useState(initialData.profileImage || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData(prev => ({ ...prev, profileImage: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the data to your backend
    console.log('Saving profile:', formData)
    router.push('/profile')
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Choose a profile picture to help others recognize you</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview} />
                <AvatarFallback className="text-xl">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                type="button"
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
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input
                  value={formData.school}
                  onChange={handleChange('school')}
                  placeholder="Your school"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={handleChange('email')}
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={handleSelectChange('gender')}
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
              <div className="space-y-2">
                <Label>Monthly Budget</Label>
                <Input
                  value={formData.monthlyBudget}
                  onChange={handleChange('monthlyBudget')}
                  type="number"
                  placeholder="Your monthly budget"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle>Bio</CardTitle>
            <CardDescription>Tell others about yourself and what you're looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.bio}
              onChange={handleChange('bio')}
              className="min-h-[150px]"
              placeholder="Write a brief bio..."
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit"
            className="bg-teal-600 hover:bg-teal-700"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
} 