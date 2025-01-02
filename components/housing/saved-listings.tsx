"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/user-profile-context"
import { SavedListing, ListingInterest } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, Heart, MessageCircle, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function SavedListings() {
  const { userProfile } = useUserProfile()
  const { toast } = useToast()
  const [savedListings, setSavedListings] = useState<SavedListing[]>([])
  const [interestedListings, setInterestedListings] = useState<ListingInterest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      loadSavedListings()
    }
  }, [userProfile])

  const loadSavedListings = async () => {
    try {
      const [savedResponse, interestResponse] = await Promise.all([
        fetch(`/api/listings/saved?userId=${userProfile?.id}`),
        fetch(`/api/listings/interest?userId=${userProfile?.id}`)
      ])

      if (!savedResponse.ok || !interestResponse.ok) 
        throw new Error('Failed to load listings')

      const savedData = await savedResponse.json()
      const interestData = await interestResponse.json()

      // Merge saved listings with their interest data
      const mergedListings = savedData.map((listing: SavedListing) => ({
        ...listing,
        interest: interestData.find((i: ListingInterest) => i.listingId === listing.listingId)
      }))

      setSavedListings(mergedListings)
    } catch (error) {
      console.error('Failed to load saved listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInterestedListings = async () => {
    try {
      const response = await fetch(`/api/listings/interest?userId=${userProfile?.id}`)
      if (!response.ok) throw new Error('Failed to load interested listings')
      const data = await response.json()
      setInterestedListings(data)
    } catch (error) {
      console.error('Failed to load interested listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSaved = async (listingId: string) => {
    try {
      const response = await fetch('/api/listings/saved', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile?.id,
          listingId
        })
      })

      if (!response.ok) throw new Error('Failed to remove listing')
      
      await loadSavedListings()
      
      toast({
        title: "Listing removed",
        description: "Successfully removed from saved listings"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove listing",
        variant: "destructive"
      })
    }
  }

  const handleRemoveInterest = async (listingId: string) => {
    try {
      const response = await fetch('/api/listings/interest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          userId: userProfile?.id
        })
      })

      if (!response.ok) throw new Error('Failed to remove interest')
      
      await loadSavedListings()
      
      toast({
        title: "Interest removed",
        description: "Successfully removed your interest"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove interest",
        variant: "destructive"
      })
    }
  }

  const handleExpressInterest = async (listing: SavedListing) => {
    if (!userProfile) return;

    try {
      const response = await fetch('/api/listings/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.listingId,
          listingTitle: listing.listingTitle,
          listingUrl: listing.listingUrl,
          user: {
            id: userProfile.id,
            name: userProfile.name,
            company: userProfile.company,
            role: userProfile.role,
            dates: userProfile.dates
          }
        })
      })

      if (!response.ok) throw new Error('Failed to express interest')
      
      await loadSavedListings()

      toast({
        title: "Interest registered",
        description: "Successfully expressed interest in listing"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to express interest",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : savedListings.length === 0 && interestedListings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No saved or interested listings yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Save listings you're interested in by clicking the heart icon or express interest to connect with others
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Saved Listings Section */}
          {savedListings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saved Listings ({savedListings.length})
              </h2>
              <div className="space-y-4">
                {savedListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="flex gap-6 p-4">
                      {/* Image */}
                      <div className="relative w-48 h-32 flex-shrink-0">
                        <img 
                          src={listing.listingImage} 
                          alt={listing.listingTitle}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold truncate">{listing.listingTitle}</h3>
                            <p className="text-sm text-gray-600">
                              Saved {new Date(listing.savedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {listing.price.currency}{listing.price.amount}
                              <span className="text-sm text-gray-600">/{listing.price.period}</span>
                            </p>
                          </div>
                        </div>

                        {/* Interest Status */}
                        <div className="mt-4 flex items-center gap-3">
                          {listing.interest ? (
                            <>
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {listing.interest.users.length} Interested
                              </Badge>
                              {listing.interest.users.find(u => u.id === userProfile?.id) ? (
                                <Badge variant="default" className="bg-teal-500">
                                  You're Interested
                                </Badge>
                              ) : null}
                              <div className="flex -space-x-2">
                                {listing.interest.users.slice(0, 3).map((user) => (
                                  <Avatar key={user.id} className="border-2 border-white h-6 w-6">
                                    <AvatarFallback className="bg-teal-100 text-teal-600 text-xs">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {listing.interest.users.length > 3 && (
                                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                    <span className="text-xs text-gray-600">
                                      +{listing.interest.users.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <Badge variant="secondary">No Interest Yet</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <div className="flex gap-2 flex-1">
                            <Button 
                              variant="outline" 
                              onClick={() => window.open(listing.listingUrl, '_blank')}
                            >
                              View on Airbnb
                            </Button>
                            {listing.interest?.users.find(u => u.id === userProfile?.id) ? (
                              <Button 
                                variant="outline"
                                size="icon"
                                className="text-red-600 hover:text-red-700 shrink-0"
                                onClick={() => handleRemoveInterest(listing.listingId)}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-teal-600 hover:text-teal-700 shrink-0"
                                onClick={() => handleExpressInterest(listing)}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 shrink-0"
                            onClick={() => handleRemoveSaved(listing.listingId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Interested Listings Section */}
          {interestedListings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-500" />
                Interested Listings ({interestedListings.length})
              </h2>
              <div className="space-y-4">
                {interestedListings.map((listing) => (
                  <Card key={listing.listingId} className="overflow-hidden">
                    <div className="flex gap-6 p-4">
                      {/* Image */}
                      <div className="relative w-48 h-32 flex-shrink-0">
                        <img 
                          src={listing.listingImage} 
                          alt={listing.listingTitle}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold truncate">{listing.listingTitle}</h3>
                            <p className="text-sm text-gray-600">
                              Interested since {new Date(listing.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Other Interested People */}
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Other Interested People:</p>
                          <div className="flex -space-x-2 mb-3">
                            {listing.users.map((user) => (
                              <Avatar key={user.id} className="border-2 border-white h-8 w-8">
                                <AvatarFallback className="bg-teal-100 text-teal-600 text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <div className="space-y-1">
                            {listing.users.map((user) => (
                              <div key={user.id} className="text-sm text-gray-600">
                                {user.name} · {user.role} at {user.company}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => window.open(listing.listingUrl, '_blank')}
                          >
                            View on Airbnb
                          </Button>
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveInterest(listing.listingId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 