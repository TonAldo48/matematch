import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
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
  let browser = null
  
  try {
    const { url } = await req.json()

    if (!url || !url.includes('airbnb.com')) {
      return NextResponse.json(
        { error: 'Invalid Airbnb URL' },
        { status: 400 }
      )
    }

    if (!process.env.BROWSERLESS_API_KEY) {
      console.error('BROWSERLESS_API_KEY is not set')
      return NextResponse.json(
        { error: 'Scraping service configuration error' },
        { status: 500 }
      )
    }

    console.log('Attempting to connect to browserless.io...')
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      defaultViewport: { width: 1920, height: 1080 }
    })
    console.log('Successfully connected to browserless.io')
    
    try {
      console.log('Creating new page...')
      const page = await browser.newPage()
      await page.setDefaultNavigationTimeout(60000)
      await page.setDefaultTimeout(60000)
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      console.log('Navigating to URL:', url)
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000
      })
      
      if (!response) {
        throw new Error('Failed to get response from page')
      }
      
      const status = response.status()
      console.log('Page response status:', status)
      
      if (status !== 200) {
        throw new Error(`Page returned status code ${status}`)
      }

      // Scroll and wait for any dynamic content
      console.log('Scrolling page and waiting for dynamic content...')
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise(resolve => setTimeout(resolve, 3000))
      })

      console.log('Getting page content...')
      const html = await page.content()
      console.log('Page content retrieved, length:', html.length)
      
      const $ = cheerio.load(html)

      let boundingBox: BoundingBox | null = null
      let coordinates: Coordinates | null = null

      // Method 1: Try to find bounding box in script tags
      console.log('Searching for location data in script tags...')
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
            console.log('Found bounding box:', boundingBox)
          }
        }
      })

      // Method 2: Try to find direct coordinates if no bounding box
      if (!boundingBox) {
        console.log('No bounding box found, searching for direct coordinates...')
        scripts.each((_, el) => {
          if (coordinates) return
          const content = $(el).html() || ''
          const coordMatch = content.match(/"lat":\s*([\d.-]+).*?"lng":\s*([\d.-]+)/)
          if (coordMatch && coordMatch.length >= 3) {
            const lat = Number(coordMatch[1])
            const lng = Number(coordMatch[2])
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng }
              console.log('Found direct coordinates:', coordinates)
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
        console.log('Calculated coordinates from bounding box:', coordinates)
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

    } catch (error) {
      console.error('Error during page processing:', error)
      throw error
    }
  } catch (error) {
    console.error('Scraping error:', error)
    
    // Check if error is related to browserless connection
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('browserless') || errorMessage.includes('websocket')) {
      return NextResponse.json(
        {
          error: 'Failed to connect to scraping service',
          message: errorMessage,
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to extract location from Airbnb listing',
        message: errorMessage,
      },
      { status: 500 }
    )
  } finally {
    if (browser) {
      console.log('Closing browser...')
      await browser.close()
    }
  }
} 