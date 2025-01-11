import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActivityType = 'new_listing' | 'expressed_interest' | 'new_roommate' | 'starred_listing';

export interface ActivityData {
  userId: string;
  userName: string;
  userAvatar: string | null;
  company?: string | null;
  role?: string | null;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string | null;
  listingUrl?: string;
  location?: string;
}

// Helper function to remove undefined values from an object
function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

export async function recordActivity(type: ActivityType, data: ActivityData) {
  try {
    const activitiesRef = collection(db, 'activities');
    const cleanedData = cleanUndefined(data);
    
    await addDoc(activitiesRef, {
      type,
      data: cleanedData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording activity:', error);
  }
} 