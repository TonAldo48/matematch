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

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`
    })
    
    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      
      // Navigate with networkidle2 to ensure most resources are loaded
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      })

      // Scroll and wait for any dynamic content
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        // Use native setTimeout in the page context
        await new Promise(resolve => setTimeout(resolve, 3000))
      })

      const html = await page.content()
      const $ = cheerio.load(html)

      let boundingBox: BoundingBox | null = null
      let coordinates: Coordinates | null = null

      // Method 1: Try to find bounding box in script tags
      const scripts = $('script[type="application/json"]')
      scripts.each((_, el) => {
        if (boundingBox) return
        const content = $(el).html() || ''

        const match = content.match(
          /"boundingBox"\s*:\s*{\s*"north"\s*:\s*([\d.-]+)\s*,\s*"south"\s*:\s*([\d.-]+)\s*,\s*"east"\s*:\s*([\d.-]+)\s*,\s*"west"\s*:\s*([\d.-]+)/
        )
        if (match && match.length >= 5) {
          const [_, northStr, southStr, eastStr, westStr] = match
          const north = Number(northStr)
          const south = Number(southStr)
          const east = Number(eastStr)
          const west = Number(westStr)
          
          if (!isNaN(north) && !isNaN(south) && !isNaN(east) && !isNaN(west)) {
            boundingBox = { north, south, east, west }
          }
        }
      })

      // Method 2: Try to find direct coordinates if no bounding box
      if (!boundingBox) {
        scripts.each((_, el) => {
          if (coordinates) return
          const content = $(el).html() || ''
          const coordMatch = content.match(/"lat":\s*([\d.-]+).*?"lng":\s*([\d.-]+)/)
          if (coordMatch && coordMatch.length >= 3) {
            const lat = Number(coordMatch[1])
            const lng = Number(coordMatch[2])
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng }
            }
          }
        })
      }

      // Calculate coordinates from bounding box if found
      if (boundingBox) {
        const { north, south, east, west } = boundingBox
        coordinates = {
          lat: (north + south) / 2,
          lng: (east + west) / 2
        }
      }

      if (!coordinates) {
        throw new Error('Could not find or approximate coordinates')
      }

      // Validate coordinates
      if (
        !isFinite(coordinates.lat) ||
        !isFinite(coordinates.lng) ||
        Math.abs(coordinates.lat) > 90 ||
        Math.abs(coordinates.lng) > 180
      ) {
        throw new Error('Invalid coordinates calculated')
      }

      return NextResponse.json({
        coordinates,
        boundingBox,
        approximated: !!boundingBox,
        success: true
      })

    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json(
      {
        error: 'Failed to extract location from Airbnb listing',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 