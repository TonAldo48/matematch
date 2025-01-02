import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

interface SearchListing {
  id: string
  title: string
  subtitle: string
  isSuperhost: boolean
  isGuestFavorite: boolean
  price: {
    original?: number
    discounted?: number
    period: string
    currency: string
  }
  rating?: {
    score: number
    reviews: number
  }
  images: string[]
  url: string
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    const searchUrl = new URL(url)

    if (!url || !url.includes('airbnb.com')) {
      return NextResponse.json(
        { error: 'Invalid Airbnb URL' },
        { status: 400 }
      )
    }

    const browser = await puppeteer.launch({
      headless: "new"
    })

    try {
      const page = await browser.newPage()
      
      // Set viewport to ensure consistent rendering
      await page.setViewport({ width: 1920, height: 1080 })
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // Wait for listings to load
      await page.waitForSelector('[data-testid="card-container"]', { timeout: 10000 })

      const html = await page.content()
      const $ = cheerio.load(html)

      const listings: SearchListing[] = []

      // Process each listing card
      $('[data-testid="card-container"]').each((_, element) => {
        const card = $(element)
        
        // Extract listing URL and ID
        const linkElement = card.find('a').first()
        const listingUrl = 'https://www.airbnb.com' + linkElement.attr('href')
        const id = listingUrl.match(/\/rooms\/(\d+)/)?.[1] || ''

        // Extract title and subtitle
        const titleElement = card.find('[data-testid="listing-card-title"]')
        const title = titleElement.text().trim()
        const subtitle = card.find('span[style*="line-clamp"]').first().text().trim()

        // Check for badges
        const isSuperhost = card.find(':contains("Superhost")').length > 0
        const isGuestFavorite = card.find(':contains("Guest favorite")').length > 0

        // Extract price information - new structure
        let originalPrice, discountedPrice, period
        
        // Find the price container with the specific class structure
        const priceContainer = card.find('div[style*="pricing-guest-display-price"]')
        
        if (priceContainer.length) {
          // Find original price (strikethrough price)
          const originalPriceEl = priceContainer.find('span._1aejdbt')
          if (originalPriceEl.length) {
            originalPrice = parseFloat(originalPriceEl.text().replace(/[^0-9.]/g, ''))
          }

          // Find discounted price (current price)
          const discountedPriceEl = priceContainer.find('span._11jcbg2')
          if (discountedPriceEl.length) {
            discountedPrice = parseFloat(discountedPriceEl.text().replace(/[^0-9.]/g, ''))
          }

          // Find period (month/night)
          const periodEl = priceContainer.find('span._ni9jsr')
          if (periodEl.length) {
            period = periodEl.text().toLowerCase()
          }

          // If no discounted price found, the current price is the original price
          if (!discountedPrice && originalPrice) {
            discountedPrice = originalPrice
            originalPrice = undefined
          }
        }

        // Extract rating information
        const ratingContainer = card.find('.r4a59j5')
        let rating
        if (ratingContainer.length) {
          const ratingText = ratingContainer.text()
          const ratingMatch = ratingText.match(/([\d.]+)\s*\(([\d,]+)\)/)
          if (ratingMatch) {
            rating = {
              score: parseFloat(ratingMatch[1]),
              reviews: parseInt(ratingMatch[2].replace(/,/g, ''))
            }
          }
        }

        // Extract images - specifically target listing images and exclude profile pictures
        const images = card.find('picture img, div[data-testid="card-photo"] img')
          .map((_, img) => {
            const src = $(img).attr('src')
            const style = $(img).attr('style')
            // Only include listing images (usually larger and from muscache.com)
            if (
              src &&
              src.includes('muscache.com') &&
              src.includes('im_w=') &&
              !src.includes('profile') &&
              !src.includes('User') &&
              !(style && style.includes('border-radius: 50%'))
            ) {
              return src
            }
            return null
          })
          .get()
          .filter(Boolean) // Remove null values
          .filter((src, index, self) => self.indexOf(src) === index) // Remove duplicates

        // Only add listing if we have valid images
        if (images.length > 0) {
          listings.push({
            id,
            title,
            subtitle,
            isSuperhost,
            isGuestFavorite,
            price: {
              original: originalPrice,
              discounted: discountedPrice,
              currency: '$',
              period: period || 'month'
            },
            rating,
            images,
            url: listingUrl
          })
        }
      })

      // Extract pagination info if needed
      const totalListings = $('span:contains("Over")').first().text().match(/\d+/)?.[0]

      const pageNumber = new URL(url).searchParams.get('page') || '1'
      searchUrl.searchParams.set('page', pageNumber)

      return NextResponse.json({
        listings,
        total: totalListings || listings.length,
        page: parseInt(pageNumber),
        location: searchUrl.searchParams.get('query') || "Unknown Location",
        filters: {
          dates: {
            checkin: searchUrl.searchParams.get('checkin') || "",
            checkout: searchUrl.searchParams.get('checkout') || ""
          },
          guests: parseInt(searchUrl.searchParams.get('adults') || "1"),
          bedrooms: parseInt(searchUrl.searchParams.get('min_bedrooms') || "1"),
          type: "monthly"
        }
      })

    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape listings' },
      { status: 500 }
    )
  }
} 