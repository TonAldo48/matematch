"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/user-profile-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, Calendar, MessageSquare, DollarSign, Users, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// Dummy data interface
interface RoommateProfile {
  id: string
  name: string
  role: string
  company: string
  location: string
  dates: string
  bio: string
  preferences: {
    maxBudget: number
    preferredAreas: string[]
    lifestyle: string[]
  }
}

// Dummy data
const DUMMY_ROOMMATES: RoommateProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Meta",
    location: "Moving from Seattle",
    dates: "May - August 2024",
    bio: "Looking for a roommate during my summer internship. I enjoy cooking, hiking, and quiet evenings.",
    preferences: {
      maxBudget: 2000,
      preferredAreas: ["Menlo Park", "Palo Alto", "Mountain View"],
      lifestyle: ["Clean", "Early riser", "Occasional social gatherings"]
    }
  },
  {
    id: "2",
    name: "Michael Park",
    role: "Product Manager",
    company: "Meta",
    location: "Moving from Boston",
    dates: "June - September 2024",
    bio: "PM intern seeking housing near Meta. I'm tidy, respectful, and always up for good conversation.",
    preferences: {
      maxBudget: 2500,
      preferredAreas: ["Menlo Park", "Redwood City"],
      lifestyle: ["Neat", "Social", "Remote work"]
    }
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    role: "Data Scientist",
    company: "Meta",
    location: "Moving from Austin",
    dates: "May - August 2024",
    bio: "First time in Bay Area! Looking for roommates who enjoy exploring new places and maintaining a clean living space.",
    preferences: {
      maxBudget: 1800,
      preferredAreas: ["Menlo Park", "San Jose"],
      lifestyle: ["Clean", "Active", "Foodie"]
    }
  }
]

// Add interface for preferences
interface RoommatePreferences {
  maxBudget: number
  preferredAreas: string[]
  lifestyle: string[]
  bio: string
}

// Add these constants
const AREAS = [
  "Menlo Park",
  "Palo Alto",
  "Mountain View",
  "Redwood City",
  "San Jose",
  "San Francisco"
]

const LIFESTYLE_TRAITS = [
  "Early riser",
  "Night owl",
  "Clean",
  "Social",
  "Quiet",
  "Remote work",
  "Active",
  "Foodie",
  "Pet-friendly"
]

// First, add the Slack icon component at the top of the file
const SlackIcon = () => (
  <svg 
    className="h-4 w-4 mr-2" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M6.194 14.644c0 1.16-.943 2.107-2.103 2.107-1.16 0-2.103-.947-2.103-2.107 0-1.16.943-2.107 2.103-2.107h2.103v2.107zm1.061 0c0-1.16.943-2.107 2.103-2.107 1.16 0 2.103.947 2.103 2.107v5.274c0 1.16-.943 2.107-2.103 2.107-1.16 0-2.103-.947-2.103-2.107v-5.274zm2.103-8.469c-1.16 0-2.103-.947-2.103-2.107s.943-2.107 2.103-2.107 2.103.947 2.103 2.107v2.107h-2.103zm0 1.061c1.16 0 2.103.947 2.103 2.107s-.943 2.107-2.103 2.107h-5.275c-1.16 0-2.103-.947-2.103-2.107s.943-2.107 2.103-2.107h5.275zm8.469 2.107c0-1.16.943-2.107 2.103-2.107 1.16 0 2.103.947 2.103 2.107s-.943 2.107-2.103 2.107h-2.103v-2.107zm-1.061 0c0 1.16-.943 2.107-2.103 2.107-1.16 0-2.103-.947-2.103-2.107v-5.274c0-1.16.943-2.107 2.103-2.107 1.16 0 2.103.947 2.103 2.107v5.274zm-2.103 8.469c1.16 0 2.103.947 2.103 2.107s-.943 2.107-2.103 2.107-2.103-.947-2.103-2.107v-2.107h2.103zm0-1.061c-1.16 0-2.103-.947-2.103-2.107s.943-2.107 2.103-2.107h5.275c1.16 0 2.103.947 2.103 2.107s-.943 2.107-2.103 2.107h-5.275z"/>
  </svg>
)

export function RoommateSearch() {
  const { userProfile } = useUserProfile()
  const { toast } = useToast()
  const [roommates] = useState<RoommateProfile[]>(DUMMY_ROOMMATES)
  const [preferences, setPreferences] = useState<RoommatePreferences>({
    maxBudget: 2000,
    preferredAreas: ["Menlo Park", "Palo Alto"],
    lifestyle: ["Clean", "Social"],
    bio: ""
  })

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Preferences updated",
      description: "Your roommate preferences have been saved."
    })
  }

  const handleConnect = (roommate: RoommateProfile) => {
    toast({
      title: "Coming soon!",
      description: `The messaging feature will be available soon. You'll be able to connect with ${roommate.name}.`
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="p-8 bg-gradient-to-br from-teal-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 ring-4 ring-white">
              <AvatarFallback className="bg-teal-100 text-teal-600 text-2xl">
                {userProfile?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{userProfile?.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Building2 className="h-4 w-4" />
                <p>{userProfile?.role} at {userProfile?.company}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <p className="text-sm">{userProfile?.dates}</p>
              </div>
              {preferences.bio ? (
                <p className="mt-4 text-sm text-gray-600 max-w-2xl">{preferences.bio}</p>
              ) : (
                <p className="mt-4 text-sm text-gray-400 italic">Add a bio to help potential roommates get to know you...</p>
              )}
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-teal-600 border-teal-200 hover:border-teal-300">
                <Settings2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Roommate Preferences</DialogTitle>
                <DialogDescription>
                  Set your preferences for finding compatible roommates
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                {/* Budget Section */}
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">Maximum Monthly Budget</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">$</span>
                    <Input
                      id="maxBudget"
                      type="number"
                      value={preferences.maxBudget}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        maxBudget: parseInt(e.target.value)
                      }))}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-2">
                  <Label htmlFor="bio">About You</Label>
                  <textarea
                    id="bio"
                    value={preferences.bio}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    className="w-full h-24 px-3 py-2 border rounded-md"
                    placeholder="Share a bit about yourself, your schedule, and what you're looking for in a roommate..."
                  />
                </div>

                {/* Preferred Areas */}
                <div className="space-y-2">
                  <Label>Preferred Areas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AREAS.map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <Checkbox
                          id={`area-${area}`}
                          checked={preferences.preferredAreas.includes(area)}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({
                              ...prev,
                              preferredAreas: checked
                                ? [...prev.preferredAreas, area]
                                : prev.preferredAreas.filter(a => a !== area)
                            }))
                          }}
                        />
                        <label htmlFor={`area-${area}`} className="text-sm">
                          {area}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifestyle Traits */}
                <div className="space-y-2">
                  <Label>Lifestyle</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {LIFESTYLE_TRAITS.map((trait) => (
                      <div key={trait} className="flex items-center gap-2">
                        <Checkbox
                          id={`trait-${trait}`}
                          checked={preferences.lifestyle.includes(trait)}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({
                              ...prev,
                              lifestyle: checked
                                ? [...prev.lifestyle, trait]
                                : prev.lifestyle.filter(t => t !== trait)
                            }))
                          }}
                        />
                        <label htmlFor={`trait-${trait}`} className="text-sm">
                          {trait}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Save Preferences
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Preferences Summary */}
        <div className="mt-8 grid grid-cols-3 gap-8 pt-8 border-t border-teal-100">
          <div>
            <h3 className="text-sm font-medium uppercase text-gray-500 mb-3">Budget</h3>
            <Badge variant="secondary" className="text-sm bg-teal-50 text-teal-700 hover:bg-teal-100">
              <DollarSign className="h-4 w-4 mr-1" />
              Up to ${preferences.maxBudget}/month
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium uppercase text-gray-500 mb-3">Preferred Areas</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.preferredAreas.length > 0 ? (
                preferences.preferredAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                    <MapPin className="h-3 w-3 mr-1" />
                    {area}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">No areas selected</span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium uppercase text-gray-500 mb-3">Lifestyle</h3>
            <div className="flex flex-wrap gap-2">
              {preferences.lifestyle.length > 0 ? (
                preferences.lifestyle.map((trait) => (
                  <Badge key={trait} variant="outline" className="border-teal-200 text-teal-700">
                    {trait}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">No traits selected</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Matches Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Potential Roommates</h2>
          <Badge variant="outline" className="px-4 py-1.5 border-teal-200">
            <Users className="h-4 w-4 mr-2 text-teal-600" />
            {roommates.length} matches at {userProfile?.company}
          </Badge>
        </div>

        <div className="space-y-4">
          {roommates.map((roommate) => (
            <Card key={roommate.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-white">
                    <AvatarFallback className="bg-teal-100 text-teal-600 text-lg">
                      {roommate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{roommate.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{roommate.role} at {roommate.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{roommate.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{roommate.dates}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pl-[4.5rem]">
                  <p className="text-gray-600">{roommate.bio}</p>
                  <div className="mt-6 flex gap-8">
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">Budget</span>
                      <p className="text-sm mt-1">Up to ${roommate.preferences.maxBudget}/month</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">Areas</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roommate.preferences.preferredAreas.map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">Lifestyle</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {roommate.preferences.lifestyle.map((trait) => (
                          <Badge key={trait} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button
                    className="bg-[#4A154B] hover:bg-[#3a1139]" // Slack purple color
                    onClick={() => handleConnect(roommate)}
                  >
                    <SlackIcon />
                    Message in Slack
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 