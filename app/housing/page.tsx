'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { generateAirbnbSearchUrl } from '@/lib/utils/airbnb-url';
import { ScrapedListing } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FilterCard } from '@/components/housing/FilterCard';
import { ListingsGrid } from '@/components/housing/ListingsGrid';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DEFAULT_PRICE_RANGE = { min: 0, max: 1000 };
const PRICE_RANGE_STORAGE_KEY = 'housing-price-range';

interface UserOfficeLocation {
  formatted: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function HousingPage() {
  const [user] = useAuthState(auth);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>(DEFAULT_PRICE_RANGE);
  const [propertyType, setPropertyType] = useState('homes');
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<ScrapedListing[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [adults, setAdults] = useState(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [userOfficeLocation, setUserOfficeLocation] = useState<UserOfficeLocation | undefined>();
  const { toast } = useToast();

  // Load user's office location from profile
  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        console.log('Profile doc exists:', profileDoc.exists());
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          console.log('Profile data:', data);
          if (data.verifiedLocation) {
            console.log('Setting office location:', data.verifiedLocation);
            setUserOfficeLocation({
              formatted: data.verifiedLocation.formatted,
              coordinates: {
                lat: data.verifiedLocation.coordinates.lat,
                lng: data.verifiedLocation.coordinates.lng
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }

    loadUserProfile();
  }, [user]);

  // Load price range from local storage on mount
  useEffect(() => {
    const storedRange = localStorage.getItem(PRICE_RANGE_STORAGE_KEY);
    if (storedRange) {
      try {
        const parsed = JSON.parse(storedRange);
        setPriceRange(parsed);
      } catch (e) {
        console.error('Failed to parse stored price range');
      }
    }
  }, []);

  // Update local storage when price range changes
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    const newRange = {
      ...priceRange,
      [type]: numValue
    };
    
    // Ensure min doesn't exceed max and max isn't less than min
    if (type === 'min' && numValue > priceRange.max) {
      newRange.max = numValue;
    } else if (type === 'max' && numValue < priceRange.min) {
      newRange.min = numValue;
    }

    setPriceRange(newRange);
    localStorage.setItem(PRICE_RANGE_STORAGE_KEY, JSON.stringify(newRange));
  };

  // Reset price range to default
  const handleResetPriceRange = () => {
    setPriceRange(DEFAULT_PRICE_RANGE);
    localStorage.setItem(PRICE_RANGE_STORAGE_KEY, JSON.stringify(DEFAULT_PRICE_RANGE));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setSelectedAmenities(prev => {
      if (checked) {
        return [...prev, amenity];
      } else {
        return prev.filter(a => a !== amenity);
      }
    });
  };

  const handleSearch = async () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setListings([]);
    try {
      const searchUrl = generateAirbnbSearchUrl({
        location,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        propertyType,
        checkIn: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
        checkOut: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
        amenities: selectedAmenities,
        adults
      });

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: searchUrl, mode: 'search' }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch listings');
      }

      setListings(result.data);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Filters Section */}
        <div className="col-span-3 relative">
          <div className="sticky top-6">
            <FilterCard
              location={location}
              onLocationChange={setLocation}
              date={date}
              onDateChange={setDate}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              onPriceReset={handleResetPriceRange}
              propertyType={propertyType}
              onPropertyTypeChange={setPropertyType}
              selectedAmenities={selectedAmenities}
              onAmenityChange={handleAmenityChange}
              onSearch={handleSearch}
              loading={loading}
              userOfficeLocation={userOfficeLocation}
              adults={adults}
              onAdultsChange={setAdults}
            />
          </div>
        </div>

        {/* Listings Section */}
        <div className="col-span-9">
          <ListingsGrid
            listings={listings}
            loading={loading}
            userOfficeLocation={userOfficeLocation}
            location={location}
          />
        </div>
      </div>
    </div>
  );
} 