import { NextResponse } from 'next/server'
import { InterestedUser, ListingInterest } from '@/types'

// In a real app, this would be in a database
let listingInterests: { [key: string]: ListingInterest } = {}

export async function POST(req: Request) {
  try {
    const { listingId, listingTitle, listingUrl, user } = await req.json()
    
    if (!listingId || !user) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or update listing interest
    if (!listingInterests[listingId]) {
      listingInterests[listingId] = {
        listingId,
        listingTitle,
        listingUrl,
        users: [],
        timestamp: Date.now()
      }
    }

    // Check if user is already interested
    const existingUser = listingInterests[listingId].users.find(u => u.id === user.id)
    if (!existingUser) {
      listingInterests[listingId].users.push(user)
    }

    return NextResponse.json(listingInterests[listingId])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update interest' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const listingId = searchParams.get('listingId')

  if (!listingId) {
    return NextResponse.json(
      { error: 'Missing listing ID' },
      { status: 400 }
    )
  }

  return NextResponse.json(listingInterests[listingId] || null)
}

export async function DELETE(req: Request) {
  try {
    const { listingId, userId } = await req.json()
    
    if (!listingId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Remove user from listing interests
    if (listingInterests[listingId]) {
      listingInterests[listingId].users = listingInterests[listingId].users.filter(
        user => user.id !== userId
      )
    }

    return NextResponse.json(listingInterests[listingId])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove interest' },
      { status: 500 }
    )
  }
} 