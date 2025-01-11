import * as admin from 'firebase-admin';
import { scrapeAirbnb } from './airbnb-scraper';

admin.initializeApp();

export { scrapeAirbnb };