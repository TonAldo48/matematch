"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, Code, Building2, Car, Train } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Coordinates {
  lat: number
  lng: number
}

interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

interface LocationResponse {
  coordinates: Coordinates
  boundingBox: BoundingBox | null
  approximated: boolean
  success: boolean
}

interface DistanceResponse {
  driving: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
  }
  transit: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
  }
}

interface VerifyAddressResponse {
  success: boolean
  data?: {
    formattedAddress: string
    coordinates: Coordinates
  }
  error?: string
}

export default function AddressEstimator() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<LocationResponse | null>(null)
  const [rawResponse, setRawResponse] = useState<string>("")
  const [officeAddress, setOfficeAddress] = useState("")
  const [officeLocation, setOfficeLocation] = useState<Coordinates | null>(null)
  const [distanceData, setDistanceData] = useState<DistanceResponse | null>(null)
  const { toast } = useToast()

  const verifyOfficeAddress = async () => {
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: officeAddress }),
      })

      const result: VerifyAddressResponse = await response.json()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to verify office address")
      }

      setOfficeLocation(result.data.coordinates)
      toast({
        title: "Office Location Verified",
        description: result.data.formattedAddress,
      })

      return result.data.coordinates
    } catch (error) {
      console.error("Office address verification error:", error)
      toast({
        title: "Error",
        description: "Failed to verify office address. Please check the address and try again.",
        variant: "destructive",
      })
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.includes("airbnb.com")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Airbnb listing URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Verify office address if not already verified
      let currentOfficeLocation = officeLocation
      if (!currentOfficeLocation && officeAddress) {
        currentOfficeLocation = await verifyOfficeAddress()
        if (!currentOfficeLocation) {
          throw new Error("Failed to verify office address")
        }
      }

      const response = await fetch("/api/airbnb-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()
      setRawResponse(JSON.stringify(result, null, 2))
      
      if (!result.success) {
        throw new Error(result.error || "Failed to estimate location")
      }

      setLocationData(result)

      // Calculate distance if office location is verified
      if (currentOfficeLocation) {
        await calculateDistance(result.coordinates, currentOfficeLocation)
      }

    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to estimate location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = async (airbnbLocation: Coordinates, office: Coordinates) => {
    try {
      const response = await fetch("/api/commute-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: airbnbLocation,
          destination: office
        }),
      })

      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }

      setDistanceData(result)
    } catch (error) {
      console.error("Distance calculation error:", error)
      toast({
        title: "Error",
        description: "Failed to calculate distance to office",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Airbnb Location Estimator</CardTitle>
          <CardDescription>
            Enter an Airbnb listing URL and your office address to calculate distances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="font-medium">Office Address</h3>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter your office address"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={verifyOfficeAddress}
                  disabled={!officeAddress || loading}
                >
                  Verify
                </Button>
              </div>
              {officeLocation && (
                <p className="text-sm text-muted-foreground">
                  Coordinates: {officeLocation.lat.toFixed(6)}, {officeLocation.lng.toFixed(6)}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter Airbnb listing URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    "Get Location"
                  )}
                </Button>
              </div>
            </form>

            {locationData && locationData.success && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h3 className="font-medium">Estimated Location</h3>
                      <div className="mt-2 text-sm text-muted-foreground space-y-2">
                        <p>
                          Coordinates: {locationData.coordinates.lat.toFixed(6)}, {locationData.coordinates.lng.toFixed(6)}
                        </p>
                        {locationData.boundingBox && (
                          <div>
                            <p className="font-medium text-foreground mt-2">Bounding Box:</p>
                            <p>North: {locationData.boundingBox.north.toFixed(6)}</p>
                            <p>South: {locationData.boundingBox.south.toFixed(6)}</p>
                            <p>East: {locationData.boundingBox.east.toFixed(6)}</p>
                            <p>West: {locationData.boundingBox.west.toFixed(6)}</p>
                          </div>
                        )}
                        <p className="mt-2 text-xs">
                          {locationData.approximated 
                            ? "* Location approximated from bounding box"
                            : "* Exact coordinates found"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {distanceData && (
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="font-medium mb-4">Distance to Office</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <Car className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">By Car</p>
                          <div className="text-sm text-muted-foreground">
                            <p>Distance: {distanceData.driving.distance.text}</p>
                            <p>Duration: {distanceData.driving.duration.text}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Train className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">By Transit</p>
                          <div className="text-sm text-muted-foreground">
                            <p>Distance: {distanceData.transit.distance.text}</p>
                            <p>Duration: {distanceData.transit.duration.text}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {rawResponse && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4" />
                  <h3 className="font-medium">Raw Response</h3>
                </div>
                <pre className="p-4 rounded-lg bg-muted overflow-auto text-xs">
                  {rawResponse}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}