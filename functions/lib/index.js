import { initializeApp } from 'firebase-admin/app';
import { scrapeAirbnb } from './airbnb-scraper.js';
initializeApp();
export { scrapeAirbnb };
