"use strict";
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { Timestamp } from 'firebase-admin/firestore';
import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';
// Retry configuration
const MAX_RETRIES = 3;
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
const randomDelay = async (min = 500, max = 1500) => {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
};
// Helper function for retrying operations
async function retry(operation, retries = 2) {
    try {
        return await operation();
    }
    catch (error) {
        if (retries > 0) {
            await randomDelay(300, 800);
            return retry(operation, retries - 1);
        }
        throw error;
    }
}
// Helper function to get browser options
async function getBrowserOptions() {
    return {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions',
            '--disable-software-rasterizer',
            '--disable-dev-tools',
            '--disable-accelerated-2d-canvas',
            '--disable-canvas-aa',
            '--disable-2d-canvas-clip-aa',
            '--disable-gl-drawing-for-tests'
        ],
        executablePath: await chrome.executablePath(),
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    };
}
const scrapeAirbnbListing = async (url) => {
    const browser = await puppeteer.launch(await getBrowserOptions());
    try {
        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());
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
        await page.setJavaScriptEnabled(true);
        await retry(async () => {
            await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
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
        });
        const listing = await retry(async () => {
            return await page.evaluate(() => {
                const getTextContent = (selector) => {
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
                    .filter((src) => typeof src === 'string');
                const amenityElements = document.querySelectorAll('[data-testid="amenity-row"]');
                const amenities = Array.from(amenityElements)
                    .map(el => el.textContent?.trim())
                    .filter((text) => typeof text === 'string');
                const houseRules = Array.from(document.querySelectorAll('[data-testid="house-rules"] li'))
                    .map(el => el.textContent?.trim())
                    .filter((text) => typeof text === 'string');
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
        });
        const id = url.split('/rooms/')[1]?.split('?')[0] || '';
        return { ...listing, id, scrapedAt: Timestamp.now() };
    }
    catch (error) {
        console.error('Error scraping Airbnb listing:', error);
        throw error;
    }
    finally {
        await browser.close();
    }
};
const scrapeAirbnbSearch = async (location, checkIn, checkOut) => {
    console.log('Starting search for location:', location);
    const browser = await puppeteer.launch(await getBrowserOptions());
    try {
        const page = await browser.newPage();
        // Set viewport to a common desktop resolution
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });
        // Set a realistic user agent
        await page.setUserAgent(getRandomUserAgent());
        // Set headers to mimic a real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Sec-CH-UA': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"'
        });
        // Block unnecessary resources to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const blockedResourceTypes = [
                'image',
                'media',
                'font',
                'texttrack',
                'object',
                'beacon',
                'csp_report',
                'imageset',
            ];
            if (blockedResourceTypes.includes(request.resourceType()) ||
                request.url().includes('google-analytics') ||
                request.url().includes('doubleclick.net') ||
                request.url().includes('google-tag') ||
                request.url().includes('optimizely')) {
                request.abort();
            }
            else {
                request.continue();
            }
        });
        // Enable JavaScript
        await page.setJavaScriptEnabled(true);
        const searchParams = new URLSearchParams({
            query: location,
            ...(checkIn && { check_in: checkIn }),
            ...(checkOut && { check_out: checkOut })
        });
        const searchUrl = `https://www.airbnb.com/s/homes?${searchParams.toString()}`;
        console.log('Search URL:', searchUrl);
        await retry(async () => {
            console.log('Navigating to search page...');
            await page.goto(searchUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            console.log('Page loaded');
            // Wait for any of these selectors to appear
            const possibleSelectors = [
                'div[role="main"]',
                'div[data-testid="card-container"]',
                'div[itemprop="itemList"]',
                'div[data-section-id="EXPLORE_WIDE_HOMES"]',
                'main[id="site-content"]',
                'a[href*="/rooms/"]' // Fallback to direct room links
            ];
            console.log('Waiting for content to load...');
            let contentFound = false;
            for (const selector of possibleSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    console.log(`Found content with selector: ${selector}`);
                    contentFound = true;
                    break;
                }
                catch (error) {
                    console.log(`Selector ${selector} not found`);
                }
            }
            if (!contentFound) {
                console.log('No content selectors found, checking if page loaded...');
                const html = await page.content();
                if (html.includes('airbnb')) {
                    console.log('Page appears to be loaded, continuing...');
                }
                else {
                    throw new Error('Page content not loaded properly');
                }
            }
            // Quick scroll to trigger initial content load
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await randomDelay(300, 800);
            await page.evaluate(() => window.scrollTo(0, 0));
        });
        const listingUrls = await retry(async () => {
            console.log('Searching for listing cards...');
            return await page.evaluate(() => {
                // Try multiple selectors as Airbnb might use different ones
                const selectors = [
                    'a[href*="/rooms/"]', // Direct room links first
                    '[data-testid="listing-card"] a[href*="/rooms/"]',
                    '[data-testid="card-container"] a[href*="/rooms/"]',
                    'div[itemprop="itemListElement"] a[href*="/rooms/"]',
                    'div[role="group"] a[href*="/rooms/"]'
                ];
                const urls = new Set();
                for (const selector of selectors) {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        const href = element instanceof HTMLAnchorElement ? element.href : element.getAttribute('href');
                        if (href?.includes('/rooms/')) {
                            urls.add(href);
                        }
                    });
                }
                return Array.from(urls);
            });
        });
        console.log('Found listing URLs:', listingUrls.length);
        // Only process the first 5 listings to avoid timeouts
        const listings = [];
        for (const url of listingUrls.slice(0, 5)) {
            try {
                console.log('Scraping listing:', url);
                const listing = await scrapeAirbnbListing(url);
                if (listing) {
                    listings.push(listing);
                    console.log('Successfully scraped listing:', listing.id);
                }
                await randomDelay(300, 800);
            }
            catch (error) {
                console.error(`Error scraping listing ${url}:`, error);
                continue;
            }
        }
        console.log('Successfully scraped listings:', listings.length);
        return listings;
    }
    catch (error) {
        console.error('Error scraping Airbnb search:', error);
        throw error;
    }
    finally {
        await browser.close();
    }
};
// Cloud Function to handle scraping requests
export const scrapeAirbnb = onCall({
    memory: '8GiB',
    timeoutSeconds: 540, // 9 minutes
    minInstances: 0,
    maxInstances: 10,
    concurrency: 80,
    cpu: 4
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { type, url, location, checkIn, checkOut } = request.data;
    try {
        if (type === 'listing' && url) {
            return await scrapeAirbnbListing(url);
        }
        else if (type === 'search' && location) {
            // First, get just the listing URLs
            const browser = await puppeteer.launch(await getBrowserOptions());
            let listingUrls = [];
            try {
                const page = await browser.newPage();
                await setupPage(page);
                const searchParams = new URLSearchParams({
                    query: location,
                    ...(checkIn && { check_in: checkIn }),
                    ...(checkOut && { check_out: checkOut })
                });
                const searchUrl = `https://www.airbnb.com/s/homes?${searchParams.toString()}`;
                await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Quick scroll to load more content
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await new Promise(resolve => setTimeout(resolve, 1000));
                listingUrls = await page.evaluate(() => {
                    const links = document.querySelectorAll('a[href*="/rooms/"]');
                    return Array.from(new Set(Array.from(links)
                        .map(link => link.href)
                        .filter(href => href.includes('/rooms/')))).slice(0, 5);
                });
            }
            finally {
                await browser.close();
            }
            console.log(`Found ${listingUrls.length} listing URLs`);
            // Now scrape listings in parallel
            const listings = await Promise.all(listingUrls.map(async (listingUrl) => {
                try {
                    return await scrapeAirbnbListing(listingUrl);
                }
                catch (error) {
                    console.error(`Error scraping listing ${listingUrl}:`, error);
                    return null;
                }
            }));
            // Filter out any failed listings
            return listings.filter((listing) => listing !== null);
        }
        else {
            throw new HttpsError('invalid-argument', 'Invalid request parameters');
        }
    }
    catch (error) {
        console.error('Error in scrapeAirbnb function:', error);
        throw new HttpsError('internal', 'Error processing scraping request');
    }
});
// Helper function to set up page configuration
async function setupPage(page) {
    // Set viewport
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    // Set user agent
    await page.setUserAgent(getRandomUserAgent());
    // Set headers
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Sec-CH-UA': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"macOS"'
    });
    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const blockedResourceTypes = [
            'image',
            'media',
            'font',
            'texttrack',
            'object',
            'beacon',
            'csp_report',
            'imageset',
        ];
        if (blockedResourceTypes.includes(request.resourceType()) ||
            request.url().includes('google-analytics') ||
            request.url().includes('doubleclick.net') ||
            request.url().includes('google-tag') ||
            request.url().includes('optimizely')) {
            request.abort();
        }
        else {
            request.continue();
        }
    });
    // Enable JavaScript
    await page.setJavaScriptEnabled(true);
}
