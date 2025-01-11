import { ScrapedListing, InterestedUser } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Building2, ExternalLink, Bed, Bath, Users as UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { InterestedUsersModal } from "./InterestedUsersModal";
import { useAuth } from "@/lib/context/auth-context";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface SharedHousingCardProps {
  listing: ScrapedListing & { listingId: string };
  interestedUsers: InterestedUser[];
}

export function SharedHousingCard({ listing, interestedUsers }: SharedHousingCardProps) {
  const [showUsersModal, setShowUsersModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isUserInterested = interestedUsers.some(u => u.userId === user?.uid);

  const handleExpressInterest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to show interest in sharing.",
        variant: "destructive",
      });
      return;
    }

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

      const newInterestedUser = {
        userId: user.uid,
        joinedAt: new Date(),
        userProfile,
      };

      const interestRef = doc(db, 'listingInterests', listing.listingId);
      await setDoc(interestRef, {
        listingId: listing.listingId,
        interestedUsers: [...interestedUsers.filter(u => u.userId !== user.uid), newInterestedUser],
        lastUpdated: new Date(),
      });

      toast({
        title: "Interest added",
        description: "You are now listed as interested in sharing this listing.",
      });
    } catch (error) {
      console.error('Error expressing interest:', error);
      toast({
        title: "Error",
        description: "Failed to express interest. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveInterest = async () => {
    if (!user) return;

    try {
      const interestRef = doc(db, 'listingInterests', listing.listingId);
      const updatedUsers = interestedUsers.filter(u => u.userId !== user.uid);
      
      await setDoc(interestRef, {
        listingId: listing.listingId,
        interestedUsers: updatedUsers,
        lastUpdated: new Date(),
      });

      toast({
        title: "Interest removed",
        description: "You are no longer interested in sharing this listing.",
      });
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="flex h-[180px]">
        {/* Image */}
        <div className="relative w-[240px] flex-shrink-0">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <div className="flex items-baseline gap-1 text-white">
              <span className="text-lg font-bold">{listing.price.currency}{listing.price.amount}</span>
              <span className="text-sm opacity-90">/ {listing.price.period}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col p-4">
          {/* Top Row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-tight line-clamp-1">{listing.title}</h3>
              <div className="flex items-center text-muted-foreground mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <p className="text-sm line-clamp-1">{listing.location}</p>
              </div>
            </div>
            <div className="flex -space-x-2 flex-shrink-0">
              {interestedUsers.slice(0, 3).map((user) => (
                <Avatar key={user.userId} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={user.userProfile.photoURL} />
                  <AvatarFallback>{user.userProfile.displayName[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button 
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => window.open(listing.url, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              View on Airbnb
            </Button>
            <Button
              variant={isUserInterested ? "outline" : "default"}
              size="sm"
              className={
                isUserInterested 
                  ? "h-8 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                  : "h-8 bg-accent hover:bg-accent/90 text-accent-foreground"
              }
              onClick={isUserInterested ? handleRemoveInterest : handleExpressInterest}
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              {isUserInterested ? "Remove Interest" : "Express Interest"}
            </Button>
          </div>
        </div>
      </div>

      {/* Interested Users Modal */}
      <InterestedUsersModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        interestedUsers={interestedUsers}
        isInterested={isUserInterested}
        onExpressInterest={handleExpressInterest}
        onRemoveInterest={handleRemoveInterest}
      />
    </Card>
  );
} 