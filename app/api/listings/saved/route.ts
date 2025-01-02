import { NextResponse } from 'next/server'
import { SavedListing } from '@/types'

// In a real app, this would be in a database
let savedListings: { [key: string]: SavedListing[] } = {}

export async function POST(req: Request) {
  try {
    const { userId, listing } = await req.json()
    
    if (!userId || !listing) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!savedListings[userId]) {
      savedListings[userId] = []
    }

    // Check if already saved
    const existingSave = savedListings[userId].find(l => l.listingId === listing.id)
    if (existingSave) {
      return NextResponse.json(existingSave)
    }

    const savedListing: SavedListing = {
      id: `${userId}-${listing.id}`,
      userId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingUrl: listing.url,
      listingImage: listing.images[0],
      price: {
        amount: listing.price.discounted || listing.price.original,
        currency: listing.price.currency,
        period: listing.price.period
      },
      savedAt: Date.now()
    }

    savedListings[userId].push(savedListing)
    return NextResponse.json(savedListing)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save listing' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user ID' },
      { status: 400 }
    )
  }

  return NextResponse.json(savedListings[userId] || [])
}

export async function DELETE(req: Request) {
  try {
    const { userId, listingId } = await req.json()
    
    if (!userId || !listingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (savedListings[userId]) {
      savedListings[userId] = savedListings[userId].filter(
        l => l.listingId !== listingId
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove saved listing' },
      { status: 500 }
    )
  }
} 