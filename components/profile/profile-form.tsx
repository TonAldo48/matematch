"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/user-profile-context"
import { companies, roles } from "@/data/profiles"
import { Badge } from "@/components/ui/badge"
import { Pencil, X, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useRouter } from "next/navigation"
import { CompanyLogo } from "@/components/ui/company-logo"

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export function ProfileForm() {
  const { userProfile, saveProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const { setComplete, setCurrentStep } = useOnboarding()
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: userProfile?.name?.split(' ')[0] || "",
    lastName: userProfile?.name?.split(' ')[1] || "",
    company: userProfile?.company || "",
    role: userProfile?.role || "",
    location: userProfile?.location || "",
    dateRange: {
      from: undefined,
      to: undefined
    } as DateRange,
    budget: userProfile?.budget || "",
    phone: userProfile?.phone || "",
    email: userProfile?.email || "",
    bio: userProfile?.bio || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const profile = {
      ...userProfile,
      name: `${formData.firstName} ${formData.lastName}`,
      company: formData.company,
      role: formData.role,
      location: formData.location,
      dates: formData.dateRange.from && formData.dateRange.to
        ? `${format(formData.dateRange.from, "MMM d")} - ${format(formData.dateRange.to, "MMM d, yyyy")}`
        : "",
      budget: formData.budget,
      phone: formData.phone,
      email: formData.email,
      bio: formData.bio
    }

    saveProfile(profile)
    setIsEditing(false)
  }

  const handleRestartOnboarding = () => {
    if (user) {
      localStorage.removeItem(`onboarded_${user.uid}`)
    }
    setComplete(false)
    setCurrentStep(0)
    router.push('/onboarding')
  }

  if (!isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xl font-semibold">
              {userProfile?.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
              <p className="text-gray-600">{userProfile?.role} at {userProfile?.company}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRestartOnboarding}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Onboarding
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Internship Details</h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div className="flex items-center gap-3">
                <CompanyLogo company={userProfile?.company || ""} className="w-10 h-10" />
                <div>
                  <div className="text-sm font-medium">Company</div>
                  <div>{userProfile?.company}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Role</div>
                <div>{userProfile?.role}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Location</div>
                <div>{userProfile?.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Dates</div>
                <div>{userProfile?.dates}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Housing Preferences</h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <div className="text-sm font-medium">Monthly Budget</div>
                <div>${userProfile?.budget}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium">Bio</div>
                <div className="text-gray-600">{userProfile?.bio || "No bio added"}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <div className="text-sm font-medium">Email</div>
                <div>{userProfile?.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Phone</div>
                <div>{userProfile?.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xl font-semibold">
              {userProfile?.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-semibold">Edit Profile</h2>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setIsEditing(false)}
            type="button"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Internship Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Select
                value={formData.company}
                onValueChange={(value) => setFormData({ ...formData, company: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.name} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    .find((c) => c.name === formData.company)
                    ?.locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Internship Dates</label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateRange?.from ? (
                        formData.dateRange.to ? (
                          <>
                            {format(formData.dateRange.from, "LLL d")} -{" "}
                            {format(formData.dateRange.to, "LLL d, yyyy")}
                          </>
                        ) : (
                          format(formData.dateRange.from, "LLL d, yyyy")
                        )
                      ) : (
                        <span>Select internship dates</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={formData.dateRange?.from}
                      selected={formData.dateRange}
                      onSelect={(range) => 
                        setFormData(prev => ({
                          ...prev,
                          dateRange: range || { from: undefined, to: undefined }
                        }))
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Housing Preferences</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Monthly Budget</label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Enter your monthly budget"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full h-24 px-3 py-2 border rounded-md"
                placeholder="Share a bit about yourself..."
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
} 