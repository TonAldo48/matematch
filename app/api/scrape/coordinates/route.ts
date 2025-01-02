import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

interface Coordinates {
  lat: number
  lng: number
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url || !url.includes('airbnb.com')) {
      return NextResponse.json(
        { error: 'Invalid Airbnb URL' },
        { status: 400 }
      )
    }

    const browser = await puppeteer.launch({ headless: 'new' })
    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      
      // Navigate and wait for content
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      })

      // Scroll and wait using page.evaluate
      await page.evaluate(() => new Promise<void>((resolve) => {
        window.scrollTo(0, document.body.scrollHeight)
        setTimeout(resolve, 3000)
      }))

      const html = await page.content()
      const $ = cheerio.load(html)

      let coordinates: Coordinates | null = null

      // Method 1: Try to find coordinates in static map image
      const mapImg = $('img[data-testid="map/GoogleMapStatic"]')
      const centerMatch = mapImg.attr('src')?.match(/center=([\d.-]+)%2C([\d.-]+)/)
      
      if (centerMatch) {
        coordinates = {
          lat: parseFloat(centerMatch[1]),
          lng: parseFloat(centerMatch[2])
        }
      }

      // Method 2: Try to find coordinates in script tags if not found in map
      if (!coordinates) {
        const scripts = $('script[type="application/json"]')
        scripts.each((_, el) => {
          if (coordinates) return
          const content = $(el).html() || ''
          const coordMatch = content.match(/"lat":\s*([\d.-]+).*?"lng":\s*([\d.-]+)/)
          if (coordMatch) {
            coordinates = {
              lat: parseFloat(coordMatch[1]),
              lng: parseFloat(coordMatch[2])
            }
          }
        })
      }

      // Method 3: Look for coordinates in any script tag
      if (!coordinates) {
        $('script').each((_, el) => {
          if (coordinates) return
          const content = $(el).html() || ''
          const coordMatch = content.match(/latitude"?\s*:\s*([\d.-]+).*?longitude"?\s*:\s*([\d.-]+)/)
          if (coordMatch) {
            coordinates = {
              lat: parseFloat(coordMatch[1]),
              lng: parseFloat(coordMatch[2])
            }
          }
        })
      }

      if (!coordinates) {
        throw new Error('Could not find coordinates in the page')
      }

      // Validate coordinates
      if (
        !isFinite(coordinates.lat) ||
        !isFinite(coordinates.lng) ||
        Math.abs(coordinates.lat) > 90 ||
        Math.abs(coordinates.lng) > 180
      ) {
        throw new Error('Invalid coordinates found')
      }

      return NextResponse.json({
        coordinates,
        success: true
      })

    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      {
        error: 'Failed to scrape coordinates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}