import * as cheerio from 'cheerio'

export interface ScrapedListing {
  title: string
  price: {
    amount: number
    currency: string
    period: string
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
}

export async function scrapeAirbnbListing(url: string): Promise<ScrapedListing> {
  try {
    // Use a CORS proxy to fetch the page
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    const data = await response.json()
    const html = data.contents
    const $ = cheerio.load(html)

    // Extract listing information
    const title = $('[data-section-id="TITLE_DEFAULT"] h1').text()
    const priceText = $('.p1pcdqes').text()
    const price = {
      amount: parseFloat(priceText.replace(/[^0-9.]/g, '')),
      currency: priceText.match(/[\$\€\£]/)?.[0] || '$',
      period: priceText.includes('night') ? 'night' : 'month'
    }

    const images = $('.l1j9v1wn img')
      .map((_, el) => $(el).attr('src'))
      .get()
      .filter(Boolean)

    const location = $('[data-section-id="LOCATION_DEFAULT"] button').text()

    const details = {
      bedrooms: parseInt($('[data-section-id="OVERVIEW_DEFAULT"]').text().match(/(\d+)\s+bedroom/)?.[1] || '0'),
      bathrooms: parseInt($('[data-section-id="OVERVIEW_DEFAULT"]').text().match(/(\d+)\s+bathroom/)?.[1] || '0'),
      guests: parseInt($('[data-section-id="OVERVIEW_DEFAULT"]').text().match(/(\d+)\s+guest/)?.[1] || '0')
    }

    const amenities = $('.r1xr6rtg')
      .map((_, el) => $(el).text().trim())
      .get()

    const description = $('[data-section-id="DESCRIPTION_DEFAULT"]').text()

    return {
      title,
      price,
      images,
      location,
      details,
      amenities,
      description,
      url
    }
  } catch (error) {
    console.error('Error scraping Airbnb listing:', error)
    throw error
  }
}

export async function scrapeAirbnbListings(searchUrl: string): Promise<ScrapedListing[]> {
  try {
    // Use a CORS proxy to fetch the page
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`
    const response = await fetch(proxyUrl)
    const data = await response.json()
    const html = data.contents
    const $ = cheerio.load(html)
    const listings: ScrapedListing[] = []

    // Process each listing card
    $('[data-testid="card-container"]').each((_, card) => {
      const $card = $(card)
      
      const title = $card.find('meta[itemprop="name"]').attr('content') || 'Unnamed Property'
      const priceText = $card.find('span[data-testid="price-and-discounted-price"]').text()
      const listingUrl = 'https://www.airbnb.com' + ($card.find('a').attr('href') || '')
      
      const price = {
        amount: parseFloat(priceText.replace(/[^0-9.]/g, '')),
        currency: priceText.match(/[\$\€\£]/)?.[0] || '$',
        period: priceText.includes('night') ? 'night' : 'month'
      }

      const images = $card.find('img[data-testid="card-image"]')
        .map((_, img) => $(img).attr('src'))
        .get()
        .filter(Boolean)

      const location = $card.find('[data-testid="listing-card-title"]').text()

      listings.push({
        title,
        price,
        images,
        location,
        details: {
          bedrooms: 0,
          bathrooms: 0,
          guests: 0
        },
        amenities: [],
        description: '',
        url: listingUrl
      })
    })

    return listings
  } catch (error) {
    console.error('Error scraping Airbnb listings:', error)
    return []
  }
} 