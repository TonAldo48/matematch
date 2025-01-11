import { MapPin, Car, Train, Maximize2, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrapedListing, StarredListing, InterestedUser, UserProfile } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/context/auth-context";
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InterestedUsersModal } from './InterestedUsersModal';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';

interface DistanceInfo {
  driving: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  };
  transit: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  };
}

interface ListingCardProps {
  listing: ScrapedListing;
  userOfficeLocation?: {
    formatted: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  savedCommuteInfo?: {
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
}

export function ListingCard({ listing, userOfficeLocation, savedCommuteInfo }: ListingCardProps) {
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(savedCommuteInfo?.distanceInfo || null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isStarring, setIsStarring] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [moveInDate, setMoveInDate] = useState<Date | undefined>();
  const [moveOutDate, setMoveOutDate] = useState<Date | undefined>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Check if listing is starred on mount
  useEffect(() => {
    const checkIfStarred = async () => {
      if (!user) return;
      
      const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
      if (!listingId) return;

      try {
        const starredDoc = await getDoc(doc(db, 'starredListings', user.uid, 'listings', listingId));
        setIsStarred(starredDoc.exists());
      } catch (error) {
        console.error('Error checking starred status:', error);
      }
    };

    checkIfStarred();
  }, [user, listing.url]);

  // Check if user is interested in this listing
  useEffect(() => {
    const checkIfInterested = async () => {
      if (!user) {
        setIsInterested(false);
        return;
      }
      
      const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
      if (!listingId) return;

      try {
        const interestRef = doc(db, 'listingInterests', listingId);
        const interestDoc = await getDoc(interestRef);
        if (interestDoc.exists()) {
          const data = interestDoc.data();
          setIsInterested(data.interestedUsers?.some((u: any) => u.userId === user.uid) || false);
        } else {
          setIsInterested(false);
        }
      } catch (error) {
        console.error('Error checking interest status:', error);
        setIsInterested(false);
      }
    };

    checkIfInterested();
  }, [user, listing.url]);

  // Add effect to fetch interested users
  useEffect(() => {
    const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
    if (!listingId) return;

    const interestsRef = collection(db, 'listingInterests');
    const q = query(interestsRef, where('listingId', '==', listingId));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const users: InterestedUser[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.interestedUsers) {
            users.push(...data.interestedUsers);
          }
        });
        setInterestedUsers(users);
      },
      (error) => {
        console.error('Error fetching interested users:', error);
        setInterestedUsers([]);
      }
    );

    return () => unsubscribe();
  }, [listing.url]);

  const handleStarToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save listings.",
        variant: "destructive",
      });
      return;
    }

    const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
    if (!listingId) {
      toast({
        title: "Error",
        description: "Invalid listing URL.",
        variant: "destructive",
      });
      return;
    }

    setIsStarring(true);
    try {
      const listingRef = doc(db, 'starredListings', user.uid, 'listings', listingId);

      if (isStarred) {
        await deleteDoc(listingRef);
        setIsStarred(false);
        toast({
          title: "Removed from saved",
          description: "Listing has been removed from your saved listings.",
        });
      } else {
        const listingData: Partial<StarredListing> = {
          ...listing,
          starredAt: new Date(),
          userId: user.uid,
          listingId,
        };

        // If we have distance info, include it
        if (distanceInfo && userOfficeLocation) {
          listingData.commuteInfo = {
            calculatedAt: new Date(),
            distanceInfo,
            officeLocation: userOfficeLocation
          };
        }

        await setDoc(listingRef, listingData);
        setIsStarred(true);
        toast({
          title: "Saved",
          description: "Listing has been saved to your profile.",
        });
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Error",
        description: "Failed to update saved listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarring(false);
    }
  };

  // Debug log
  useEffect(() => {
    console.log('ListingCard userOfficeLocation:', userOfficeLocation);
  }, [userOfficeLocation]);

  const calculateDistance = async () => {
    if (!userOfficeLocation) {
      toast({
        title: "No office location",
        description: "Please set your office location in your profile first.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to calculate and save commute times.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting distance calculation...');
    console.log('Office location:', userOfficeLocation);
    console.log('Listing URL:', listing.url);

    setIsCalculating(true);
    try {
      // First get the listing coordinates
      console.log('Fetching listing coordinates...');
      const locationResponse = await fetch("/api/airbnb-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: listing.url,
        }),
      });

      const locationData = await locationResponse.json();
      console.log('Location API response:', locationData);

      if (!locationData.success || !locationData.coordinates) {
        throw new Error(locationData.error || "Failed to get listing coordinates");
      }

      // Then calculate the distance
      console.log('Calculating distance...');
      const response = await fetch("/api/commute-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: locationData.coordinates,
          destination: userOfficeLocation.coordinates,
        }),
      });

      const data = await response.json();
      console.log('Distance API response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      setDistanceInfo(data);

      // If the listing is starred, update the commute info in Firestore
      const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
      if (listingId && isStarred) {
        const listingRef = doc(db, 'starredListings', user.uid, 'listings', listingId);
        await setDoc(listingRef, {
          commuteInfo: {
            calculatedAt: new Date(),
            distanceInfo: data,
            officeLocation: userOfficeLocation
          }
        }, { merge: true });
      }

      toast({
        title: "Success",
        description: "Distance calculated successfully",
      });
    } catch (error) {
      console.error("Distance calculation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calculate distance to office",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to show interest in sharing.",
        variant: "destructive",
      });
      return;
    }

    const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
    if (!listingId) {
      toast({
        title: "Error",
        description: "Invalid listing URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's profile data
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      const profileData = profileDoc.exists() ? profileDoc.data() : {};

      // Create base profile with required fields
      const userProfile: UserProfile = {
        uid: user.uid,
        displayName: profileData.fullName || user.displayName || 'Anonymous',
        email: user.email || '',
      };

      // Only add optional fields if they exist
      if (user.photoURL) userProfile.photoURL = user.photoURL;
      if (profileData.company) userProfile.company = profileData.company;
      if (profileData.role) userProfile.role = profileData.role;

      const newInterestedUser: InterestedUser = {
        userId: user.uid,
        joinedAt: new Date(),
        userProfile,
      };

      const interestRef = doc(db, 'listingInterests', listingId);
      const currentDoc = await getDoc(interestRef);
      
      if (currentDoc.exists()) {
        // Update existing document
        const currentData = currentDoc.data();
        const updatedUsers = currentData.interestedUsers.filter((u: any) => u.userId !== user.uid);
        await setDoc(interestRef, {
          listingId,
          interestedUsers: [...updatedUsers, newInterestedUser],
          lastUpdated: new Date(),
        });
      } else {
        // Create new document
        await setDoc(interestRef, {
          listingId,
          interestedUsers: [newInterestedUser],
          lastUpdated: new Date(),
        });
      }

      setIsInterested(true);
      setShowUsersModal(false);
      toast({
        title: "Interest added",
        description: "You are now listed as interested in sharing this listing.",
      });
    } catch (error) {
      console.error('Error adding interest:', error);
      toast({
        title: "Error",
        description: "Failed to add interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveInterest = async () => {
    if (!user) return;

    const listingId = listing.url.split('/rooms/')[1]?.split('?')[0];
    if (!listingId) return;

    try {
      const interestRef = doc(db, 'listingInterests', listingId);
      const currentDoc = await getDoc(interestRef);
      
      if (currentDoc.exists()) {
        const currentData = currentDoc.data();
        const updatedUsers = currentData.interestedUsers.filter((u: any) => u.userId !== user.uid);
        
        if (updatedUsers.length === 0) {
          // If no users left, delete the document
          await deleteDoc(interestRef);
        } else {
          // Update with remaining users
          await setDoc(interestRef, {
            listingId,
            interestedUsers: updatedUsers,
            lastUpdated: new Date(),
          });
        }

        setIsInterested(false);
        toast({
          title: "Interest removed",
          description: "You are no longer interested in sharing this listing.",
        });
      }
    } catch (error) {
      console.error('Error removing interest:', error);
      toast({
        title: "Error",
        description: "Failed to remove interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="relative group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Star Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white ${
          isStarred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'
        }`}
        onClick={handleStarToggle}
        disabled={isStarring}
      >
        <Star className={`h-5 w-5 transition-colors ${isStarred ? 'fill-current' : ''}`} />
      </Button>

      {/* Thumbnail and Price */}
      <div className="flex flex-col">
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          {listing.images[0] && (
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full h-full relative group">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold">{listing.price.currency}{listing.price.amount}</span>
              <span className="text-sm text-muted-foreground">per {listing.price.period}</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">{listing.title}</h3>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <p className="text-sm line-clamp-1">{listing.location}</p>
            </div>
          </div>

          {/* Distance Section */}
          {isCalculating ? (
            <div className="rounded-xl border bg-muted/50 p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin h-5 w-5 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="animate-spin"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <p className="font-medium text-sm">Calculating commute times...</p>
              </div>
            </div>
          ) : distanceInfo ? (
            <div className="rounded-xl border bg-muted/50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Distance to Office</h3>
              </div>
              
              <div className="grid gap-4">
                {distanceInfo.driving && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">By Car</p>
                      <div className="space-y-0.5 text-sm text-muted-foreground">
                        <p>Distance: {distanceInfo.driving.distance.text}</p>
                        <p>Duration: {distanceInfo.driving.duration.text}</p>
                      </div>
                    </div>
                  </div>
                )}

                {distanceInfo.transit && distanceInfo.transit.distance && distanceInfo.transit.duration && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Train className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">By Transit</p>
                      <div className="space-y-0.5 text-sm text-muted-foreground">
                        <p>Distance: {distanceInfo.transit.distance.text}</p>
                        <p>Duration: {distanceInfo.transit.duration.text}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!distanceInfo.transit && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Train className="h-5 w-5 text-muted" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-muted-foreground">Public Transit</p>
                      <p className="text-sm text-muted-foreground">Not available for this location</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button 
              variant="default"
              className="w-full"
              onClick={calculateDistance}
              disabled={isCalculating || !userOfficeLocation}
              title={!userOfficeLocation ? "Set your office location in your profile first" : ""}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {!userOfficeLocation 
                ? "Set Office Location First"
                : "Calculate Distance to Office"
              }
            </Button>
          )}

          {/* View on Airbnb and Share Housing buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(listing.url, '_blank')}
            >
              View on Airbnb
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={() => setShowUsersModal(true)}
            >
              {interestedUsers?.length > 0 ? `${interestedUsers.length} Interested` : 'Share Housing'}
            </Button>
          </div>
        </div>
      </div>

      {/* Interested Users Modal */}
      <InterestedUsersModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        interestedUsers={interestedUsers}
        isInterested={isInterested}
        onExpressInterest={handleExpressInterest}
        onRemoveInterest={handleRemoveInterest}
      />
    </Card>
  );
} 