"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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

interface ApproximateResult {
  coordinates: Coordinates
  boundingBox?: BoundingBox
  approximated: boolean
}

export function ApproximateLocation() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<ApproximateResult | null>(null)

  const handleApproximate = async () => {
    if (!url) {
      toast({
        title: "Missing URL",
        description: "Please provide an Airbnb listing URL",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/scrape/approximate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })

      if (!response.ok) throw new Error("Failed to approximate location")
      
      const data = await response.json()
      setResult(data)
      
      toast({
        title: "Location found",
        description: data.approximated 
          ? "Location approximated from bounding box"
          : "Exact coordinates found"
      })
    } catch (error) {
      toast({
        title: "Approximation failed",
        description: "Unable to approximate listing location",
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
          <h2 className="text-lg font-semibold mb-4">Approximate Listing Location</h2>
          <Input 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Airbnb listing URL"
          />
        </div>

        <Button 
          onClick={handleApproximate}
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approximating...
            </>
          ) : (
            'Approximate Location'
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Results</h3>
              <Badge variant={result.approximated ? "secondary" : "default"}>
                {result.approximated ? "Approximated" : "Exact"}
              </Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <span className="font-medium">Coordinates: </span>
                {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
              </p>
              
              {result.boundingBox && (
                <div className="text-sm text-gray-600">
                  <p>Bounding Box:</p>
                  <ul className="ml-4">
                    <li>North: {result.boundingBox.north.toFixed(6)}</li>
                    <li>South: {result.boundingBox.south.toFixed(6)}</li>
                    <li>East: {result.boundingBox.east.toFixed(6)}</li>
                    <li>West: {result.boundingBox.west.toFixed(6)}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 