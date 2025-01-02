interface CachedDistance {
  driving?: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
  }
  transit?: {
    distance: { text: string; value: number }
    duration: { text: string; value: number }
  }
  timestamp: number
}

interface DistanceCache {
  [key: string]: CachedDistance
}

const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function getCachedDistance(listingId: string, searchLocation: string): CachedDistance | null {
  try {
    const cache: DistanceCache = JSON.parse(localStorage.getItem('distanceCache') || '{}')
    const cacheKey = `${listingId}-${searchLocation}`
    const cachedData = cache[cacheKey]

    if (!cachedData) return null

    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      delete cache[cacheKey]
      localStorage.setItem('distanceCache', JSON.stringify(cache))
      return null
    }

    return cachedData
  } catch (error) {
    console.error('Error reading from distance cache:', error)
    return null
  }
}

export function cacheDistance(
  listingId: string, 
  searchLocation: string, 
  distance: Omit<CachedDistance, 'timestamp'>
) {
  try {
    const cache: DistanceCache = JSON.parse(localStorage.getItem('distanceCache') || '{}')
    const cacheKey = `${listingId}-${searchLocation}`
    
    cache[cacheKey] = {
      ...distance,
      timestamp: Date.now()
    }

    localStorage.setItem('distanceCache', JSON.stringify(cache))
  } catch (error) {
    console.error('Error writing to distance cache:', error)
  }
} 