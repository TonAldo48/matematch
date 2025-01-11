'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, collectionGroup, onSnapshot } from 'firebase/firestore';
import { ScrapedListing, InterestedUser } from '@/lib/types';
import { SharedHousingCard } from '@/components/housing/SharedHousingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Building2, Search, Users, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SharedListing extends ScrapedListing {
  listingId: string;
  interestedUsers: InterestedUser[];
}

export default function SharedHousingPage() {
  const [listings, setListings] = useState<SharedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      // First get all listings
      const listingsRef = collectionGroup(db, 'listings');
      const listingsSnapshot = await getDocs(listingsRef);
      
      // Then get all interests
      const interestsRef = collection(db, 'listingInterests');
      const interestsSnapshot = await getDocs(interestsRef);
      
      // Create a map of listing interests
      const interestsMap = new Map();
      interestsSnapshot.docs.forEach(doc => {
        const interestData = doc.data();
        if (interestData.interestedUsers?.length > 0) {
          interestsMap.set(doc.id, interestData.interestedUsers);
        }
      });

      // Process all listings and include those with interests
      const sharedListings: SharedListing[] = [];
      const processedListings = new Set<string>();

      listingsSnapshot.docs.forEach(doc => {
        const listingData = doc.data() as ScrapedListing;
        const listingId = listingData.url.split('/rooms/')[1]?.split('?')[0];
        
        if (listingId && !processedListings.has(listingId)) {
          const interestedUsers = interestsMap.get(listingId) || [];
          
          // Include the listing if it has any interests
          if (interestedUsers.length > 0) {
            sharedListings.push({
              ...listingData,
              listingId,
              interestedUsers,
            });
            processedListings.add(listingId);
          }
        }
      });
      
      // Sort by number of interested users
      sharedListings.sort((a, b) => b.interestedUsers.length - a.interestedUsers.length);
      
      setListings(sharedListings);
    } catch (error) {
      console.error('Error fetching shared listings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  useEffect(() => {
    // Subscribe to listing interests
    const interestsRef = collection(db, 'listingInterests');
    const unsubscribeInterests = onSnapshot(interestsRef, async () => {
      setLoading(true);
      await fetchListings();
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeInterests();
    };
  }, []);

  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedByInterest = [...filteredListings].sort((a, b) => 
    b.interestedUsers.length - a.interestedUsers.length
  );

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Shared Housing Opportunities</h1>
        <p className="text-muted-foreground">
          Discover listings where others are looking for roommates to share housing with.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location or title..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className={refreshing ? "animate-spin" : ""}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            All Listings ({filteredListings.length})
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Most Interest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading shared housing opportunities...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No shared housing opportunities found yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredListings.map((listing) => (
                <SharedHousingCard
                  key={listing.listingId}
                  listing={listing}
                  interestedUsers={listing.interestedUsers}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid gap-6">
            {sortedByInterest.map((listing) => (
              <SharedHousingCard
                key={listing.listingId}
                listing={listing}
                interestedUsers={listing.interestedUsers}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 