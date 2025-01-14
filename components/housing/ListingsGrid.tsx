import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrapedListing } from '@/lib/types';
import { ListingCard } from './ListingCard';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { MapPin } from "lucide-react";

interface ListingsGridProps {
  listings: ScrapedListing[];
  loading: boolean;
  userOfficeLocation?: {
    formatted: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  location?: string;
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc';

const ITEMS_PER_PAGE = 9;

export function ListingsGrid({ listings, loading, userOfficeLocation, location }: ListingsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  
  // Sort listings
  const sortedListings = useMemo(() => {
    const listingsCopy = [...listings];
    
    switch (sortBy) {
      case 'price-asc':
        return listingsCopy.sort((a, b) => a.price.amount - b.price.amount);
      case 'price-desc':
        return listingsCopy.sort((a, b) => b.price.amount - a.price.amount);
      default:
        // 'relevance' - keep original order
        return listingsCopy;
    }
  }, [listings, sortBy]);

  const totalPages = Math.ceil(sortedListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentListings = sortedListings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of listings
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Listings</h2>
        <Select 
          value={sortBy} 
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Most Relevant</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {listings.length === 0 && !loading ? (
        <Card className="p-6 text-center text-muted-foreground">
          {location ? (
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium mb-2">No listings found</p>
              <p className="text-sm">
                Try adjusting your search filters or entering a different location to find available listings.
              </p>
            </div>
          ) : (
            <p>Enter a location and click search to find available listings</p>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentListings.map((listing, index) => (
              <ListingCard 
                key={`${listing.url}-${index}`}
                listing={{
                  ...listing,
                  id: listing.url.split('/rooms/')[1]?.split('?')[0] || `listing-${index}`
                }}
                userOfficeLocation={userOfficeLocation}
              />
            ))}
          </div>

          {/* Pagination and Stats */}
          {sortedListings.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedListings.length)} of {sortedListings.length} listings
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 