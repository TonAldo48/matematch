"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAirbnb = void 0;
const admin = require("firebase-admin");
const airbnb_scraper_1 = require("./airbnb-scraper");
Object.defineProperty(exports, "scrapeAirbnb", { enumerable: true, get: function () { return airbnb_scraper_1.scrapeAirbnb; } });
admin.initializeApp();
//# sourceMappingURL=index.js.map