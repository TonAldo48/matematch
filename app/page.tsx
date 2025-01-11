'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, doc, getDoc, orderBy, limit, Timestamp, addDoc, serverTimestamp, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Building2, Star, Users, MapPin, Calendar, ArrowRight, Clock, MessageCircle, ThumbsUp, Share2, BookmarkPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityType, ActivityData } from '@/lib/firebase/activities';
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: Timestamp;
  data: ActivityData;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  timestamp: Timestamp;
  likes: number;
}

interface ActivityLikes {
  [key: string]: string[]; // activityId -> array of userIds who liked it
}

function formatTimestamp(timestamp: Timestamp | null) {
  if (!timestamp) return '';
  try {
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  } catch (error) {
    return '';
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    savedListings: 0,
    interestedListings: 0,
    totalSharedListings: 0,
    potentialRoommates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isPostingComment, setIsPostingComment] = useState<{ [key: string]: boolean }>({});
  const [activityLikes, setActivityLikes] = useState<ActivityLikes>({});
  const [isLiking, setIsLiking] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get saved listings count
        const savedListingsRef = collection(db, 'starredListings', user.uid, 'listings');
        const savedListingsSnap = await getDocs(savedListingsRef);
        const savedCount = savedListingsSnap.size;

        // Get listings user is interested in
        const interestsRef = collection(db, 'listingInterests');
        const interestsSnap = await getDocs(interestsRef);
        let interestedCount = 0;
        interestsSnap.forEach(doc => {
          const data = doc.data();
          if (data.interestedUsers?.some((u: any) => u.userId === user.uid)) {
            interestedCount++;
          }
        });

        // Get total shared listings
        const totalSharedCount = interestsSnap.size;

        // Get potential roommates (unique users interested in same listings)
        const uniqueRoommates = new Set();
        interestsSnap.forEach(doc => {
          const data = doc.data();
          if (data.interestedUsers?.some((u: any) => u.userId === user.uid)) {
            data.interestedUsers.forEach((u: any) => {
              if (u.userId !== user.uid) {
                uniqueRoommates.add(u.userId);
              }
            });
          }
        });

        // Get user profile
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        }

        setStats({
          savedListings: savedCount,
          interestedListings: interestedCount,
          totalSharedListings: totalSharedCount,
          potentialRoommates: uniqueRoommates.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchActivityFeed = async () => {
      if (!user) return;

      try {
        const activitiesRef = collection(db, 'activities');
        const q = query(
          activitiesRef,
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActivityItem[];

        setActivityFeed(activities);
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchStats();
    fetchActivityFeed();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Fetch likes for all activities
    const fetchLikes = async () => {
      const likes: ActivityLikes = {};
      
      for (const activity of activityFeed) {
        const likesRef = collection(db, 'activities', activity.id, 'likes');
        const likesSnap = await getDocs(likesRef);
        likes[activity.id] = likesSnap.docs.map(doc => doc.id); // doc.id is userId
      }
      
      setActivityLikes(likes);
    };

    fetchLikes();
  }, [activityFeed, user]);

  const handlePostComment = async (activityId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
      });
      return;
    }

    const commentText = newComment[activityId]?.trim();
    if (!commentText) return;

    setIsPostingComment(prev => ({ ...prev, [activityId]: true }));

    try {
      const commentsRef = collection(db, 'activities', activityId, 'comments');
      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL,
        text: commentText,
        timestamp: serverTimestamp(),
        likes: 0,
      });

      setNewComment(prev => ({ ...prev, [activityId]: '' }));
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPostingComment(prev => ({ ...prev, [activityId]: false }));
    }
  };

  useEffect(() => {
    if (!expandedActivity) return;

    const commentsRef = collection(db, 'activities', expandedActivity, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      setComments(prev => ({
        ...prev,
        [expandedActivity]: newComments
      }));
    });

    return () => unsubscribe();
  }, [expandedActivity]);

  const handleLikeActivity = async (activityId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like activities",
      });
      return;
    }

    setIsLiking(prev => ({ ...prev, [activityId]: true }));

    try {
      const likeRef = doc(db, 'activities', activityId, 'likes', user.uid);
      const hasLiked = activityLikes[activityId]?.includes(user.uid);

      if (hasLiked) {
        // Unlike
        await deleteDoc(likeRef);
        setActivityLikes(prev => ({
          ...prev,
          [activityId]: prev[activityId]?.filter(id => id !== user.uid) || []
        }));
      } else {
        // Like
        await setDoc(likeRef, {
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          timestamp: serverTimestamp()
        });
        setActivityLikes(prev => ({
          ...prev,
          [activityId]: [...(prev[activityId] || []), user.uid]
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_listing':
        return <Building2 className="h-4 w-4" />;
      case 'expressed_interest':
        return <Star className="h-4 w-4" />;
      case 'new_roommate':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'new_listing':
        return (
          <span>
            New listing available in{' '}
            <span className="font-medium">{activity.data.location}</span>
          </span>
        );
      case 'expressed_interest':
        return (
          <span>
            <span className="font-medium">{activity.data.userName}</span> is interested in{' '}
            <Link href={`/listing/${activity.data.listingId}`} className="font-medium hover:text-primary">
              {activity.data.listingTitle}
            </Link>
          </span>
        );
      case 'new_roommate':
        return (
          <span>
            <span className="font-medium">{activity.data.userName}</span> joined as a potential roommate
          </span>
        );
      default:
        return 'New activity';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome{userProfile?.fullName ? `, ${userProfile.fullName}` : ''}</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your housing search</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/saved" className="block">
          <Card className="p-6 hover:shadow-md transition-all hover:border-primary/20 group">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Star className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="font-medium">Saved Listings</h3>
            </div>
            <p className="text-4xl font-bold mt-4 text-primary font-mono tracking-tight">{stats.savedListings}</p>
            <p className="text-sm text-muted-foreground mt-2 group-hover:text-primary transition-colors">View saved →</p>
          </Card>
        </Link>

        <Link href="/shared-housing" className="block">
          <Card className="p-6 hover:shadow-md transition-all hover:border-primary/20 group">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="font-medium">Interested In</h3>
            </div>
            <p className="text-4xl font-bold mt-4 text-primary font-mono tracking-tight">{stats.interestedListings}</p>
            <p className="text-sm text-muted-foreground mt-2 group-hover:text-primary transition-colors">View interests →</p>
          </Card>
        </Link>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h3 className="font-medium">Potential Roommates</h3>
          </div>
          <p className="text-4xl font-bold mt-4 text-primary font-mono tracking-tight">{stats.potentialRoommates}</p>
          <p className="text-sm text-muted-foreground mt-2">Across all listings</p>
        </Card>

        <Link href="/shared-housing" className="block">
          <Card className="p-6 hover:shadow-md transition-all hover:border-primary/20 group">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="font-medium">Shared Listings</h3>
            </div>
            <p className="text-4xl font-bold mt-4 text-primary font-mono tracking-tight">{stats.totalSharedListings}</p>
            <p className="text-sm text-muted-foreground mt-2 group-hover:text-primary transition-colors">Browse all →</p>
          </Card>
        </Link>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/housing" className="block">
            <Card className="p-6 hover:shadow-md transition-all hover:border-primary/20 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-primary/5">
                  <Building2 className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">Find Housing</h3>
                  <p className="text-sm text-muted-foreground mt-1">Search for available listings in your area</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/shared-housing" className="block">
            <Card className="p-6 hover:shadow-md transition-all hover:border-primary/20 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-primary/5">
                  <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">Find Roommates</h3>
                  <p className="text-sm text-muted-foreground mt-1">Connect with others looking to share housing</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/profile" className="block">
            <Card className="p-6 hover:shadow-md transition-all hover:border-primary/20 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-primary/5">
                  <MapPin className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">Set Office Location</h3>
                  <p className="text-sm text-muted-foreground mt-1">Update your work location for commute times</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
        </div>
        
      {/* Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">See what's happening in the community</p>
          </div>
          <Button variant="outline" size="sm" className="text-muted-foreground hover:text-primary">
            View all activities
          </Button>
        </div>
        
        <Card>
          {activityLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : activityFeed.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="font-medium">No recent activity</p>
              <p className="text-sm mt-1">Activities will appear here when users interact with listings</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={activity.data.userAvatar || undefined} alt={activity.data.userName} />
                      <AvatarFallback className="bg-primary/10">
                        {activity.data.userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate">{activity.data.userName}</span>
                          {activity.data.company && (
                            <>
                              <span className="text-muted-foreground">at</span>
                              <span className="font-medium text-muted-foreground truncate">
                                {activity.data.company}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Activity Message */}
                      <p className="text-sm mt-1">
                        {activity.type === 'new_roommate' && (
                          <span>joined as a potential roommate</span>
                        )}
                        {activity.type === 'expressed_interest' && (
                          <span>
                            is interested in sharing{' '}
                            <Link 
                              href={`/listing/${activity.data.listingId}`} 
                              className="font-medium hover:text-primary"
                            >
                              a listing in {activity.data.location}
                            </Link>
                          </span>
                        )}
                        {activity.type === 'starred_listing' && (
                          <span>
                            saved a listing in{' '}
                            <span className="font-medium">{activity.data.location}</span>
                          </span>
                        )}
                        {activity.type === 'new_listing' && (
                          <span>
                            New listing available in{' '}
                            <span className="font-medium">{activity.data.location}</span>
                          </span>
                        )}
                      </p>

                      {/* Role Tag */}
                      {activity.data.role && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {activity.data.role}
                          </span>
                        </div>
                      )}

                      {/* Listing Image */}
                      {activity.data.listingImage && (activity.type === 'expressed_interest' || activity.type === 'starred_listing') && (
                        <a 
                          href={activity.data.listingUrl || `https://www.airbnb.com/rooms/${activity.data.listingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block relative rounded-lg overflow-hidden hover:opacity-90 transition-opacity group"
                        >
                          <div className="relative aspect-[16/9] max-w-md bg-muted">
                            <img
                              src={activity.data.listingImage}
                              alt={activity.data.listingTitle || 'Listing image'}
                              className="object-cover absolute inset-0 w-full h-full rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">View on Airbnb</span>
                            </div>
                          </div>
                        </a>
                      )}

                      {/* Quick Actions */}
                      <div className="mt-4 flex items-center gap-6">
                        <button 
                          onClick={() => handleLikeActivity(activity.id)}
                          disabled={isLiking[activity.id]}
                          className={`flex items-center gap-2 text-sm transition-colors group ${
                            activityLikes[activity.id]?.includes(user?.uid || '')
                              ? 'text-primary'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          <ThumbsUp 
                            className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                              activityLikes[activity.id]?.includes(user?.uid || '') ? 'fill-current' : ''
                            }`} 
                          />
                          <span>
                            {activityLikes[activity.id]?.length || 0} {activityLikes[activity.id]?.length === 1 ? 'Like' : 'Likes'}
                          </span>
                        </button>
                        <button 
                          onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span>Comment</span>
                          {comments[activity.id]?.length > 0 && (
                            <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">
                              {comments[activity.id].length}
                            </span>
                          )}
                        </button>
                        {(activity.type === 'expressed_interest' || activity.type === 'starred_listing') && (
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group ml-auto">
                            <BookmarkPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>

                      {/* Comments Section */}
                      {expandedActivity === activity.id && (
                        <div className="mt-4">
                          <Separator className="my-4" />
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                              <AvatarFallback className="bg-primary/10">
                                {user?.displayName?.slice(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <Textarea 
                                placeholder="Write a comment..." 
                                className="min-h-[80px] resize-none"
                                value={newComment[activity.id] || ''}
                                onChange={(e) => setNewComment(prev => ({
                                  ...prev,
                                  [activity.id]: e.target.value
                                }))}
                              />
                              <div className="flex justify-end">
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  className="text-xs"
                                  disabled={!newComment[activity.id]?.trim() || isPostingComment[activity.id]}
                                  onClick={() => handlePostComment(activity.id)}
                                >
                                  {isPostingComment[activity.id] ? (
                                    <div className="flex items-center gap-2">
                                      <div className="h-3 w-3 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                      <span>Posting...</span>
                                    </div>
                                  ) : (
                                    'Post Comment'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Comments List */}
                          <div className="mt-4 space-y-4">
                            {comments[activity.id]?.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8 border">
                                  <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName} />
                                  <AvatarFallback className="bg-primary/10">
                                    {comment.userName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-muted rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{comment.userName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatTimestamp(comment.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-sm mt-1">{comment.text}</p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1">
                                    <button className="text-xs text-muted-foreground hover:text-primary">Like</button>
                                    <button className="text-xs text-muted-foreground hover:text-primary">Reply</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
          )}
        </Card>
      </div>
    </div>
  );
}
