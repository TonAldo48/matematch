import { ScrapedListing, InterestedUser } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestedUsersModal } from "./InterestedUsersModal";
import { useState } from "react";
import Image from 'next/image';

interface SharedListingCardProps {
  listing: ScrapedListing;
  interestedUsers: InterestedUser[];
  onExpressInterest: () => void;
  isUserInterested: boolean;
}

export function SharedListingCard({ 
  listing, 
  interestedUsers,
  onExpressInterest,
  isUserInterested
}: SharedListingCardProps) {
  const [showUsersModal, setShowUsersModal] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src={listing.images[0]}
            alt={listing.title}
            width={800}
            height={500}
            className="w-full h-[200px] object-cover rounded-t-lg"
          />
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium">
            {listing.price.currency}{listing.price.amount}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Location */}
          <div className="mb-1.5">
            <h3 className="font-semibold leading-tight line-clamp-1">{listing.title}</h3>
            <div className="flex items-center text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <p className="text-sm line-clamp-1">{listing.location}</p>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1.5">
            <span>{listing.details.bedrooms} {listing.details.bedrooms === 1 ? 'bed' : 'beds'}</span>
            <span>•</span>
            <span>{listing.details.bathrooms} {listing.details.bathrooms === 1 ? 'bath' : 'baths'}</span>
            <span>•</span>
            <span>Up to {listing.details.guests} guests</span>
          </div>

          {/* Interested Users */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex -space-x-2">
              {interestedUsers.slice(0, 3).map((user) => (
                <Avatar key={user.userId} className="w-5 h-5 border-2 border-background">
                  <AvatarImage src={user.userProfile.photoURL} />
                  <AvatarFallback>{user.userProfile.displayName[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-2 text-sm hover:bg-accent"
              onClick={() => setShowUsersModal(true)}
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              {interestedUsers.length} interested in sharing
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="outline"
              className="h-7 text-sm"
              onClick={() => window.open(listing.url, '_blank')}
            >
              View on Airbnb
            </Button>
            <Button 
              size="sm"
              variant={isUserInterested ? "destructive" : "default"}
              className="h-7 text-sm"
              onClick={onExpressInterest}
            >
              {isUserInterested ? "Remove Interest" : "Share Housing"}
            </Button>
          </div>
        </div>
      </div>

      <InterestedUsersModal
        isOpen={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        interestedUsers={interestedUsers}
        isInterested={isUserInterested}
        onExpressInterest={onExpressInterest}
        onRemoveInterest={onExpressInterest}
      />
    </Card>
  );
} 