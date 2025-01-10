'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { StarredListing } from '@/lib/types';
import { ListingCard } from '@/components/housing/ListingCard';
import { Card } from '@/components/ui/card';
import { Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SavedListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<StarredListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedListings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const listingsRef = collection(db, 'starredListings', user.uid, 'listings');
        const listingsSnapshot = await getDocs(listingsRef);
        
        const savedListings = listingsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            starredAt: data.starredAt?.toDate(),
            commuteInfo: data.commuteInfo ? {
              ...data.commuteInfo,
              calculatedAt: data.commuteInfo.calculatedAt.toDate()
            } : undefined
          } as StarredListing;
        });

        // Sort by most recently starred
        savedListings.sort((a, b) => b.starredAt.getTime() - a.starredAt.getTime());
        
        setListings(savedListings);
      } catch (error) {
        console.error('Error fetching saved listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedListings();
  }, [user]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Saved Listings</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-[500px] animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Saved Listings</h1>
        </div>
        <Card className="p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-3">No saved listings yet</h2>
            <p className="text-muted-foreground mb-8">
              Start exploring available listings and save your favorites to compare them later.
            </p>
            <Link href="/housing">
              <Button className="gap-2">
                <Building2 className="w-4 h-4" />
                Browse Listings
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Saved Listings</h1>
          <p className="text-muted-foreground">
            You have saved {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/housing">
          <Button variant="outline" className="gap-2">
            <Building2 className="w-4 h-4" />
            Browse More
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.listingId}
            listing={listing}
            savedCommuteInfo={listing.commuteInfo}
          />
        ))}
      </div>
    </div>
  );
}