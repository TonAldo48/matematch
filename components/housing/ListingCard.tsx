import { MapPin, Car, Train, Maximize2, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrapedListing } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/context/auth-context";
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

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
}

export function ListingCard({ listing, userOfficeLocation }: ListingCardProps) {
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isStarring, setIsStarring] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
        await setDoc(listingRef, {
          ...listing,
          starredAt: new Date(),
          userId: user.uid,
          listingId,
        });
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
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-contain"
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
              <div className="flex items-center space-x-3">
                <div className="animate-spin">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium">Calculating commute times...</p>
              </div>
            </div>
          ) : distanceInfo ? (
            <div className="rounded-xl border bg-muted/50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Distance to Office</h3>
              </div>
              
              <div className="grid gap-4">
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

          {/* View on Airbnb */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(listing.url, '_blank')}
          >
            View on Airbnb
          </Button>
        </div>
      </div>
    </Card>
  );
} 