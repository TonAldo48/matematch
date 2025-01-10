interface AirbnbSearchParams {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  checkIn?: string;  // Format: YYYY-MM-DD
  checkOut?: string; // Format: YYYY-MM-DD
  amenities?: string[];
}

export function generateAirbnbSearchUrl({
  location,
  minPrice = 0,
  maxPrice = 1000,
  propertyType = 'homes',
  checkIn,
  checkOut,
  amenities = []
}: AirbnbSearchParams): string {
  const baseUrl = 'https://www.airbnb.com/s';
  const encodedLocation = encodeURIComponent(location);
  
  // Map property types to Airbnb paths
  const propertyTypePaths: Record<string, string> = {
    'homes': '/homes',
    'apartments': '/homes/category/apartment',
    'houses': '/homes/category/house',
    'rooms': '/homes/category/private_room'
  };

  // Map our amenity keys to Airbnb's amenity identifiers
  const amenityIds: Record<string, string> = {
    'parking': '9',
    'furnished': '4',
    'pets': '12'
  };

  const propertyPath = propertyTypePaths[propertyType] || '/homes';
  
  const queryParams = new URLSearchParams();

  queryParams.append('refinement_paths[]', propertyPath);
  queryParams.append('flexible_trip_lengths[]', 'one_week');
  queryParams.append('price_filter_input_type', '0');
  queryParams.append('channel', 'EXPLORE');
  queryParams.append('query', encodedLocation);
  queryParams.append('adults', '1');

  // Add amenity filters
  amenities.forEach(amenity => {
    const amenityId = amenityIds[amenity];
    if (amenityId) {
      queryParams.append('amenities[]', amenityId);
    }
  });

  // Add price filters
  queryParams.append('price_filter_input_type', '0');
  if (minPrice > 0) {
    queryParams.append('price_min', minPrice.toString());
  }
  if (maxPrice < 1000) {
    queryParams.append('price_max', maxPrice.toString());
  }
  queryParams.append('price_filter_num_nights', '5'); // Default number of nights for price calculation

  // Add date parameters if provided
  if (checkIn && checkOut) {
    queryParams.append('date_picker_type', 'calendar');
    queryParams.append('checkin', checkIn);
    queryParams.append('checkout', checkOut);
    queryParams.append('source', 'structured_search_input_header');
    queryParams.append('search_type', 'autocomplete_click');

    // Calculate number of nights for price filter
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    queryParams.append('price_filter_num_nights', nights.toString());
  }

  // Calculate monthly dates if dates are provided
  if (checkIn && checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const monthlyStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const monthlyEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 3, 1);
    
    queryParams.append('monthly_start_date', monthlyStartDate.toISOString().split('T')[0]);
    queryParams.append('monthly_end_date', monthlyEndDate.toISOString().split('T')[0]);
    queryParams.append('monthly_length', '3');
  }

  return `${baseUrl}/${encodedLocation}/homes?${queryParams.toString()}`;
} 