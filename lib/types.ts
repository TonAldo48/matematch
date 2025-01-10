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

export interface DistanceInfo {
  driving: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  };
  transit: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  company?: string;
  role?: string;
  internshipTerm?: {
    season: 'Winter' | 'Spring' | 'Summer' | 'Fall';
    year: number;
  };
}

export interface InterestedUser {
  userId: string;
  joinedAt: Date;
  userProfile: UserProfile;
  message?: string;
  moveInDate?: Date;
  moveOutDate?: Date;
  preferences?: {
    maxBudget?: number;
    roomPreference?: 'private' | 'shared';
    lifestyle?: string[];
  };
}

export interface ListingInterest {
  listingId: string;
  interestedUsers: InterestedUser[];
  lastUpdated: Date;
}

export interface StarredListing extends ScrapedListing {
  starredAt: Date;
  userId: string;
  listingId: string; // Generated from the URL
  notes?: string;
  commuteInfo?: {
    calculatedAt: Date;
    distanceInfo: DistanceInfo;
    officeLocation: {
      formatted: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
  interested?: boolean; // Whether the current user is interested in sharing
  interestDetails?: {
    message?: string;
    moveInDate?: Date;
    moveOutDate?: Date;
  };
} 