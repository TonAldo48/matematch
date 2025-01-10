export interface ScrapedListing {
  title: string;
  price: {
    amount: number;
    currency: string;
    period: string;
    originalAmount?: number;
    discountPercentage?: number;
  };
  images: string[];
  location: string;
  details: {
    bedrooms: number;
    bathrooms: number;
    guests: number;
  };
  amenities: string[];
  description: string;
  url: string;
  rating?: string;
}

export interface StarredListing extends ScrapedListing {
  starredAt: Date;
  userId: string;
  listingId: string; // Generated from the URL
  notes?: string;
} 