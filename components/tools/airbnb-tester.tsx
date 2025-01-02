"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon, DollarSign, Users, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { searchListings } from "@/services/airbnb"
import Image from "next/image"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AirbnbTester() {
  const [location, setLocation] = useState("")
  const [checkin, setCheckin] = useState<Date>()
  const [checkout, setCheckout] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [listings, setListings] = useState<any[]>([])
  const [error, setError] = useState<string>("")
  const [rawResponse, setRawResponse] = useState<string>("")
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!location || !checkin || !checkout) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setError("")
    setRawResponse("")

    try {
      const results = await searchListings({
        location,
        checkin: format(checkin, 'yyyy-MM-dd'),
        checkout: format(checkout, 'yyyy-MM-dd'),
        adults: guests,
      })
      setListings(results)
      setRawResponse(JSON.stringify(results, null, 2))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast({
        title: "Error",
        description: "Failed to fetch listings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Input
              placeholder="Enter city or address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Check-in</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkin ? format(checkin, 'PP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkin}
                  onSelect={setCheckin}
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
                  {checkout ? format(checkout, 'PP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkout}
                  onSelect={setCheckout}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Guests</label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Test Search'
          )}
        </Button>
      </Card>

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
        </Card>
      )}

      {listings.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Results ({listings.length})</h3>
            <Button
              variant="outline"
              onClick={() => {
                const el = document.createElement('textarea');
                el.value = rawResponse;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                toast({
                  title: "Copied!",
                  description: "Raw response copied to clipboard"
                });
              }}
            >
              Copy Raw Response
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{listing.title}</h3>
                    <Badge variant="secondary">
                      ${listing.price.rate}/night
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{listing.address}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {listing.roomType}
                    </Badge>
                    <Badge variant="outline">
                      {listing.bedrooms} bed(s)
                    </Badge>
                    <Badge variant="outline">
                      {listing.bathrooms} bath(s)
                    </Badge>
                    {listing.rating && (
                      <Badge variant="outline">
                        ★ {listing.rating}
                      </Badge>
                    )}
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => window.open(listing.url, '_blank')}
                  >
                    View on Airbnb
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Raw Response</h3>
            <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
              {rawResponse}
            </pre>
          </Card>
        </>
      )}
    </div>
  )
} 