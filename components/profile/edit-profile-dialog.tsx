"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditProfileDialogProps {
  profile: {
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
  trigger: React.ReactNode
  onSave: (data: any) => void
}

export function EditProfileDialog({ profile, trigger, onSave }: EditProfileDialogProps) {
  const [formData, setFormData] = useState(profile)
  const [imagePreview, setImagePreview] = useState(profile.profileImage || "")
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    await onSave(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Profile</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
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
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  className="min-h-[150px]"
                  placeholder="Write a brief bio..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 