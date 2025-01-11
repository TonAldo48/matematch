"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAirbnb = exports.scrapeAirbnbSearch = exports.scrapeAirbnbListing = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer_1 = require("puppeteer-core");
const scrapeAirbnbListing = async (url) => {
    var _a;
    const browser = await puppeteer_1.default.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
        defaultViewport: { width: 1920, height: 1080 }
    });
    try {
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(60000);
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        // Extract listing data
        const listing = await page.evaluate(() => {
            // Helper function to safely query selectors
            const getTextContent = (selector) => {
                var _a;
                const element = document.querySelector(selector);
                return element ? ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '' : '';
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
            const images = Array.from(imageElements).map(img => img.getAttribute('data-original')).filter(Boolean);
            // Extract amenities
            const amenityElements = document.querySelectorAll('[data-testid="amenity-row"]');
            const amenities = Array.from(amenityElements).map(el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); }).filter(Boolean);
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
                houseRules: Array.from(document.querySelectorAll('[data-testid="house-rules"] li')).map(el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); }).filter(Boolean),
                rating: parseFloat(getTextContent('[data-testid="listing-rating"]') || '0'),
                reviewCount: parseInt(getTextContent('[data-testid="listing-reviews-count"]') || '0', 10),
                url: window.location.href
            };
        });
        return Object.assign(Object.assign({}, listing), { id: ((_a = url.split('/rooms/')[1]) === null || _a === void 0 ? void 0 : _a.split('?')[0]) || '', scrapedAt: admin.firestore.Timestamp.now() });
    }
    catch (error) {
        console.error('Error scraping Airbnb listing:', error);
        return null;
    }
    finally {
        await browser.close();
    }
};
exports.scrapeAirbnbListing = scrapeAirbnbListing;
const scrapeAirbnbSearch = async (location, checkIn, checkOut) => {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        // Construct search URL
        const searchParams = new URLSearchParams(Object.assign(Object.assign({ query: location }, (checkIn && { check_in: checkIn })), (checkOut && { check_out: checkOut })));
        const searchUrl = `https://www.airbnb.com/s/homes?${searchParams.toString()}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle0' });
        // Extract listing URLs
        const listingUrls = await page.evaluate(() => {
            const cards = document.querySelectorAll('[data-testid="listing-card"]');
            return Array.from(cards)
                .map(card => { var _a; return (_a = card.querySelector('a')) === null || _a === void 0 ? void 0 : _a.href; })
                .filter(Boolean);
        });
        // Scrape each listing
        const listings = [];
        for (const url of listingUrls.slice(0, 10)) { // Limit to 10 listings per search
            const listing = await (0, exports.scrapeAirbnbListing)(url);
            if (listing) {
                listings.push(listing);
            }
        }
        return listings;
    }
    catch (error) {
        console.error('Error scraping Airbnb search:', error);
        return [];
    }
    finally {
        await browser.close();
    }
};
exports.scrapeAirbnbSearch = scrapeAirbnbSearch;
// Cloud Function to handle scraping requests
exports.scrapeAirbnb = functions.https.onCall(async (data, context) => {
    // Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { type, url, location, checkIn, checkOut } = data;
    try {
        let result;
        if (type === 'listing' && url) {
            result = await (0, exports.scrapeAirbnbListing)(url);
        }
        else if (type === 'search' && location) {
            result = await (0, exports.scrapeAirbnbSearch)(location, checkIn, checkOut);
        }
        else {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid request parameters');
        }
        return result;
    }
    catch (error) {
        console.error('Error in scrapeAirbnb function:', error);
        throw new functions.https.HttpsError('internal', 'Error processing scraping request');
    }
});
//# sourceMappingURL=airbnb-scraper.js.map