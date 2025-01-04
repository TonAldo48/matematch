"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/user-profile-context"
import { Building2, MapPin, DollarSign, Users, Calendar, Bus, Loader2, BookmarkPlus, BookmarkCheck, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { getCachedDistance, cacheDistance } from "@/lib/distance-cache"
import { InterestedUser, ListingInterest, SavedListing } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Distance {
  driving?: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
  }
  transit?: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
  }
}

interface Coordinates {
  lat: number
  lng: number
}

interface ListingWithDistance extends SearchListing {
  distance?: Distance
  coordinates?: Coordinates
  isLoadingDistance?: boolean
  interest?: ListingInterest
  isSaved?: boolean
}

// Add type for stored search state
interface StoredSearchState {
  listings: ListingWithDistance[]
  formInputs: typeof DEFAULT_FORM_INPUTS
  activeFilters: typeof DEFAULT_FILTERS
  currentPage: number
  totalPages: number
  timestamp: number
}

// Add constants for default values
const DEFAULT_FORM_INPUTS = {
  location: "",
  checkIn: undefined as Date | undefined,
  checkOut: undefined as Date | undefined,
  guests: 1,
}

const DEFAULT_FILTERS = {
  maxPrice: 5000,
  maxDistance: 10,
  maxBeds: 3,
  priceRange: [0, 5000] as [number, number],
  instantBook: false,
  superhost: false,
}

const LISTINGS_PER_PAGE = 9 // 3x3 grid

type SortOption = 'price_low' | 'price_high' | 'distance' | 'rating';

export function HousingSearch() {
  const { userProfile } = useUserProfile()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingListings, setLoadingListings] = useState(false)
  const [listings, setListings] = useState<ListingWithDistance[]>([])
  const [companyCoords, setCompanyCoords] = useState<Coordinates | null>(null)
  const [loadingInterest, setLoadingInterest] = useState<{ [key: string]: boolean }>({})
  const [savedListingIds, setSavedListingIds] = useState<string[]>([])
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Replace existing state with localStorage
  const [storedSearch, setStoredSearch] = useLocalStorage<StoredSearchState | null>(
    'housing-search',
    null
  )

  // Initialize with default values
  const [formInputs, setFormInputs] = useState(DEFAULT_FORM_INPUTS)
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS)
  const [processedListings, setProcessedListings] = useState<ListingWithDistance[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState<SortOption>('price_low');

  // Add a new effect to handle initial state hydration
  useEffect(() => {
    if (storedSearch) {
      const isToday = new Date(storedSearch.timestamp).toDateString() === new Date().toDateString()
      if (isToday) {
        setListings(storedSearch.listings)
        setProcessedListings(storedSearch.listings)
        setFormInputs(storedSearch.formInputs)
        setActiveFilters(storedSearch.activeFilters)
        setCurrentPage(storedSearch.currentPage)
        setTotalPages(storedSearch.totalPages)
      } else {
        setStoredSearch(null)
      }
    }
  }, [storedSearch])

  // Update the save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (processedListings.length > 0) {
        setStoredSearch({
          listings: processedListings,
          formInputs,
          activeFilters,
          currentPage,
          totalPages,
          timestamp: Date.now()
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [processedListings, formInputs, activeFilters, currentPage, totalPages])

  const getCompanyCoordinates = async (location: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `address=${encodeURIComponent(location)}&` +
        `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      if (data.results?.[0]?.geometry?.location) {
        setCompanyCoords(data.results[0].geometry.location)
      }
    } catch (error) {
      console.error('Failed to get company coordinates:', error)
    }
  }

  const calculateDistance = async (listing: ListingWithDistance) => {
    if (!companyCoords || listing.isLoadingDistance || listing.distance) return

    // Check cache first
    const cachedDistance = getCachedDistance(listing.id, formInputs.location)
    if (cachedDistance) {
      // Update both listings and processedListings
      const updateWithDistance = (prev: ListingWithDistance[]) => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, distance: cachedDistance }
            : l
        )

      setListings(updateWithDistance)
      setProcessedListings(updateWithDistance)
      
      // Update stored search
      setStoredSearch(prev => prev ? {
        ...prev,
        listings: updateWithDistance(prev.listings)
      } : null)
      
      return
    }

    // Show loading state
    const updateLoadingState = (prev: ListingWithDistance[]) => 
      prev.map(l => 
        l.id === listing.id 
          ? { ...l, isLoadingDistance: true }
          : l
      )

    setListings(updateLoadingState)
    setProcessedListings(updateLoadingState)

    try {
      // Get listing coordinates if we don't have them yet
      if (!listing.coordinates) {
        const coordsResponse = await fetch("/api/scrape/coordinates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: listing.url })
        })
        
        if (!coordsResponse.ok) throw new Error("Failed to get coordinates")
        const { coordinates } = await coordsResponse.json()
        listing.coordinates = coordinates
      }

      // Calculate distance
      const distanceResponse = await fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: companyCoords,
          destination: listing.coordinates
        })
      })
      
      if (!distanceResponse.ok) throw new Error("Failed to calculate distance")
      const distance = await distanceResponse.json()

      // Cache the result
      cacheDistance(listing.id, formInputs.location, distance)

      // Update all states with distance info
      const updateWithDistance = (prev: ListingWithDistance[]) => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, distance, isLoadingDistance: false }
            : l
        )

      setListings(updateWithDistance)
      setProcessedListings(updateWithDistance)
      
      // Update stored search
      setStoredSearch(prev => prev ? {
        ...prev,
        listings: updateWithDistance(prev.listings)
      } : null)

    } catch (error) {
      console.error('Failed to calculate distance:', error)
      toast({
        title: "Error",
        description: "Failed to calculate distance",
        variant: "destructive"
      })

      // Reset loading state in all states
      const resetLoadingState = (prev: ListingWithDistance[]) => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, isLoadingDistance: false }
            : l
        )

      setListings(resetLoadingState)
      setProcessedListings(resetLoadingState)
      setStoredSearch(prev => prev ? {
        ...prev,
        listings: resetLoadingState(prev.listings)
      } : null)
    }
  }

  const handleSearch = async (page = 1) => {
    if (!formInputs.location) {
      toast({
        title: "Location required",
        description: "Please enter a location to search",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setProcessedListings([]) // Clear existing listings
    try {
      await getCompanyCoordinates(formInputs.location)

      // Construct Airbnb URL with filters
      const searchUrl = new URL("https://www.airbnb.com/s/homes")
      searchUrl.searchParams.set("query", formInputs.location)
      searchUrl.searchParams.set("adults", formInputs.guests.toString())
      searchUrl.searchParams.set("page", page.toString())
      if (formInputs.checkIn) searchUrl.searchParams.set("checkin", format(formInputs.checkIn, "yyyy-MM-dd"))
      if (formInputs.checkOut) searchUrl.searchParams.set("checkout", format(formInputs.checkOut, "yyyy-MM-dd"))
      
      // Add filter parameters
      searchUrl.searchParams.set("price_min", (activeFilters.priceRange[0] / 30).toString())
      searchUrl.searchParams.set("price_max", (activeFilters.priceRange[1] / 30).toString())
      searchUrl.searchParams.set("min_bedrooms", "1")
      searchUrl.searchParams.set("max_bedrooms", activeFilters.maxBeds.toString())
      if (activeFilters.instantBook) searchUrl.searchParams.set("instant_book", "true")
      if (activeFilters.superhost) searchUrl.searchParams.set("superhost", "true")

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: searchUrl.toString() })
      })

      if (!response.ok) throw new Error("Failed to fetch listings")
      
      const data = await response.json()
      setLoading(false)
      setLoadingListings(true)

      // Process listings one by one
      const newListings = [] // Store new listings here
      for (const listing of data.listings) {
        // Check cache for distance
        const cachedDistance = getCachedDistance(listing.id, formInputs.location)
        const listingWithDistance = cachedDistance 
          ? { ...listing, distance: cachedDistance }
          : listing

        // Check if saved
        const isSaved = savedListingIds.includes(listing.id)
        
        newListings.push({
          ...listingWithDistance,
          isSaved
        })

        // Update UI progressively
        setProcessedListings(prev => [...prev, newListings[newListings.length - 1]])
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const sortedListings = sortListings(newListings);
      setProcessedListings(sortedListings);

      setCurrentPage(page)
      setTotalPages(Math.ceil(data.total / LISTINGS_PER_PAGE))
      
      toast({
        title: "Search complete",
        description: `Found ${data.total} properties in ${formInputs.location}`
      })

      // Save search state immediately after completing
      setStoredSearch({
        listings: sortedListings,
        formInputs,
        activeFilters,
        currentPage: page,
        totalPages: Math.ceil(data.total / LISTINGS_PER_PAGE),
        timestamp: Date.now()
      })

    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to fetch listings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setLoadingListings(false)
    }
  }

  const handleInterest = async (listing: ListingWithDistance) => {
    if (!userProfile) {
      toast({
        title: "Sign in required",
        description: "Please sign in to express interest in listings",
        variant: "destructive"
      })
      return
    }

    setLoadingInterest(prev => ({ ...prev, [listing.id]: true }))

    try {
      // Express interest
      const interestResponse = await fetch('/api/listings/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          listingTitle: listing.title,
          listingUrl: listing.url,
          user: {
            id: userProfile.id,
            name: userProfile.name,
            company: userProfile.company,
            role: userProfile.role,
            dates: userProfile.dates
          }
        })
      })

      if (!interestResponse.ok) throw new Error('Failed to update interest')
      const interestData = await interestResponse.json()

      // Automatically save the listing if not already saved
      if (!listing.isSaved) {
        await handleSave(listing, true) // Pass true to skip toast notification
      }

      // Update states
      setListings(prev => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, interest: interestData, isSaved: true }
            : l
        )
      )
      
      setProcessedListings(prev => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, interest: interestData, isSaved: true }
            : l
        )
      )

      toast({
        title: "Interest registered",
        description: "Listing has been saved and your interest has been registered"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register interest",
        variant: "destructive"
      })
    } finally {
      setLoadingInterest(prev => ({ ...prev, [listing.id]: false }))
    }
  }

  const handleUninterest = async (listing: ListingWithDistance) => {
    if (!userProfile) return;

    setLoadingInterest(prev => ({ ...prev, [listing.id]: true }))

    try {
      const response = await fetch('/api/listings/interest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          userId: userProfile.id
        })
      })

      if (!response.ok) throw new Error('Failed to remove interest')
      
      const data = await response.json()
      
      // Update both listings and processedListings
      setListings(prev => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, interest: data }
            : l
        )
      )
      
      setProcessedListings(prev => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, interest: data }
            : l
        )
      )

      toast({
        title: "Interest removed",
        description: "You've been removed from the interested list"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove interest",
        variant: "destructive"
      })
    } finally {
      setLoadingInterest(prev => ({ ...prev, [listing.id]: false }))
    }
  }

  const handleSave = async (listing: ListingWithDistance) => {
    if (!userProfile) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save listings",
        variant: "destructive"
      })
      return
    }

    try {
      const method = listing.isSaved ? 'DELETE' : 'POST'
      const response = await fetch('/api/listings/saved', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          listing,
          listingId: listing.id
        })
      })

      if (!response.ok) throw new Error('Failed to update listing')

      // Update both listings and processedListings
      const updateListingState = (prev: ListingWithDistance[]) => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, isSaved: !l.isSaved }
            : l
        )

      setListings(updateListingState)
      setProcessedListings(updateListingState)

      // Update saved IDs list
      if (listing.isSaved) {
        setSavedListingIds(prev => prev.filter(id => id !== listing.id))
      } else {
        setSavedListingIds(prev => [...prev, listing.id])
      }

      // Update stored search state
      setStoredSearch(prev => prev ? {
        ...prev,
        listings: updateListingState(prev.listings)
      } : null)

      // Show success toast
      toast({
        title: listing.isSaved ? "Listing removed" : "Listing saved",
        description: listing.isSaved 
          ? "Removed from your saved listings"
          : (
            <div className="flex flex-col gap-2">
              <p>Added to your saved listings</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/housing?tab=saved-listings'}
              >
                View Saved Listings
              </Button>
            </div>
          )
      })

    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${listing.isSaved ? 'remove' : 'save'} listing`,
        variant: "destructive"
      })
      
      // Revert all states on error
      const revertListingState = (prev: ListingWithDistance[]) => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, isSaved: listing.isSaved }
            : l
        )

      setListings(revertListingState)
      setProcessedListings(revertListingState)
      setStoredSearch(prev => prev ? {
        ...prev,
        listings: revertListingState(prev.listings)
      } : null)
    }
  }

  // Add function to load saved listings
  const loadSavedListings = async () => {
    if (!userProfile) return
    
    try {
      const response = await fetch(`/api/listings/saved?userId=${userProfile.id}`)
      if (!response.ok) throw new Error('Failed to load saved listings')
      const data: SavedListing[] = await response.json()
      setSavedListingIds(data.map(listing => listing.listingId))
      
      // Update current listings with saved state
      setListings(prev => 
        prev.map(listing => ({
          ...listing,
          isSaved: data.some(saved => saved.listingId === listing.id)
        }))
      )
    } catch (error) {
      console.error('Failed to load saved listings:', error)
    }
  }

  // Add useEffect to load saved listings on mount
  useEffect(() => {
    if (userProfile && !initialLoadDone) {
      loadSavedListings()
      setInitialLoadDone(true)
    }
  }, [userProfile, initialLoadDone])

  const calculateMonthlyPrice = (price: { 
    discounted?: number, 
    original: number, 
    period: string 
  }) => {
    const basePrice = price.discounted || price.original;
    // Always treat price as nightly unless explicitly marked as monthly
    return price.period === 'month' ? basePrice : Math.round(basePrice * 30);
  }

  const sortListings = (listings: ListingWithDistance[]) => {
    return [...listings].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.price.discounted || a.price.original) - (b.price.discounted || b.price.original);
        case 'price_high':
          return (b.price.discounted || b.price.original) - (a.price.discounted || a.price.original);
        case 'distance':
          // Put listings with distance at the top
          if (a.distance && !b.distance) return -1;
          if (!a.distance && b.distance) return 1;
          if (!a.distance && !b.distance) return 0;
          // If both have distance, sort by driving distance
          if (a.distance && b.distance) {
            return (a.distance.driving?.distance.value || 0) - (b.distance.driving?.distance.value || 0);
          }
          return 0;
        case 'rating':
          // Put listings with ratings at the top
          if (a.rating && !b.rating) return -1;
          if (!a.rating && b.rating) return 1;
          if (!a.rating && !b.rating) return 0;
          return (b.rating.score || 0) - (a.rating.score || 0);
        default:
          return 0;
      }
    });
  };

  // Add this effect to sort listings when they change or sort option changes
  useEffect(() => {
    if (processedListings.length > 0) {
      setProcessedListings(sortListings(processedListings));
    }
  }, [sortBy]);

  return (
    <div className="space-y-6 w-full">
      {/* Company Information */}
      <Card className="w-full">
        <div className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{userProfile?.company}</h2>
            <p className="text-sm text-gray-600">{userProfile?.location}</p>
          </div>
          <Badge variant="outline" className="text-teal-600">
            {userProfile?.dates}
          </Badge>
        </div>
      </Card>

      {/* Search Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Location and Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input 
                value={formInputs.location}
                onChange={(e) => setFormInputs({
                  ...formInputs,
                  location: e.target.value
                })}
                placeholder="Enter company location"
              />
            </div>

            {/* Check In */}
            <div>
              <label className="text-sm font-medium mb-2 block">Check In</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formInputs.checkIn ? format(formInputs.checkIn, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formInputs.checkIn}
                    onSelect={(date) => setFormInputs({ ...formInputs, checkIn: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check Out */}
            <div>
              <label className="text-sm font-medium mb-2 block">Check Out</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formInputs.checkOut ? format(formInputs.checkOut, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formInputs.checkOut}
                    onSelect={(date) => setFormInputs({ ...formInputs, checkOut: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Monthly Budget Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Monthly Budget Range</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  value={activeFilters.priceRange[0]}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                  }))}
                  placeholder="Min/month"
                  className="w-24"
                />
                <span>-</span>
                <Input 
                  type="number"
                  value={activeFilters.priceRange[1]}
                  onChange={(e) => setActiveFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                  }))}
                  placeholder="Max/month"
                  className="w-24"
                />
              </div>
            </div>

            {/* Max Bedrooms */}
            <div>
              <label className="text-sm font-medium mb-2 block">Max Bedrooms</label>
              <Input 
                type="number"
                value={activeFilters.maxBeds}
                onChange={(e) => setActiveFilters(prev => ({
                  ...prev,
                  maxBeds: parseInt(e.target.value)
                }))}
              />
            </div>

            {/* Checkboxes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Options</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={activeFilters.instantBook}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      instantBook: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Instant Book</span>
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={activeFilters.superhost}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      superhost: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Superhost</span>
                </label>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={() => handleSearch(1)} 
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {processedListings.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600">
              Showing {processedListings.length} listings
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processedListings.map((listing, index) => (
              <Card 
                key={listing.id} 
                className={cn(
                  "overflow-hidden group cursor-pointer",
                  "animate-fadeIn opacity-0",
                  "animation-delay-" + index
                )}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  calculateDistance(listing)
                }}
              >
                {/* Image with navigation dots */}
                <div className="relative aspect-video">
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="object-cover w-full h-full group-hover:opacity-95 transition-opacity"
                  />
                  
                  {/* Heart button */}
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white",
                        listing.isSaved && "text-red-500 hover:text-red-600"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSave(listing)
                      }}
                    >
                      <Heart 
                        className={cn(
                          "h-5 w-5 transition-all",
                          listing.isSaved ? "fill-current" : "fill-white/25"
                        )} 
                      />
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {listing.isGuestFavorite && (
                      <Badge className="bg-white text-black">
                        ⭐ Guest Favorite
                      </Badge>
                    )}
                    {listing.isSuperhost && (
                      <Badge className="bg-rose-500 text-white">
                        Superhost
                      </Badge>
                    )}
                  </div>

                  {/* Navigation dots */}
                  {listing.images.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {listing.images.map((_, index) => (
                        <span
                          key={index}
                          className={`h-1.5 w-1.5 rounded-full ${
                            index === 0 ? 'bg-white' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {/* Title and Rating */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-gray-600">{listing.subtitle}</p>
                    </div>
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="font-medium">{listing.rating.score}</span>
                        <span className="text-sm text-gray-600">
                          ({listing.rating.reviews})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Distance section */}
                  <div className="h-12"> {/* Fixed height container to prevent layout shift */}
                    {listing.isLoadingDistance ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Calculating distance...</span>
                      </div>
                    ) : listing.distance ? (
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {listing.distance.driving?.distance.text} by car 
                            ({listing.distance.driving?.duration.text})
                          </span>
                        </div>
                        {listing.distance.transit && (
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4" />
                            <span>
                              {listing.distance.transit.duration.text} by transit
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Click to calculate distance</span>
                      </div>
                    )}
                  </div>

                  {/* Price Information */}
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-lg">
                      {listing.price.currency}
                      {calculateMonthlyPrice(listing.price)}
                      <span className="text-sm text-gray-600">/month est.</span>
                    </p>
                    <span className="text-xs text-gray-500">
                      (${listing.price.discounted || listing.price.original}/night)
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(listing.url, '_blank')}
                    >
                      View on Airbnb
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="min-w-[120px] px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            {listing.interest?.users.length ? (
                              <>
                                <span>{listing.interest.users.length}</span>
                                <span className="text-sm">Interested</span>
                              </>
                            ) : (
                              "Interest"
                            )}
                          </div>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {listing.interest?.users.length 
                              ? `${listing.interest.users.length} Interested ${listing.interest.users.length === 1 ? 'Person' : 'People'}`
                              : 'Interested People'
                            }
                          </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[400px] overflow-y-auto">
                          {!listing.interest?.users.length ? (
                            <div className="py-8 text-center text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No one has expressed interest yet</p>
                              <p className="text-sm">Be the first one!</p>
                              {userProfile && (
                                <Button 
                                  className="mt-4"
                                  onClick={() => handleInterest(listing)}
                                >
                                  Express Interest
                                </Button>
                              )}
                            </div>
                          ) : (
                            <>
                              <div className="space-y-4">
                                {listing.interest?.users.map((user) => (
                                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="bg-teal-100 text-teal-600">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">
                                          {user.name}
                                        </p>
                                        {user.id === userProfile?.id && (
                                          <Badge variant="secondary" className="text-xs">You</Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 truncate">
                                        {user.role} at {user.company}
                                      </p>
                                    </div>
                                    {user.id !== userProfile?.id ? (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => {
                                          toast({
                                            title: "Coming soon",
                                            description: "Messaging feature will be available soon!"
                                          })
                                        }}
                                      >
                                        Message
                                      </Button>
                                    ) : (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 shrink-0"
                                        onClick={() => handleUninterest(listing)}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {userProfile && !listing.interest?.users.find(u => u.id === userProfile.id) && (
                                <div className="mt-6 pt-4 border-t">
                                  <Button 
                                    className="w-full"
                                    onClick={() => handleInterest(listing)}
                                  >
                                    Express Interest
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => handleSearch(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Page</span>
                <Badge variant="secondary">
                  {currentPage} of {totalPages}
                </Badge>
              </div>
              <Button
                variant="outline"
                disabled={currentPage === totalPages || loading}
                onClick={() => handleSearch(currentPage + 1)}
              >
                Next
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * LISTINGS_PER_PAGE) + 1} - {Math.min(currentPage * LISTINGS_PER_PAGE, processedListings.length)} of {processedListings.length} listings
            </p>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
                  <p>Loading page {currentPage}...</p>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
} 