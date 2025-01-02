import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

interface ScrapedListing {
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
  const browser = await puppeteer.launch({
    headless: "new"
  })

  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    // Wait for main content to load
    await page.waitForSelector('[data-section-id="TITLE_DEFAULT"]')

    const html = await page.content()
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
  } finally {
    await browser.close()
  }
} 