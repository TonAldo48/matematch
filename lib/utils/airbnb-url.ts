interface AirbnbSearchParams {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  checkIn?: string;  // Format: YYYY-MM-DD
  checkOut?: string; // Format: YYYY-MM-DD
  amenities?: string[];
  adults?: number;
}

export function generateAirbnbSearchUrl({
  location,
  minPrice = 0,
  maxPrice = 1000,
  propertyType = 'homes',
  checkIn,
  checkOut,
  amenities = [],
  adults = 1
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
  
  let queryParams = [
    `refinement_paths[]=${propertyPath}`,
    `flexible_trip_lengths[]=one_week`,
    `price_filter_input_type=0`,
    `channel=EXPLORE`,
    `query=${encodedLocation}`,
    `adults=${adults}`
  ];

  // Add amenity filters
  amenities.forEach(amenity => {
    const amenityId = amenityIds[amenity];
    if (amenityId) {
      queryParams.push(`amenities[]=${amenityId}`);
    }
  });

  // Add price filters
  queryParams.push(`price_filter_input_type=0`);
  if (minPrice > 0) {
    queryParams.push(`price_min=${minPrice}`);
  }
  if (maxPrice < 1000) {
    queryParams.push(`price_max=${maxPrice}`);
  }
  queryParams.push(`price_filter_num_nights=5`); // Default number of nights for price calculation

  // Add date parameters if provided
  if (checkIn && checkOut) {
    queryParams.push(`date_picker_type=calendar`);
    queryParams.push(`checkin=${checkIn}`);
    queryParams.push(`checkout=${checkOut}`);
    queryParams.push(`source=structured_search_input_header`);
    queryParams.push(`search_type=autocomplete_click`);

    // Calculate number of nights for price filter
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    queryParams.push(`price_filter_num_nights=${nights}`);
  }

  // Calculate monthly dates if dates are provided
  if (checkIn && checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const monthlyStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const monthlyEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 3, 1);
    
    queryParams.push(`monthly_start_date=${monthlyStartDate.toISOString().split('T')[0]}`);
    queryParams.push(`monthly_end_date=${monthlyEndDate.toISOString().split('T')[0]}`);
    queryParams.push(`monthly_length=3`);
  }

  return `${baseUrl}/${encodedLocation}/homes?${queryParams.join('&')}`;
} 