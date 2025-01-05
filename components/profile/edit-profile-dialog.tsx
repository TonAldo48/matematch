"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { schools } from "@/data/profiles"

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
    internshipDates?: {
      term: string
      year: number
    }
    moveInDate?: string
  }
  trigger: React.ReactNode
  onSave: (data: any) => void
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  monthlyBudget?: string
  moveInDate?: string
}

export function EditProfileDialog({ profile, trigger, onSave }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    ...profile,
    internshipDates: {
      term: profile.internshipDates?.term || "",
      year: profile.internshipDates?.year || new Date().getFullYear()
    },
    moveInDate: profile.moveInDate || ''
  })
  const [imagePreview, setImagePreview] = useState(profile.profileImage || "")
  const [errors, setErrors] = useState<FormErrors>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i)
  const terms = ['Spring', 'Summer', 'Fall', 'Winter'] as const

  // Check for unsaved changes
  const checkUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(profile) ||
           imagePreview !== (profile.profileImage || "")
  }

  // Update hasUnsavedChanges whenever form data changes
  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges())
  }, [formData, imagePreview])

  // Add budget validation helper function
  const validateAndParseBudget = (budgetString: string) => {
    // Return null for empty or whitespace-only strings
    if (!budgetString?.trim()) return null
    
    try {
      const budgetParts = budgetString.split('-').map(part => {
        const value = parseInt(part.trim())
        if (isNaN(value) || value < 0) throw new Error('Invalid budget value')
        return value
      })
      
      if (budgetParts.length !== 2 || budgetParts[0] >= budgetParts[1]) {
        return false
      }
      
      return {
        min: budgetParts[0],
        max: budgetParts[1]
      }
    } catch {
      return false
    }
  }

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
    const value = e.target.value
    if (field === 'moveInDate') {
      // For move-in date, store as ISO string
      setFormData(prev => ({
        ...prev,
        [field]: value ? new Date(value).toISOString() : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: field === 'phone' ? value || '' : value
      }))
    }
  }

  const handleSelectChange = (field: string) => (value: string) => {
    if (field === 'internshipDates.term') {
      setFormData(prev => ({
        ...prev,
        internshipDates: {
          ...prev.internshipDates,
          term: value
        }
      }))
    } else if (field === 'internshipDates.year') {
      setFormData(prev => ({
        ...prev,
        internshipDates: {
          ...prev.internshipDates,
          year: parseInt(value)
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Budget validation
    if (formData.monthlyBudget) {
      const budgetParts = formData.monthlyBudget.split('-').map(part => parseInt(part.trim()))
      if (budgetParts.length !== 2 || isNaN(budgetParts[0]) || isNaN(budgetParts[1]) || budgetParts[0] >= budgetParts[1]) {
        newErrors.monthlyBudget = 'Please enter a valid budget range (e.g., 2000 - 3000)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSaving(true)
    try {
      // Format the data for Firestore
      const firestoreData = {
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' '),
        email: formData.email,
        phone: formData.phone || null,
        school: formData.school || null,
        gender: formData.gender || null,
        bio: formData.bio || null,
        profileImage: formData.profileImage || null,
        internshipDates: formData.internshipDates?.term && formData.internshipDates?.year
          ? {
              term: formData.internshipDates.term,
              year: parseInt(formData.internshipDates.year.toString())
            }
          : null,
        monthlyBudget: formData.monthlyBudget ? validateAndParseBudget(formData.monthlyBudget) : null,
        moveInDate: formData.moveInDate ? new Date(formData.moveInDate) : null
      }

      // Remove null values
      const cleanData = Object.fromEntries(
        Object.entries(firestoreData).filter(([_, value]) => value !== null)
      )

      await onSave(cleanData)
      toast.success('Profile updated successfully')
      setOpen(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSaving) return

      if (!newOpen && hasUnsavedChanges) {
        if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
          setOpen(false)
          // Reset form
          setFormData({
            ...profile,
            internshipDates: {
              term: profile.internshipDates?.term || "",
              year: profile.internshipDates?.year || new Date().getFullYear()
            },
            moveInDate: profile.moveInDate || ''
          })
          setImagePreview(profile.profileImage || "")
          setErrors({})
          setHasUnsavedChanges(false)
        }
      } else {
        setOpen(newOpen)
        if (newOpen) {
          // Reset form when opening
          setFormData({
            ...profile,
            internshipDates: {
              term: profile.internshipDates?.term || "",
              year: profile.internshipDates?.year || new Date().getFullYear()
            },
            moveInDate: profile.moveInDate || ''
          })
          setImagePreview(profile.profileImage || "")
          setErrors({})
          setHasUnsavedChanges(false)
        }
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Your full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>School</Label>
                  <Select 
                    value={formData.school} 
                    onValueChange={handleSelectChange('school')}
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
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={handleChange('email')}
                    type="email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    type="tel"
                    placeholder="Your phone number"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
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
                    placeholder="e.g., 2000 - 3000"
                    className={errors.monthlyBudget ? 'border-red-500' : ''}
                  />
                  {errors.monthlyBudget && (
                    <p className="text-sm text-red-500">{errors.monthlyBudget}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  className="min-h-[100px]"
                  placeholder="Write a brief bio about yourself..."
                />
              </div>

              <div className="space-y-4">
                <Label>Internship Term</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Select
                    value={formData.internshipDates.term}
                    onValueChange={handleSelectChange('internshipDates.term')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Winter">Winter</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={formData.internshipDates.year}
                    onChange={handleChange('internshipDates.year')}
                    placeholder="Year"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Move-in Date</Label>
                <Input
                  type="date"
                  value={typeof formData.moveInDate === 'string' && formData.moveInDate ? formData.moveInDate.split('T')[0] : ''}
                  onChange={handleChange('moveInDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.moveInDate ? 'border-red-500' : ''}
                />
                {errors.moveInDate && (
                  <p className="text-sm text-red-500">{errors.moveInDate}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 