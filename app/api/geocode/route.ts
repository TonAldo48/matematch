import { NextResponse } from 'next/server'

interface GeocodeRequest {
  address: string
}

interface Coordinates {
  lat: number
  lng: number
}

export async function POST(req: Request) {
  try {
    const { address }: GeocodeRequest = await req.json()

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      )
    }

    // Call Google Maps Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(address)}&` +
      `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )

    const data = await response.json()

    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json(
        { success: false, error: 'Could not geocode address' },
        { status: 404 }
      )
    }

    const location = data.results[0]
    
    return NextResponse.json({
      success: true,
      data: {
        formattedAddress: location.formatted_address,
        coordinates: {
          lat: location.geometry.location.lat,
          lng: location.geometry.location.lng
        }
      }
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to geocode address',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 