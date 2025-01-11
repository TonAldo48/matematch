import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { ScrapedListing } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { url, mode } = await req.json();
    console.log(`Starting scrape request - Mode: ${mode}, URL: ${url}`);

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!url.includes('airbnb.com')) {
      return NextResponse.json(
        { success: false, error: 'Only Airbnb URLs are supported' },
        { status: 400 }
      );
    }

    if (!process.env.BROWSERLESS_API_KEY) {
      console.error('BROWSERLESS_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Scraping service configuration error' },
        { status: 500 }
      );
    }

    if (mode === 'single') {
      console.log('Starting single listing scrape...');
      const listing = await scrapeAirbnbListing(url);
      if (!listing) {
        throw new Error('Failed to scrape listing');
      }
      console.log('Single listing scrape completed successfully');
      return NextResponse.json({ success: true, data: listing });
    } else {
      console.log('Starting listings scrape...');
      const listings = await scrapeAirbnbListings(url);
      if (!listings || listings.length === 0) {
        throw new Error('No listings found');
      }
      console.log(`Listings scrape completed successfully. Found ${listings.length} listings`);
      return NextResponse.json({ success: true, data: listings });
    }
  } catch (error: any) {
    console.error('Scraping error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      name: error?.name || 'Unknown error type'
    });
    
    // Check if error is related to browserless connection
    if (error?.message?.includes('browserless') || error?.message?.includes('websocket')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to scraping service',
          details: error?.message
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to scrape data', 
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function scrapeAirbnbListings(searchUrl: string): Promise<ScrapedListing[]> {
  let browser = null;
  console.log('Starting scrapeAirbnbListings with URL:', searchUrl);
  
  try {
    console.log('Attempting to connect to browserless.io...');
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      defaultViewport: { width: 1920, height: 1080 }
    });
    console.log('Successfully connected to browserless.io');

    console.log('Creating new page...');
    const page = await browser.newPage();
    console.log('Page created successfully');
    
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('Navigating to URL...');
    const response = await page.goto(searchUrl, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    if (!response) {
      throw new Error('Failed to get response from page');
    }
    
    const status = response.status();
    console.log('Page response status:', status);
    
    if (status !== 200) {
      throw new Error(`Page returned status code ${status}`);
    }

    console.log('Waiting for listings to load...');
    try {
      await page.waitForSelector('[data-testid="card-container"]', { 
        timeout: 30000,
        visible: true 
      });
      console.log('Listings loaded successfully');
    } catch (error) {
      console.error('Error waiting for listings:', error);
      // Take a screenshot of the page for debugging
      await page.screenshot({ path: '/tmp/error-page.png' });
      throw new Error('Failed to find listing containers on page');
    }

    console.log('Getting page content...');
    const html = await page.content();
    console.log('Page content retrieved, length:', html.length);
    
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
    console.error('Error in scrapeAirbnbListings:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Single listing scraper (if needed)
async function scrapeAirbnbListing(url: string): Promise<ScrapedListing> {
  let browser = null;
  console.log('Starting scrapeAirbnbListing with URL:', url);
  
  try {
    console.log('Attempting to connect to browserless.io for single listing...');
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      defaultViewport: { width: 1920, height: 1080 }
    });
    console.log('Successfully connected to browserless.io for single listing');

    console.log('Creating new page for single listing...');
    const page = await browser.newPage();
    console.log('Page created successfully for single listing');
    
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('Navigating to URL...');
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    if (!response) {
      throw new Error('Failed to get response from page');
    }
    
    const status = response.status();
    console.log('Page response status:', status);
    
    if (status !== 200) {
      throw new Error(`Page returned status code ${status}`);
    }

    console.log('Getting page content...');
    const html = await page.content();
    console.log('Page content retrieved, length:', html.length);
    
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
  } catch (error) {
    console.error('Error in scrapeAirbnbListing:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 