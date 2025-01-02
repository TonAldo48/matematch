"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeocodingResult {
  company: string
  address: string
  latitude: number
  longitude: number
  formattedAddress: string
  zipCode: string
}

export function LocationLookup() {
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<GeocodingResult[]>([])
  const { toast } = useToast()

  const extractZipCode = (formattedAddress: string): string => {
    // Match US ZIP code pattern (5 digits, optionally followed by -#### for ZIP+4)
    const match = formattedAddress.match(/\b\d{5}(?:-\d{4})?\b/)
    return match ? match[0] : "N/A"
  }

  const handleLookup = async () => {
    if (!company || !location) {
      toast({
        title: "Missing Information",
        description: "Please enter both company name and location",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const address = `${company}, ${location}`
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      
      const data = await response.json()
      
      if (data.status === "OK") {
        const formattedAddress = data.results[0].formatted_address
        const newResult: GeocodingResult = {
          company,
          address: location,
          latitude: data.results[0].geometry.location.lat,
          longitude: data.results[0].geometry.location.lng,
          formattedAddress,
          zipCode: extractZipCode(formattedAddress)
        }
        
        setResults(prev => [newResult, ...prev])
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find coordinates for this location",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lookup location",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Information copied to clipboard"
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Company Name</label>
            <div className="flex gap-2">
              <Building2 className="h-4 w-4 mt-3" />
              <Input
                placeholder="Enter company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 mt-3" />
              <Input
                placeholder="Enter location (e.g., '1600 Amphitheatre Parkway, Mountain View, CA')"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleLookup} 
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? "Looking up..." : "Lookup Coordinates"}
          </Button>
        </div>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Results</h2>
          {results.map((result, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{result.company}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${result.latitude}, ${result.longitude}`)}
                      title="Copy coordinates"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.zipCode)}
                      title="Copy ZIP code"
                    >
                      {result.zipCode}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{result.formattedAddress}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-mono">
                    {result.latitude}, {result.longitude}
                  </p>
                  <Badge variant="secondary">
                    ZIP: {result.zipCode}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 