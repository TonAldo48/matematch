"use strict";

import { CallableRequest } from 'firebase-functions/v2/https';
import { onCall } from 'firebase-functions/v2/https';
import * as firebaseAdmin from 'firebase-admin';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';

// Browser launch options optimized for Cloud Functions
const getBrowserOptions = async () => ({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
});

interface AirbnbListing {
    title: string;
    location: {
        address: string;
        city: string;
        coordinates: { latitude: number; longitude: number };
    };
    price: {
        amount: number;
        currency: string;
        period: string;
    };
    details: {
        bedrooms: number;
        bathrooms: number;
        maxGuests: number;
    };
    amenities: string[];
    images: string[];
    description: string;
    houseRules: string[];
    rating: number;
    reviewCount: number;
    url: string;
}

async function scrapeAirbnbListing(url: string): Promise<AirbnbListing & { id: string; scrapedAt: firebaseAdmin.firestore.Timestamp }> {
    const browser = await puppeteer.launch(await getBrowserOptions());
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        const listing = await page.evaluate(() => ({
            title: document.querySelector('[data-testid="listing-title"]')?.textContent?.trim() || '',
            location: {
                address: document.querySelector('[data-testid="listing-address"]')?.textContent?.trim() || '',
                city: document.querySelector('[data-testid="listing-city"]')?.textContent?.trim() || '',
                coordinates: { latitude: 0, longitude: 0 }
            },
            price: {
                amount: 0,
                currency: 'USD',
                period: 'night'
            },
            details: {
                bedrooms: 0,
                bathrooms: 0,
                maxGuests: 0
            },
            amenities: [],
            images: [],
            description: '',
            houseRules: [],
            rating: 0,
            reviewCount: 0,
            url: window.location.href
        }));

        return {
            ...listing,
            id: url.split('/rooms/')[1]?.split('?')[0] || '',
            scrapedAt: firebaseAdmin.firestore.Timestamp.now()
        };
    } finally {
        await browser.close();
    }
}

async function scrapeAirbnbSearch(
    location: string,
    checkIn?: string,
    checkOut?: string
): Promise<Array<AirbnbListing & { id: string; scrapedAt: firebaseAdmin.firestore.Timestamp }>> {
    const browser = await puppeteer.launch(await getBrowserOptions());
    try {
        const page = await browser.newPage();
        
        // Construct search URL
        const searchParams = new URLSearchParams({
            query: location,
            ...(checkIn && { check_in: checkIn }),
            ...(checkOut && { check_out: checkOut })
        });
        
        await page.goto(`https://www.airbnb.com/s/homes?${searchParams.toString()}`, {
            waitUntil: 'networkidle0'
        });

        // Extract listing URLs
        const listingUrls = await page.evaluate(() => {
            const cards = document.querySelectorAll('[data-testid="listing-card"]');
            return Array.from(cards)
                .map(card => card.querySelector('a')?.href)
                .filter((href): href is string => typeof href === 'string');
        });

        // Scrape each listing
        const listings = [];
        for (const url of listingUrls.slice(0, 10)) {
            try {
                const listing = await scrapeAirbnbListing(url);
                listings.push(listing);
            } catch (error) {
                console.error(`Error scraping listing ${url}:`, error);
            }
        }

        return listings;
    } finally {
        await browser.close();
    }
}

export const scrapeAirbnb = onCall({
    memory: '2GiB',
    timeoutSeconds: 300,
}, async (request: CallableRequest) => {
    if (!request.auth) {
        throw new Error('Authentication required');
    }

    const { url, mode, location, checkIn, checkOut } = request.data;
    
    try {
        if (mode === 'listing' && url) {
            return await scrapeAirbnbListing(url);
        }
        else if (mode === 'search' && location) {
            return await scrapeAirbnbSearch(
                location,
                checkIn || undefined,
                checkOut || undefined
            );
        }
        else {
            throw new Error('Invalid request parameters');
        }
    }
    catch (error) {
        console.error('Error in scrapeAirbnb function:', error);
        throw new Error('Error processing scraping request');
    }
});