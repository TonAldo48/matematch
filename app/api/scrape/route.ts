import chromium from '@sparticuz/chromium';
import puppeteerCore, { Page, Browser } from 'puppeteer-core';
import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

interface Listing {
    title: string;
    price: {
        amount: number;
        currency: string;
        period: string;
    };
    images: string[];
    location: string | {
        address: string;
        city: string;
        coordinates: {
            latitude: number;
            longitude: number;
        }
    };
    details: {
        bedrooms: number;
        bathrooms: number;
        maxGuests: number;
    };
    amenities: string[];
    description: string;
    url: string;
    houseRules?: string[];
    rating?: number;
    reviewCount?: number;
}

// Common user agents
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
];

// Helper function to get a random user agent
const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Helper function to add random delay
const randomDelay = async (min = 1000, max = 3000) => {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
};

// Setup browser with anti-detection measures
async function setupBrowser(): Promise<{ browser: Browser; page: Page }> {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        
        let browser: Browser;
        if (isDev) {
            // In development, use the system Chrome with full Puppeteer
            browser = (await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })) as unknown as Browser;
        } else {
            // In production (Vercel), use @sparticuz/chromium with puppeteer-core
            await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless
            });
        }

        const page = await browser.newPage() as Page;
        
        // Set a random user agent
        await page.setUserAgent(getRandomUserAgent());
        
        // Set extra headers to look more like a real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        });

        return { browser, page };
    } catch (error) {
        console.error('Error setting up browser:', error);
        throw error;
    }
}

async function scrapeSearchResults(page: Page): Promise<Listing[]> {
    await page.waitForSelector('[data-testid="card-container"]', { timeout: 10000 });
    
    return await page.evaluate(() => {
        const listings: Listing[] = [];
        const cards = document.querySelectorAll('[data-testid="card-container"]');
        
        cards.forEach(card => {
            const title = card.querySelector('[id^="title_"]')?.textContent?.trim() || '';
            const priceEl = card.querySelector('._1jo4hgw, span[data-testid="price-and-discounted-price"]');
            const priceText = priceEl?.textContent || '';
            const priceMatch = priceText.match(/\$(\d+)/);
            const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
            
            const href = card.querySelector('a[href^="/rooms/"]')?.getAttribute('href') || '';
            const url = href.startsWith('http') ? href : `https://www.airbnb.com${href}`;
            
            const images = Array.from(card.querySelectorAll('img'))
                .map(img => img.getAttribute('src'))
                .filter((src): src is string => 
                    typeof src === 'string' && 
                    !src.includes('profile') && 
                    !src.includes('user')
                );
            
            const location = card.querySelector('.t1jojoys')?.textContent?.trim() || '';
            
            if (title) {
                listings.push({
                    title,
                    price: {
                        amount: price,
                        currency: 'USD',
                        period: 'night'
                    },
                    images,
                    location,
                    url,
                    details: {
                        bedrooms: 0,
                        bathrooms: 0,
                        maxGuests: 0
                    },
                    amenities: [],
                    description: ''
                });
            }
        });
        
        return listings;
    });
}

async function scrapeSingleListing(page: Page): Promise<Listing> {
    return await page.evaluate(() => {
        const getTextContent = (selector: string) => {
            const element = document.querySelector(selector);
            return element?.textContent?.trim() || '';
        };

        const priceElement = document.querySelector('[data-testid="price-element"]');
        const priceText = priceElement?.textContent || '';
        const priceMatch = priceText.match(/\$(\d+)/);
        const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;

        const latitudeMeta = document.querySelector('meta[property="place:location:latitude"]');
        const longitudeMeta = document.querySelector('meta[property="place:location:longitude"]');
        const latitude = latitudeMeta ? parseFloat(latitudeMeta.getAttribute('content') || '0') : 0;
        const longitude = longitudeMeta ? parseFloat(longitudeMeta.getAttribute('content') || '0') : 0;

        const imageElements = document.querySelectorAll('img[data-original]');
        const images = Array.from(imageElements)
            .map(img => img.getAttribute('data-original'))
            .filter((src): src is string => typeof src === 'string');

        const amenityElements = document.querySelectorAll('[data-testid="amenity-row"]');
        const amenities = Array.from(amenityElements)
            .map(el => el.textContent?.trim())
            .filter((text): text is string => typeof text === 'string');

        const houseRules = Array.from(document.querySelectorAll('[data-testid="house-rules"] li'))
            .map(el => el.textContent?.trim())
            .filter((text): text is string => typeof text === 'string');

        return {
            title: getTextContent('[data-testid="listing-title"]'),
            location: {
                address: getTextContent('[data-testid="listing-address"]'),
                city: getTextContent('[data-testid="listing-city"]'),
                coordinates: { latitude, longitude }
            },
            price: {
                amount: price,
                currency: 'USD',
                period: 'night'
            },
            details: {
                bedrooms: parseInt(getTextContent('[data-testid="listing-bedrooms"]') || '0', 10),
                bathrooms: parseInt(getTextContent('[data-testid="listing-bathrooms"]') || '0', 10),
                maxGuests: parseInt(getTextContent('[data-testid="listing-guests"]') || '0', 10)
            },
            amenities,
            images,
            description: getTextContent('[data-testid="listing-description"]'),
            houseRules,
            rating: parseFloat(getTextContent('[data-testid="listing-rating"]') || '0'),
            reviewCount: parseInt(getTextContent('[data-testid="listing-reviews-count"]') || '0', 10),
            url: window.location.href
        };
    });
}

export async function POST(req: Request) {
    let browser;
    try {
        const { url, mode = 'single' } = await req.json();
        
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const { browser: _browser, page } = await setupBrowser();
        browser = _browser;

        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Random scrolling
        await page.evaluate(async () => {
            const randomScroll = () => {
                window.scrollBy(0, Math.random() * 100);
            };
            for (let i = 0; i < 5; i++) {
                randomScroll();
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
            }
        });

        await randomDelay(500, 1500);

        let result;
        if (mode === 'search') {
            result = await scrapeSearchResults(page);
            return NextResponse.json({ 
                success: true,
                data: result
            });
        } else {
            result = await scrapeSingleListing(page);
            const id = url.split('/rooms/')[1]?.split('?')[0] || '';
            return NextResponse.json({ 
                success: true,
                data: {
                    ...result,
                    id,
                    scrapedAt: new Date().toISOString()
                }
            });
        }

    } catch (error) {
        console.error('Error scraping:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to scrape data' 
        }, { status: 500 });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
} 