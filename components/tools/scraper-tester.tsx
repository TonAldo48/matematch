"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, ImageOff, Users, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SearchParams {
  location: string
  checkin: Date | undefined
  checkout: Date | undefined
  bedrooms: number
}

interface SearchResult {
  listings: {
    id: string
    title: string
    subtitle: string
    isSuperhost: boolean
    isGuestFavorite: boolean
    price: {
      original?: number
      discounted?: number
      period: string
      currency: string
    }
    rating?: {
      score: number
      reviews: number
    }
    images: string[]
    url: string
  }[]
  total: number
  location: string
  filters: {
    dates: {
      checkin: string
      checkout: string
    }
    guests: number
    type: string
  }
}

export function ScraperTester() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: "",
    checkin: undefined,
    checkout: undefined,
    bedrooms: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const handleScrape = async () => {
    if (!searchParams.location || !searchParams.checkin || !searchParams.checkout) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    // Construct Airbnb search URL
    const searchUrl = new URL('https://www.airbnb.com/s/homes')
    searchUrl.searchParams.append('query', searchParams.location)
    searchUrl.searchParams.append('checkin', format(searchParams.checkin, 'yyyy-MM-dd'))
    searchUrl.searchParams.append('checkout', format(searchParams.checkout, 'yyyy-MM-dd'))
    searchUrl.searchParams.append('adults', '1')
    searchUrl.searchParams.append('min_bedrooms', searchParams.bedrooms.toString())

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: searchUrl.toString() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape listings')
      }

      setResult(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to scrape listings')
      toast({
        title: "Error",
        description: "Failed to scrape listings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderListingCard = (listing: SearchResult['listings'][0]) => (
    <Card key={listing.id} className="overflow-hidden">
      <div className="aspect-[4/3] relative bg-gray-100">
        {listing.images.length > 0 ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-gray-400" />
          </div>
        )}
        {(listing.isSuperhost || listing.isGuestFavorite) && (
          <div className="absolute top-2 left-2">
            {listing.isSuperhost && (
              <Badge className="bg-white text-black mr-2">
                Superhost
              </Badge>
            )}
            {listing.isGuestFavorite && (
              <Badge className="bg-white text-black">
                Guest favorite
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{listing.title}</h3>
            <p className="text-sm text-gray-600">{listing.subtitle}</p>
          </div>
          {listing.rating && (
            <Badge variant="secondary">
              ★ {listing.rating.score} ({listing.rating.reviews})
            </Badge>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <p className="font-semibold text-lg">
              {listing.price.currency}
              {listing.price.discounted || listing.price.original}
            </p>
            {listing.price.discounted && (
              <p className="text-sm text-gray-600 line-through">
                {listing.price.currency}{listing.price.original}
              </p>
            )}
            <span className="text-sm text-gray-600">
              /{listing.price.period}
            </span>
          </div>
          {listing.price.discounted && (
            <p className="text-sm text-green-600">
              Save {listing.price.currency}
              {(listing.price.original - listing.price.discounted).toLocaleString()}
            </p>
          )}
        </div>

        <Button 
          className="w-full mt-4"
          onClick={() => window.open(listing.url, '_blank')}
        >
          View on Airbnb
        </Button>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                placeholder="Enter city or address"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  location: e.target.value
                }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bedrooms</label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <Input
                  type="number"
                  min="1"
                  value={searchParams.bedrooms}
                  onChange={(e) => setSearchParams(prev => ({
                    ...prev,
                    bedrooms: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Check-in</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchParams.checkin ? format(searchParams.checkin, 'PP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={searchParams.checkin}
                    onSelect={(date) => setSearchParams(prev => ({
                      ...prev,
                      checkin: date
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Check-out</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchParams.checkout ? format(searchParams.checkout, 'PP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={searchParams.checkout}
                    onSelect={(date) => setSearchParams(prev => ({
                      ...prev,
                      checkout: date
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={handleScrape} 
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search Listings'
            )}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
        </Card>
      )}

      {result && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {result.total} places in {result.location}
              </h2>
              <p className="text-sm text-gray-600">
                {result.filters.dates.checkin} - {result.filters.dates.checkout} • {result.filters.guests} guest
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const el = document.createElement('textarea');
                el.value = JSON.stringify(result, null, 2);
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                toast({
                  title: "Copied!",
                  description: "Raw data copied to clipboard"
                });
              }}
            >
              Copy Raw Data
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.listings.map(renderListingCard)}
          </div>
        </>
      )}
    </div>
  )
} 