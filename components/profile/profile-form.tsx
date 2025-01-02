"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/user-profile-context"
import { companies, roles, schools, preferences as allPreferences } from "@/data/profiles"
import { Badge } from "@/components/ui/badge"
import { Pencil, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProfileForm() {
  const { userProfile, saveProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    userProfile?.preferences || []
  )

  const [formData, setFormData] = useState({
    company: userProfile?.company || "",
    role: userProfile?.role || "",
    location: userProfile?.location || "",
    startDate: userProfile?.dates?.split(" - ")[0] || "",
    endDate: userProfile?.dates?.split(" - ")[1] || "",
    budgetMin: userProfile?.budget?.split("-")[0] || "",
    budgetMax: userProfile?.budget?.split("-")[1] || "",
    school: userProfile?.school || "",
    year: userProfile?.year || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const profile = {
      ...userProfile,
      company: formData.company,
      role: formData.role,
      location: formData.location,
      dates: `${formData.startDate} - ${formData.endDate}`,
      budget: `${formData.budgetMin}-${formData.budgetMax}`,
      preferences: selectedPreferences,
      school: formData.school,
      year: formData.year,
    }

    saveProfile(profile)
    setIsEditing(false)
  }

  if (userProfile && !isEditing) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setFormData({
                  company: userProfile.company,
                  role: userProfile.role,
                  location: userProfile.location,
                  startDate: userProfile.dates.split(" - ")[0],
                  endDate: userProfile.dates.split(" - ")[1],
                  budgetMin: userProfile.budget.split("-")[0],
                  budgetMax: userProfile.budget.split("-")[1],
                  school: userProfile.school,
                  year: userProfile.year,
                })
                setIsEditing(true)
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Company</label>
              <p className="mt-1">{userProfile.company}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1">{userProfile.role}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="mt-1">{userProfile.location}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">School</label>
              <p className="mt-1">{userProfile.school}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Dates</label>
              <p className="mt-1">{userProfile.dates}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Budget</label>
              <p className="mt-1">${userProfile.budget}/month</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500">Preferences</label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Preferences
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Preferences</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {allPreferences.map((pref) => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={pref}
                          checked={selectedPreferences.includes(pref)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPreferences([...selectedPreferences, pref])
                            } else {
                              setSelectedPreferences(
                                selectedPreferences.filter((p) => p !== pref)
                              )
                            }
                          }}
                        />
                        <label htmlFor={pref} className="text-sm">
                          {pref}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      saveProfile({
                        ...userProfile,
                        preferences: selectedPreferences,
                      })
                    }}
                  >
                    Save Preferences
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap gap-2">
              {userProfile.preferences.map((pref) => (
                <Badge key={pref} variant="secondary">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (userProfile && isEditing) {
    return (
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(false)}
              type="button"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

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
              <label className="text-sm font-medium mb-2 block">School</label>
              <Select
                value={formData.school}
                onValueChange={(value) => setFormData({ ...formData, school: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Budget Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preferences</label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Select Preferences
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Your Preferences</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {allPreferences.map((pref) => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={pref}
                          checked={selectedPreferences.includes(pref)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPreferences([...selectedPreferences, pref])
                            } else {
                              setSelectedPreferences(
                                selectedPreferences.filter((p) => p !== pref)
                              )
                            }
                          }}
                        />
                        <label htmlFor={pref} className="text-sm">
                          {pref}
                        </label>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPreferences.map((pref) => (
                  <Badge key={pref} variant="secondary">
                    {pref}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">Complete Your Profile</h2>
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
            <label className="text-sm font-medium mb-2 block">School</label>
            <Select
              value={formData.school}
              onValueChange={(value) => setFormData({ ...formData, school: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Budget Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Preferences</label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Select Preferences
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Your Preferences</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  {allPreferences.map((pref) => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        id={pref}
                        checked={selectedPreferences.includes(pref)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPreferences([...selectedPreferences, pref])
                          } else {
                            setSelectedPreferences(
                              selectedPreferences.filter((p) => p !== pref)
                            )
                          }
                        }}
                      />
                      <label htmlFor={pref} className="text-sm">
                        {pref}
                      </label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedPreferences.map((pref) => (
                <Badge key={pref} variant="secondary">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
          Save Profile
        </Button>
      </form>
    </Card>
  )
} 