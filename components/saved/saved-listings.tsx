"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/user-profile-context"
import { SavedListing } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2 } from "lucide-react"

export function SavedListings() {
  const { userProfile } = useUserProfile()
  const { toast } = useToast()
  const [listings, setListings] = useState<SavedListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile) {
      loadSavedListings()
    }
  }, [userProfile])

  const loadSavedListings = async () => {
    try {
      const response = await fetch(`/api/listings/saved?userId=${userProfile?.id}`)
      if (!response.ok) throw new Error('Failed to load saved listings')
      const data = await response.json()
      setListings(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load saved listings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (listingId: string) => {
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
      
      setListings(prev => prev.filter(l => l.listingId !== listingId))
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Saved Listings</h1>
      
      {listings.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No saved listings yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Save listings you're interested in to track them here
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={listing.listingImage} 
                  alt={listing.listingTitle}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold truncate">{listing.listingTitle}</h3>
                  <p className="text-sm text-gray-600">
                    Saved {new Date(listing.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold">
                    {listing.price.currency}{listing.price.amount}
                    <span className="text-sm text-gray-600">
                      /{listing.price.period}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(listing.listingUrl, '_blank')}
                  >
                    View Listing
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRemove(listing.listingId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 