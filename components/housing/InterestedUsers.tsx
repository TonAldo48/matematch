import { useState, useEffect } from 'react';
import { useAuth } from "@/lib/context/auth-context";
import { db } from '@/lib/firebase';
import { doc, collection, query, where, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { InterestedUser, UserProfile } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface InterestedUsersProps {
  listingId: string;
  isInterested?: boolean;
}

export function InterestedUsers({ listingId, isInterested }: InterestedUsersProps) {
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [moveOutDate, setMoveOutDate] = useState<Date>();
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!listingId) return;

    const interestsRef = collection(db, 'listingInterests');
    const q = query(interestsRef, where('listingId', '==', listingId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: InterestedUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.interestedUsers) {
          users.push(...data.interestedUsers);
        }
      });
      setInterestedUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [listingId]);

  const handleToggleInterest = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to show interest in sharing.",
        variant: "destructive",
      });
      return;
    }

    if (!isInterested) {
      setShowInterestDialog(true);
    } else {
      try {
        const interestRef = doc(db, 'listingInterests', listingId);
        await deleteDoc(interestRef);
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
    }
  };

  const handleSubmitInterest = async () => {
    if (!user) return;

    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
        email: user.email || '',
      };

      const newInterestedUser: InterestedUser = {
        userId: user.uid,
        joinedAt: new Date(),
        userProfile,
        message,
        moveInDate,
        moveOutDate,
      };

      const interestRef = doc(db, 'listingInterests', listingId);
      await setDoc(interestRef, {
        listingId,
        interestedUsers: [...interestedUsers, newInterestedUser],
        lastUpdated: new Date(),
      });

      setShowInterestDialog(false);
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

  return (
    <div className="mt-4">
      <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
        <DialogTrigger asChild>
          <Button 
            variant={isInterested ? "destructive" : "default"}
            onClick={handleToggleInterest}
          >
            {isInterested ? "Remove Interest" : "Interested in Sharing"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Interest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Input
                id="message"
                placeholder="Share a message with potential roommates..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <Label>Move-in Date (Optional)</Label>
              <Calendar
                mode="single"
                selected={moveInDate}
                onSelect={setMoveInDate}
                className="rounded-md border"
              />
            </div>
            <div>
              <Label>Move-out Date (Optional)</Label>
              <Calendar
                mode="single"
                selected={moveOutDate}
                onSelect={setMoveOutDate}
                className="rounded-md border"
              />
            </div>
            <Button onClick={handleSubmitInterest}>Submit Interest</Button>
          </div>
        </DialogContent>
      </Dialog>

      {interestedUsers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Interested Users ({interestedUsers.length})</h3>
          <div className="space-y-3">
            {interestedUsers.map((interestedUser) => (
              <div key={interestedUser.userId} className="flex items-start space-x-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarImage src={interestedUser.userProfile.photoURL} />
                  <AvatarFallback>{interestedUser.userProfile.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{interestedUser.userProfile.displayName}</h4>
                  {interestedUser.message && (
                    <p className="text-sm text-gray-600 mt-1">{interestedUser.message}</p>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    {interestedUser.moveInDate && (
                      <p>Move in: {format(interestedUser.moveInDate, 'PP')}</p>
                    )}
                    {interestedUser.moveOutDate && (
                      <p>Move out: {format(interestedUser.moveOutDate, 'PP')}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 