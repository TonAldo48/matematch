'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScrapedListing, ListingInterest } from '@/lib/types';
import { useAuth } from '@/lib/context/auth-context';
import { Loader2 } from 'lucide-react';
import { SharedListingCard } from '@/components/housing/SharedListingCard';

interface ListingWithInterest extends ScrapedListing {
  listingId: string;
  interestedUsers: ListingInterest['interestedUsers'];
}

export default function SharedHousingPage() {
  const [listings, setListings] = useState<ListingWithInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSharedListings() {
      try {
        // Get all listings with interested users
        const interestsRef = collection(db, 'listingInterests');
        const interestsSnapshot = await getDocs(interestsRef);
        
        const listingsData: ListingWithInterest[] = [];
        const processedUrls = new Set<string>();

        for (const doc of interestsSnapshot.docs) {
          const data = doc.data() as ListingInterest;
          if (!data.interestedUsers?.length) continue;

          // Fetch the listing details from starredListings
          const firstUser = data.interestedUsers[0];
          const listingRef = collection(db, 'starredListings', firstUser.userId, 'listings');
          const listingDoc = await getDocs(query(listingRef));
          
          listingDoc.forEach((doc) => {
            const listingData = doc.data() as ScrapedListing;
            if (!processedUrls.has(listingData.url)) {
              listingsData.push({
                ...listingData,
                listingId: data.listingId,
                interestedUsers: data.interestedUsers,
              });
              processedUrls.add(listingData.url);
            }
          });
        }

        // Sort by number of interested users (descending)
        listingsData.sort((a, b) => b.interestedUsers.length - a.interestedUsers.length);
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching shared listings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedListings();
  }, []);

  const handleExpressInterest = async (listingId: string) => {
    if (!user) return;

    try {
      // Get user's profile data
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      const profileData = profileDoc.exists() ? profileDoc.data() : {};

      // Create base profile with required fields
      const userProfile = {
        uid: user.uid,
        displayName: profileData.fullName || user.displayName || 'Anonymous',
        email: user.email || '',
        ...(user.photoURL && { photoURL: user.photoURL }),
        ...(profileData.company && { company: profileData.company }),
        ...(profileData.role && { role: profileData.role }),
      };

      // Update the listings state optimistically
      setListings(prevListings => 
        prevListings.map(listing => {
          if (listing.listingId !== listingId) return listing;

          const isAlreadyInterested = listing.interestedUsers.some(u => u.userId === user.uid);
          const updatedUsers = isAlreadyInterested
            ? listing.interestedUsers.filter(u => u.userId !== user.uid)
            : [...listing.interestedUsers, { userId: user.uid, joinedAt: new Date(), userProfile }];

          return {
            ...listing,
            interestedUsers: updatedUsers,
          };
        })
      );

      // TODO: Update Firestore
    } catch (error) {
      console.error('Error handling interest:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Shared Housing Opportunities</h1>
          <p className="text-muted-foreground mt-2">
            Discover listings where others are looking for roommates to share housing with.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No shared housing opportunities found yet.
              {!user && " Sign in to express interest in listings and connect with potential roommates."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {listings.map((listing) => (
              <SharedListingCard
                key={listing.url}
                listing={listing}
                interestedUsers={listing.interestedUsers}
                onExpressInterest={() => handleExpressInterest(listing.listingId)}
                isUserInterested={listing.interestedUsers.some(u => u.userId === user?.uid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 