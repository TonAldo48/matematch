import { NextResponse } from 'next/server'

interface DistanceRequest {
  origin: {
    lat: number
    lng: number
  }
  destination: {
    lat: number
    lng: number
  }
}

export async function POST(req: Request) {
  try {
    const { origin, destination }: DistanceRequest = await req.json()
    
    // Make two separate requests for driving and transit modes
    const [drivingResponse, transitResponse] = await Promise.all([
      fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${origin.lat},${origin.lng}&` +
        `destinations=${destination.lat},${destination.lng}&` +
        `mode=driving&` +
        `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      ),
      fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${origin.lat},${origin.lng}&` +
        `destinations=${destination.lat},${destination.lng}&` +
        `mode=transit&` +
        `key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
    ])

    const [drivingData, transitData] = await Promise.all([
      drivingResponse.json(),
      transitResponse.json()
    ])

    // Check if we got valid responses
    if (drivingData.status !== 'OK' && transitData.status !== 'OK') {
      throw new Error('Failed to get distance from Google API')
    }

    const response = {
      driving: drivingData.rows[0]?.elements[0],
      transit: transitData.rows[0]?.elements[0]
    }

    // Validate the response data
    if (!response.driving?.distance || !response.driving?.duration) {
      throw new Error('Invalid response from Distance Matrix API')
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Distance calculation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to calculate distance',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 