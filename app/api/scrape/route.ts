import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { ScrapedListing } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { url, mode } = await req.json();

    if (mode === 'single') {
      const listing = await scrapeAirbnbListing(url);
      return NextResponse.json({ success: true, data: listing });
    } else {
      const listings = await scrapeAirbnbListings(url);
      return NextResponse.json({ success: true, data: listings });
    }
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scrape data' },
      { status: 500 }
    );
  }
}

async function scrapeAirbnbListings(searchUrl: string): Promise<ScrapedListing[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for listings to load
    await page.waitForSelector('[data-testid="card-container"]', { timeout: 10000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const listings: ScrapedListing[] = [];

    // Process each listing card
    $('[data-testid="card-container"]').each((_, card) => {
      const $card = $(card);
      
      // Get title and location
      const title = $card.find('[id^="title_"]').text().trim() || 'Unnamed Property';
      const location = $card.find('.t1jojoys').text().trim();
      
      // Get URL
      const href = $card.find('a[href^="/rooms/"]').first().attr('href') || '';
      const listingUrl = href.startsWith('http') ? href : `https://www.airbnb.com${href}`;
      
      // Get price and discount information
      const priceText = $card.find('._1jo4hgw').text() || 
                       $card.find('span[data-testid="price-and-discounted-price"]').text();
      
      let amount = 0;
      let currency = '$';
      let originalAmount: number | undefined;
      let discountPercentage: number | undefined;
      let period = 'night';

      // Check for monthly price indicator
      const isMonthly = priceText.toLowerCase().includes('month') || 
                       priceText.toLowerCase().includes('mo');
      if (isMonthly) {
        period = 'month';
      }

      // Check for discounted price
      const discountedPriceEl = $card.find('span[data-testid="price-and-discounted-price"]');
      if (discountedPriceEl.length) {
        // Look for original price (strikethrough)
        const originalPriceText = $card.find('span[data-testid="strikethrough-price"]').text();
        if (originalPriceText) {
          const originalMatch = originalPriceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/);
          if (originalMatch) {
            currency = originalMatch[1];
            originalAmount = parseFloat(originalMatch[2].replace(/,/g, ''));
          }
        }

        // Get discounted price
        const priceMatch = priceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/);
        if (priceMatch) {
          currency = priceMatch[1];
          amount = parseFloat(priceMatch[2].replace(/,/g, ''));
        }

        // Calculate discount percentage if we have both prices
        if (originalAmount && amount) {
          discountPercentage = Math.round(((originalAmount - amount) / originalAmount) * 100);
        }
      } else {
        // Regular price without discount
        const priceMatch = priceText.match(/([₹$€£¥])\s*(\d+(?:,\d{3})*)/);
        if (priceMatch) {
          currency = priceMatch[1];
          amount = parseFloat(priceMatch[2].replace(/,/g, ''));
        }
      }

      // Get images - specifically target listing images and filter out profile pictures
      const images = $card.find('img')
        .filter((_, img) => {
          const $img = $(img);
          const src = $img.attr('src') || '';
          const alt = $img.attr('alt') || '';
          const parentHtml = $img.parent().html() || '';

          // Skip host avatars and profile pictures
          if (
            alt.toLowerCase().includes('profile') ||
            src.includes('User/original') ||
            src.includes('pictures/user/') ||
            parentHtml.includes('Host preview') ||
            parentHtml.includes('aria-label="Host"')
          ) {
            return false;
          }

          // Keep the image if it's a listing image
          return true;
        })
        .map((_, img) => $(img).attr('src'))
        .get()
        .filter(Boolean);

      // Get rating
      const ratingText = $card.find('[aria-label*="out of 5"], [aria-label*="rating"], .t5eq1io').text();
      let rating: string | undefined;
      const ratingMatch = ratingText.match(/([\d.]+)/);
      if (ratingMatch) {
        rating = ratingMatch[1];
      }

      // Only add listing if we have the title
      if (title) {
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
          details: {
            bedrooms: 0,
            bathrooms: 0,
            guests: 0
          },
          amenities: [],
          description: '',
          url: listingUrl,
          rating
        });
      }
    });

    return listings;

  } catch (error) {
    console.error('Error scraping Airbnb listings:', error);
    return [];
  } finally {
    await browser.close();
  }
}

// Single listing scraper (if needed)
async function scrapeAirbnbListing(url: string): Promise<ScrapedListing> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle0' });

    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $('meta[itemprop="name"]').attr('content') || 
                 $('[data-testid="listing-card-title"]').text() ||
                 'Unnamed Property';
                 
    const priceText = $('span[data-testid="price-and-discounted-price"]').text() ||
                     $('._1jo4hgw').text();
    
    let amount = 0;
    let currency = '$';
    const priceMatch = priceText.match(/([₹$€£¥])\s*(\d+)/);
    if (priceMatch) {
      currency = priceMatch[1];
      amount = parseFloat(priceMatch[2]);
    }

    const images = $('img[data-testid="card-image"], .i1ezuexe')
      .map((_, el) => $(el).attr('src'))
      .get()
      .filter(Boolean);

    const location = $('[data-testid="listing-card-title"]').text() ||
                    $('[data-testid="listing-card-subtitle"]').first().text();

    const detailsText = $('.fb4nyux').text();
    const bedroomsMatch = detailsText.match(/(\d+)\s*bed/);

    const ratingText = $('.r4a59j5').text();
    let rating: string | undefined;
    const ratingMatch = ratingText.match(/([\d.]+)/);
    if (ratingMatch) {
      rating = ratingMatch[1];
    }

    return {
      title,
      price: {
        amount,
        currency,
        period: 'night'
      },
      images,
      location,
      details: {
        bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1]) : 0,
        bathrooms: 0,
        guests: 0
      },
      amenities: [],
      description: '',
      url,
      rating
    };
  } finally {
    await browser.close();
  }
} 