import { InterestedUser } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, X, ChevronDown, ChevronUp, Briefcase, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);

  const handleExpressInterest = async () => {
    setIsProcessing(true);
    onExpressInterest();
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleOpenChange = (open: boolean) => {
    if (!isProcessing) {
      onClose();
    }
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5" />
            Interested Interns ({interestedUsers.length})
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Empty State */}
          {interestedUsers.length === 0 && !isInterested && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">
                Be the first to express interest in sharing this listing!
              </p>
              <Button 
                onClick={handleExpressInterest} 
                size="lg" 
                disabled={isProcessing}
                className="min-w-[200px] bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isProcessing ? "Processing..." : "Express Interest"}
              </Button>
            </div>
          )}

          {/* Users List */}
          {interestedUsers.length > 0 && (
            <>
              {/* Express Interest Button when not interested */}
              {!isInterested && (
                <div className="flex justify-center pb-4 border-b">
                  <Button 
                    onClick={handleExpressInterest} 
                    size="lg" 
                    disabled={isProcessing}
                    className="min-w-[200px] bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isProcessing ? "Processing..." : "Express Interest"}
                  </Button>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {interestedUsers.map((user) => (
                  <Collapsible
                    key={user.userId}
                    open={expandedUsers.includes(user.userId)}
                    onOpenChange={() => toggleUserExpanded(user.userId)}
                  >
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.userProfile.photoURL} />
                        <AvatarFallback>{user.userProfile.displayName[0]}</AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">
                                {user.userProfile.displayName}
                              </h4>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 px-1">
                                  {expandedUsers.includes(user.userId) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            {/* Company and Role - Always visible */}
                            {user.userProfile.company && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600 hover:bg-gray-200">
                                  {user.userProfile.company}
                                  {user.userProfile.role && ` • ${user.userProfile.role}`}
                                </Badge>
                                {user.userProfile.internshipTerm && (
                                  <Badge variant="outline" className="font-normal border-gray-200">
                                    {user.userProfile.internshipTerm.season} {user.userProfile.internshipTerm.year}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-8 border-gray-200"
                            onClick={() => window.location.href = `mailto:${user.userProfile.email}`}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                        </div>

                        <CollapsibleContent className="mt-4 space-y-4">
                          {/* Detailed Profile Section */}
                          <div className="space-y-3 border-t pt-3">
                            {/* Email */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span>{user.userProfile.email}</span>
                            </div>

                            {/* Internship Details */}
                            {user.userProfile.internshipTerm && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Briefcase className="w-4 h-4" />
                                <span>
                                  {user.userProfile.internshipTerm.season} {user.userProfile.internshipTerm.year} Intern
                                  {user.userProfile.company && ` at ${user.userProfile.company}`}
                                </span>
                              </div>
                            )}

                            {/* Move-in/Move-out Dates */}
                            {(user.moveInDate || user.moveOutDate) && (
                              <div className="space-y-2">
                                {user.moveInDate && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Move in: {new Date(user.moveInDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {user.moveOutDate && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>Move out: {new Date(user.moveOutDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message */}
                            {user.message && (
                              <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                {user.message}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="border-t pt-4 flex-row justify-end">
          {isInterested && (
            <Button
              variant="outline"
              onClick={onRemoveInterest}
              size="lg"
              disabled={isProcessing}
              className="w-full sm:w-auto border-gray-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              Remove Interest
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 