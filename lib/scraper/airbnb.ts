import puppeteer from 'puppeteer-core'
import * as cheerio from 'cheerio'

export interface ScrapedListing {
  title: string
  price: {
    amount: number
    currency: string
    period: string
    originalAmount?: number
    discountPercentage?: number
  }
  images: string[]
  location: string
  details: {
    bedrooms: number
    bathrooms: number
    guests: number
  }
  amenities: string[]
  description: string
  url: string
  rating?: string
}

export async function scrapeAirbnbListing(url: string): Promise<ScrapedListing> {
  let browser = null
  console.log('Starting scrapeAirbnbListing with URL:', url)
  
  try {
    console.log('Attempting to connect to browserless.io...')
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      defaultViewport: { width: 1920, height: 1080 }
    })
    console.log('Successfully connected to browserless.io')

    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(60000)
    await page.setDefaultTimeout(60000)
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    })
    
    if (!response) {
      throw new Error('Failed to get response from page')
    }
    
    const status = response.status()
    if (status !== 200) {
      throw new Error(`Page returned status code ${status}`)
    }

    // Wait for main content to load
    await page.waitForSelector('[data-section-id="TITLE_DEFAULT"]', { timeout: 30000 })

    const html = await page.content()
    const $ = cheerio.load(html)

    // Extract listing information
    const title = $('[data-section-id="TITLE_DEFAULT"] h1').text().trim() || 
                 $('meta[itemprop="name"]').attr('content') ||
                 'Unnamed Property'

    // Extract price information
    const priceText = $('.p1pcdqes').text() || 
                     $('span[data-testid="price-and-discounted-price"]').text() ||
                     $('._1jo4hgw').text()
    
    let amount = 0
    let currency = '$'
    let originalAmount: number | undefined
    let discountPercentage: number | undefined
    let period = 'night'

    // Check for monthly price indicator
    if (priceText.toLowerCase().includes('month') || priceText.toLowerCase().includes('mo')) {
      period = 'month'
    }

    // Check for discounted price
    const originalPriceText = $('span[data-testid="strikethrough-price"]').text()
    if (originalPriceText) {
      const originalMatch = originalPriceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/)
      if (originalMatch) {
        currency = originalMatch[1]
        originalAmount = parseFloat(originalMatch[2].replace(/,/g, ''))
      }
    }

    // Get current price
    const priceMatch = priceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/)
    if (priceMatch) {
      currency = priceMatch[1]
      amount = parseFloat(priceMatch[2].replace(/,/g, ''))
    }

    // Calculate discount if applicable
    if (originalAmount && amount) {
      discountPercentage = Math.round(((originalAmount - amount) / originalAmount) * 100)
    }

    // Extract images
    const images = $('img[data-testid="card-image"], .i1ezuexe, .l1j9v1wn img')
      .map((_, el) => $(el).attr('src'))
      .get()
      .filter(Boolean)

    // Extract location
    const location = $('[data-section-id="LOCATION_DEFAULT"] button').text().trim() ||
                    $('[data-testid="listing-card-title"]').text().trim() ||
                    $('[data-testid="listing-card-subtitle"]').first().text().trim()

    // Extract details
    const detailsText = $('[data-section-id="OVERVIEW_DEFAULT"]').text() || $('.fb4nyux').text()
    const details = {
      bedrooms: parseInt(detailsText.match(/(\d+)\s+bedroom/)?.[1] || '0'),
      bathrooms: parseInt(detailsText.match(/(\d+)\s+bathroom/)?.[1] || '0'),
      guests: parseInt(detailsText.match(/(\d+)\s+guest/)?.[1] || '0')
    }

    // Extract amenities
    const amenities = $('.r1xr6rtg')
      .map((_, el) => $(el).text().trim())
      .get()

    // Extract description
    const description = $('[data-section-id="DESCRIPTION_DEFAULT"]').text().trim()

    // Extract rating
    const ratingText = $('.r4a59j5').text() || $('[aria-label*="out of 5"]').text()
    let rating: string | undefined
    const ratingMatch = ratingText.match(/([\d.]+)/)
    if (ratingMatch) {
      rating = ratingMatch[1]
    }

    return {
      title,
      price: {
        amount,
        currency,
        period,
        originalAmount,
        discountPercentage
      },
      images,
      location,
      details,
      amenities,
      description,
      url,
      rating
    }
  } catch (error) {
    console.error('Error in scrapeAirbnbListing:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Function to scrape multiple listings from search results
export async function scrapeAirbnbListings(searchUrl: string): Promise<ScrapedListing[]> {
  let browser = null
  console.log('Starting scrapeAirbnbListings with URL:', searchUrl)
  
  try {
    console.log('Attempting to connect to browserless.io...')
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      defaultViewport: { width: 1920, height: 1080 }
    })
    console.log('Successfully connected to browserless.io')

    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(60000)
    await page.setDefaultTimeout(60000)
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    const response = await page.goto(searchUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    })
    
    if (!response) {
      throw new Error('Failed to get response from page')
    }
    
    const status = response.status()
    if (status !== 200) {
      throw new Error(`Page returned status code ${status}`)
    }

    // Wait for listings to load
    await page.waitForSelector('[data-testid="card-container"]', { timeout: 30000 })

    const html = await page.content()
    const $ = cheerio.load(html)
    const listings: ScrapedListing[] = []

    // Process each listing card
    $('[data-testid="card-container"]').each((_, card) => {
      const $card = $(card)
      
      // Get title and location
      const title = $card.find('[id^="title_"]').text().trim() || 
                   $card.find('meta[itemprop="name"]').attr('content') ||
                   'Unnamed Property'
      const location = $card.find('.t1jojoys').text().trim()
      
      // Get URL
      const href = $card.find('a[href^="/rooms/"]').first().attr('href') || ''
      const listingUrl = href.startsWith('http') ? href : `https://www.airbnb.com${href}`
      
      // Get price and discount information
      const priceText = $card.find('._1jo4hgw').text() || 
                       $card.find('span[data-testid="price-and-discounted-price"]').text()
      
      let amount = 0
      let currency = '$'
      let originalAmount: number | undefined
      let discountPercentage: number | undefined
      let period = 'night'

      // Check for monthly price indicator
      if (priceText.toLowerCase().includes('month') || priceText.toLowerCase().includes('mo')) {
        period = 'month'
      }

      // Check for discounted price
      const discountedPriceEl = $card.find('span[data-testid="price-and-discounted-price"]')
      if (discountedPriceEl.length) {
        const originalPriceText = $card.find('span[data-testid="strikethrough-price"]').text()
        if (originalPriceText) {
          const originalMatch = originalPriceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/)
          if (originalMatch) {
            currency = originalMatch[1]
            originalAmount = parseFloat(originalMatch[2].replace(/,/g, ''))
          }
        }

        const priceMatch = priceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/)
        if (priceMatch) {
          currency = priceMatch[1]
          amount = parseFloat(priceMatch[2].replace(/,/g, ''))
        }

        if (originalAmount && amount) {
          discountPercentage = Math.round(((originalAmount - amount) / originalAmount) * 100)
        }
      } else {
        const priceMatch = priceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/)
        if (priceMatch) {
          currency = priceMatch[1]
          amount = parseFloat(priceMatch[2].replace(/,/g, ''))
        }
      }

      // Get images
      const images = $card.find('img')
        .filter((_, img) => {
          const $img = $(img)
          const src = $img.attr('src') || ''
          const alt = $img.attr('alt') || ''
          const parentHtml = $img.parent().html() || ''

          // Skip host avatars and profile pictures
          if (
            alt.toLowerCase().includes('profile') ||
            src.includes('User/original') ||
            src.includes('pictures/user/') ||
            parentHtml.includes('Host preview') ||
            parentHtml.includes('aria-label="Host"')
          ) {
            return false
          }

          return true
        })
        .map((_, img) => $(img).attr('src'))
        .get()
        .filter(Boolean)

      // Get rating
      const ratingText = $card.find('[aria-label*="out of 5"], [aria-label*="rating"], .t5eq1io').text()
      let rating: string | undefined
      const ratingMatch = ratingText.match(/([\d.]+)/)
      if (ratingMatch) {
        rating = ratingMatch[1]
      }

      // Extract details (beds, baths, guests)
      const detailsText = $card.find('.t1jojoys').next().text() || ''
      const details = {
        bedrooms: parseInt(detailsText.match(/(\d+)\s+bed/)?.[1] || '0'),
        bathrooms: parseInt(detailsText.match(/(\d+)\s+bath/)?.[1] || '0'),
        guests: parseInt(detailsText.match(/(\d+)\s+guest/)?.[1] || '0')
      }

      if (title && listingUrl) {
        listings.push({
          title,
          price: {
            amount,
            currency,
            period,
            originalAmount,
            discountPercentage
          },
          images,
          location,
          details,
          amenities: [],
          description: '',
          url: listingUrl,
          rating
        })
      }
    })

    return listings
  } catch (error) {
    console.error('Error in scrapeAirbnbListings:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
} 