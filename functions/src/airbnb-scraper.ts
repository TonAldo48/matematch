"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAirbnb = exports.scrapeAirbnbSearch = exports.scrapeAirbnbListing = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const puppeteer_1 = __importDefault(require("puppeteer"));
// Retry configuration
const MAX_RETRIES = 3;
// Browser launch options optimized for Cloud Functions
const BROWSER_OPTIONS = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
    ],
    defaultViewport: {
        width: 1920,
        height: 1080
    }
};
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
// Helper function for retrying operations
async function retry(operation, retries = MAX_RETRIES) {
    try {
        return await operation();
    }
    catch (error) {
        if (retries > 0) {
            await randomDelay();
            return retry(operation, retries - 1);
        }
        throw error;
    }
}
const scrapeAirbnbListing = async (url) => {
    var _a;
    const browser = await puppeteer_1.default.launch(BROWSER_OPTIONS);
    try {
        const page = await browser.newPage();
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
        // Enable JavaScript and cookies
        await page.setJavaScriptEnabled(true);
        // Add random mouse movements and scrolling
        await retry(async () => {
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
        });
        // Extract listing data with retry logic
        const listing = await retry(async () => {
            return await page.evaluate(() => {
                // Helper function to safely query selectors
                const getTextContent = (selector) => {
                    var _a;
                    const element = document.querySelector(selector);
                    return ((_a = element === null || element === void 0 ? void 0 : element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                };
                // Extract price
                const priceElement = document.querySelector('[data-testid="price-element"]');
                const priceText = (priceElement === null || priceElement === void 0 ? void 0 : priceElement.textContent) || '';
                const priceMatch = priceText.match(/\$(\d+)/);
                const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
                // Extract coordinates from meta tags
                const latitudeMeta = document.querySelector('meta[property="place:location:latitude"]');
                const longitudeMeta = document.querySelector('meta[property="place:location:longitude"]');
                const latitude = latitudeMeta ? parseFloat(latitudeMeta.getAttribute('content') || '0') : 0;
                const longitude = longitudeMeta ? parseFloat(longitudeMeta.getAttribute('content') || '0') : 0;
                // Extract images
                const imageElements = document.querySelectorAll('img[data-original]');
                const images = Array.from(imageElements)
                    .map(img => img.getAttribute('data-original'))
                    .filter((src) => typeof src === 'string');
                // Extract amenities
                const amenityElements = document.querySelectorAll('[data-testid="amenity-row"]');
                const amenities = Array.from(amenityElements)
                    .map(el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
                    .filter((text) => typeof text === 'string');
                // Extract house rules with type guard
                const houseRules = Array.from(document.querySelectorAll('[data-testid="house-rules"] li'))
                    .map(el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
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
        return Object.assign(Object.assign({}, listing), { id: ((_a = url.split('/rooms/')[1]) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || '', scrapedAt: admin.firestore.Timestamp.now() });
    }
    catch (error) {
        console.error('Error scraping Airbnb listing:', error);
        throw error;
    }
    finally {
        await browser.close();
    }
};
exports.scrapeAirbnbListing = scrapeAirbnbListing;
const scrapeAirbnbSearch = async (location, checkIn, checkOut) => {
    const browser = await puppeteer_1.default.launch(BROWSER_OPTIONS);
    try {
        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());
        // Construct search URL
        const searchParams = new URLSearchParams(Object.assign(Object.assign({ query: location }, (checkIn && { check_in: checkIn })), (checkOut && { check_out: checkOut })));
        const searchUrl = `https://www.airbnb.com/s/homes?${searchParams.toString()}`;
        await retry(async () => {
            await page.goto(searchUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            await randomDelay();
        });
        // Extract listing URLs with retry logic
        const listingUrls = await retry(async () => {
            return await page.evaluate(() => {
                const cards = document.querySelectorAll('[data-testid="listing-card"]');
                return Array.from(cards)
                    .map(card => { var _a; return (_a = card.querySelector('a')) === null || _a === void 0 ? void 0 : _a.href; })
                    .filter((href) => typeof href === 'string');
            });
        });
        // Scrape each listing
        const listings = [];
        for (const url of listingUrls.slice(0, 10)) {
            try {
                const listing = await (0, exports.scrapeAirbnbListing)(url);
                if (listing) {
                    listings.push(listing);
                }
                await randomDelay();
            }
            catch (error) {
                console.error(`Error scraping listing ${url}:`, error);
                continue;
            }
        }
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
exports.scrapeAirbnbSearch = scrapeAirbnbSearch;
// Cloud Function to handle scraping requests
exports.scrapeAirbnb = (0, https_1.onCall)({
    memory: '2GiB',
    timeoutSeconds: 300,
    minInstances: 0
}, async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { type, url, location, checkIn, checkOut } = request.data;
    try {
        if (type === 'listing' && url) {
            return await (0, exports.scrapeAirbnbListing)(url);
        }
        else if (type === 'search' && location) {
            // Handle optional parameters with empty strings as defaults
            const searchCheckIn = checkIn !== null && checkIn !== void 0 ? checkIn : '';
            const searchCheckOut = checkOut !== null && checkOut !== void 0 ? checkOut : '';
            return await (0, exports.scrapeAirbnbSearch)(location, searchCheckIn, searchCheckOut);
        }
        else {
            throw new https_1.HttpsError('invalid-argument', 'Invalid request parameters');
        }
    }
    catch (error) {
        console.error('Error in scrapeAirbnb function:', error);
        throw new https_1.HttpsError('internal', 'Error processing scraping request');
    }
});
//# sourceMappingURL=airbnb-scraper.js.map