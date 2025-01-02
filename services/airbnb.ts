const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

interface AirbnbSearchParams {
  location: string;
  checkin: string;
  checkout: string;
  adults: number;
  children?: number;
  infants?: number;
  pets?: number;
  page?: number;
  currency?: string;
}

interface AirbnbListing {
  id: string;
  title: string;
  price: {
    rate: number;
    currency: string;
    total?: number;
  };
  images: string[];
  address: string;
  roomType: string;
  bedrooms: number;
  bathrooms: number;
  rating?: number;
  reviewsCount?: number;
  url: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export async function searchListings(params: AirbnbSearchParams): Promise<AirbnbListing[]> {
  const url = 'https://airbnb-listings.p.rapidapi.com/v2/search';
  const queryParams = new URLSearchParams({
    location: params.location,
    checkIn: params.checkin,
    checkOut: params.checkout,
    adults: params.adults.toString(),
    children: (params.children || 0).toString(),
    infants: (params.infants || 0).toString(),
    pets: (params.pets || 0).toString(),
    page: (params.page || 1).toString(),
    currency: params.currency || 'USD',
    type: 'ENTIRE_HOME',
    priceMax: '5000',
    amenities: 'WIFI,KITCHEN',
    minBedrooms: '1'
  });

  try {
    const response = await fetch(`${url}?${queryParams}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'airbnb-listings.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch listings');
    }

    return data.listings.map((item: any) => ({
      id: item.listingId,
      title: item.listingTitle,
      price: {
        rate: item.pricePeriodicity.rate,
        currency: item.pricePeriodicity.currency,
        total: item.pricePeriodicity.total
      },
      images: item.images.map((img: any) => img.url),
      address: item.address.full,
      roomType: item.spaceType,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      rating: item.stars,
      reviewsCount: item.reviewsCount,
      url: `https://www.airbnb.com/rooms/${item.listingId}`,
      coordinates: {
        lat: item.address.lat,
        lng: item.address.lng
      }
    }));
  } catch (error) {
    console.error('Error fetching Airbnb listings:', error);
    throw error;
  }
} 