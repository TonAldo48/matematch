import { InterestedUser } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail } from "lucide-react";

interface InterestedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  interestedUsers: InterestedUser[];
  isInterested: boolean;
  onExpressInterest: () => void;
  onRemoveInterest: () => void;
}

export function InterestedUsersModal({
  isOpen,
  onClose,
  interestedUsers,
  isInterested,
  onExpressInterest,
  onRemoveInterest,
}: InterestedUsersModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Interested Roommates ({interestedUsers.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Button */}
          {!isInterested && (
            <div className="flex justify-center">
              <Button onClick={onExpressInterest} size="lg">
                Express Interest in Sharing
              </Button>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-4">
            {interestedUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.userProfile.photoURL} />
                  <AvatarFallback>{user.userProfile.displayName[0]}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-medium truncate">
                      {user.userProfile.displayName}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => window.location.href = `mailto:${user.userProfile.email}`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>

                  {/* Company and Role */}
                  {user.userProfile.company && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">
                        {user.userProfile.company}
                        {user.userProfile.role && ` • ${user.userProfile.role}`}
                      </Badge>
                      {user.userProfile.internshipTerm && (
                        <Badge variant="outline">
                          {user.userProfile.internshipTerm.season} {user.userProfile.internshipTerm.year}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Message */}
                  {user.message && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {user.message}
                    </p>
                  )}

                  {/* Move-in/Move-out Dates */}
                  {(user.moveInDate || user.moveOutDate) && (
                    <div className="flex gap-3 mt-2">
                      {user.moveInDate && (
                        <Badge variant="outline" className="text-xs">
                          Move in: {new Date(user.moveInDate).toLocaleDateString()}
                        </Badge>
                      )}
                      {user.moveOutDate && (
                        <Badge variant="outline" className="text-xs">
                          Move out: {new Date(user.moveOutDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Remove Interest Button */}
          {isInterested && (
            <div className="flex justify-center">
              <Button
                variant="destructive"
                onClick={onRemoveInterest}
                size="lg"
              >
                Remove My Interest
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 