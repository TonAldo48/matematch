"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface Coordinates {
  lat: number
  lng: number
}

export function DistanceCalculator() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [companyCoords, setCompanyCoords] = useState<Coordinates>({
    lat: 0,
    lng: 0
  })
  const [airbnbUrl, setAirbnbUrl] = useState("")
  const [distance, setDistance] = useState<number | null>(null)

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (coords1: Coordinates, coords2: Coordinates) => {
    const R = 3958.8 // Earth's radius in miles

    const lat1 = coords1.lat * Math.PI / 180
    const lat2 = coords2.lat * Math.PI / 180
    const deltaLat = (coords2.lat - coords1.lat) * Math.PI / 180
    const deltaLng = (coords2.lng - coords1.lng) * Math.PI / 180

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleCalculate = async () => {
    if (!airbnbUrl || !companyCoords.lat || !companyCoords.lng) {
      toast({
        title: "Missing information",
        description: "Please provide both company coordinates and Airbnb listing URL",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/scrape/coordinates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: airbnbUrl })
      })

      if (!response.ok) throw new Error("Failed to fetch coordinates")
      
      const data = await response.json()
      const distance = calculateDistance(companyCoords, data.coordinates)
      setDistance(distance)
      
      toast({
        title: "Distance calculated",
        description: `The listing is ${distance.toFixed(1)} miles from your company location`
      })
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: "Unable to fetch listing coordinates. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Company Location</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Latitude</label>
              <Input 
                type="number"
                step="any"
                value={companyCoords.lat || ""}
                onChange={(e) => setCompanyCoords({
                  ...companyCoords,
                  lat: parseFloat(e.target.value)
                })}
                placeholder="e.g. 37.3861"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Longitude</label>
              <Input 
                type="number"
                step="any"
                value={companyCoords.lng || ""}
                onChange={(e) => setCompanyCoords({
                  ...companyCoords,
                  lng: parseFloat(e.target.value)
                })}
                placeholder="e.g. -122.0839"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Airbnb Listing</h2>
          <Input 
            value={airbnbUrl}
            onChange={(e) => setAirbnbUrl(e.target.value)}
            placeholder="Paste Airbnb listing URL"
          />
        </div>

        <Button 
          onClick={handleCalculate}
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate Distance"}
        </Button>

        {distance !== null && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-center">
              <span className="font-semibold">Distance: </span>
              {distance.toFixed(1)} miles
            </p>
          </div>
        )}
      </div>
    </Card>
  )
} 