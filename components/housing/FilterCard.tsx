import { Loader2, MapPin, Plus, Minus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from './DateRangePicker';
import { PriceRangeInput } from './PriceRangeInput';
import { AmenitiesSelect } from './AmenitiesSelect';
import Link from 'next/link';

interface FilterCardProps {
  location: string;
  onLocationChange: (location: string) => void;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  priceRange: { min: number; max: number };
  onPriceChange: (type: 'min' | 'max', value: string) => void;
  onPriceReset: () => void;
  propertyType: string;
  onPropertyTypeChange: (value: string) => void;
  selectedAmenities: string[];
  onAmenityChange: (amenity: string, checked: boolean) => void;
  onSearch: () => void;
  loading: boolean;
  userOfficeLocation?: {
    formatted: string;
  };
  adults: number;
  onAdultsChange: (value: number) => void;
}

export function FilterCard({
  location,
  onLocationChange,
  date,
  onDateChange,
  priceRange,
  onPriceChange,
  onPriceReset,
  propertyType,
  onPropertyTypeChange,
  selectedAmenities,
  onAmenityChange,
  onSearch,
  loading,
  userOfficeLocation,
  adults,
  onAdultsChange
}: FilterCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Find your perfect place</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Office Location</span>
            <Link href="/profile" className="text-xs text-primary hover:underline">
              Change
            </Link>
          </label>
          {userOfficeLocation ? (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground truncate">{userOfficeLocation.formatted}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">No office location set</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            type="text"
            placeholder="Enter city or area"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Adults</label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onAdultsChange(Math.max(1, adults - 1))}
              disabled={adults <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={adults}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= 16) {
                  onAdultsChange(value);
                }
              }}
              className="w-20 text-center"
              min={1}
              max={16}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onAdultsChange(Math.min(16, adults + 1))}
              disabled={adults >= 16}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DateRangePicker date={date} onDateChange={onDateChange} />

        <PriceRangeInput
          priceRange={priceRange}
          onPriceChange={onPriceChange}
          onReset={onPriceReset}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Property Type</label>
          <Select value={propertyType} onValueChange={onPropertyTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homes">All Homes</SelectItem>
              <SelectItem value="apartments">Apartment</SelectItem>
              <SelectItem value="houses">House</SelectItem>
              <SelectItem value="rooms">Private Room</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AmenitiesSelect
          selectedAmenities={selectedAmenities}
          onAmenityChange={onAmenityChange}
        />
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search Listings'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 