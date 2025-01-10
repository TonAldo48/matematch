'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, Code2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { PhotoUpload } from '@/components/PhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { geocodeAddress } from '@/lib/utils/geocoding';
import { Button } from '@/components/ui/button';

interface ProfileData {
  fullName: string;
  email: string;
  bio: string;
  company: string;
  location: string;
  verifiedLocation?: {
    raw: string;
    formatted: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  role: string;
  internshipPeriod: string;
  preferences: {
    lookingForHousing: boolean;
    openToRoommates: boolean;
  };
  photoUrl?: string;
}

export default function Profile() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    email: '',
    bio: '',
    company: '',
    location: '',
    role: '',
    internshipPeriod: '',
    preferences: {
      lookingForHousing: false,
      openToRoommates: false
    },
    photoUrl: ''
  });
  const [initialFormData, setInitialFormData] = useState<ProfileData | null>(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    async function fetchProfile(currentUser: User) {
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data() as Partial<ProfileData>;
          const newFormData = {
            fullName: data.fullName || '',
            email: data.email || currentUser.email || '',
            bio: data.bio || '',
            company: data.company || '',
            location: data.location || '',
            verifiedLocation: data.verifiedLocation,
            role: data.role || '',
            internshipPeriod: data.internshipPeriod || '',
            preferences: {
              lookingForHousing: data.preferences?.lookingForHousing || false,
              openToRoommates: data.preferences?.openToRoommates || false
            },
            photoUrl: data.photoUrl || ''
          };
          setFormData(newFormData);
          setInitialFormData(newFormData);
        } else {
          // Initialize with user's email if profile doesn't exist
          const newFormData = {
            ...formData,
            email: currentUser.email || ''
          };
          setFormData(newFormData);
          setInitialFormData(newFormData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile(user);
  }, [user, router]);

  // Check for unsaved changes
  useEffect(() => {
    if (!initialFormData) return;
    
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialFormData]);

  const handleInputChange = (field: keyof ProfileData | 'preferences', value: any) => {
    if (field === 'preferences') {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePhotoUpdate = async (photoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      photoUrl
    }));
  };

  const handleLocationChange = (newLocation: string) => {
    setFormData(prev => ({ ...prev, location: newLocation }));
  };

  const verifyLocation = async () => {
    if (!formData.location.trim()) return;

    setIsVerifyingLocation(true);
    try {
      const result = await geocodeAddress(formData.location);
      if (result) {
        setFormData(prev => ({
          ...prev,
          verifiedLocation: {
            raw: formData.location,
            formatted: result.formattedAddress,
            coordinates: {
              lat: result.lat,
              lng: result.lng
            }
          }
        }));
        toast({
          title: 'Success',
          description: 'Address verified successfully.',
        });
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setFormData(prev => ({
        ...prev,
        verifiedLocation: undefined
      }));
      
      if (error instanceof Error && !error.message.includes('ZERO_RESULTS')) {
        toast({
          title: 'Notice',
          description: 'Could not verify the location coordinates.',
          variant: 'default'
        });
      }
    } finally {
      setIsVerifyingLocation(false);
    }
  };

  const saveChanges = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const profileRef = doc(db, 'profiles', user.uid);
      
      // Create a clean version of formData without undefined values
      const cleanData: Partial<ProfileData & { updatedAt: string }> = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      // Remove verifiedLocation if it's undefined
      if (!cleanData.verifiedLocation) {
        delete cleanData.verifiedLocation;
      }

      // Remove any other undefined values
      (Object.keys(cleanData) as Array<keyof typeof cleanData>).forEach(key => {
        if (cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });

      await setDoc(profileRef, cleanData);

      setInitialFormData(formData);
      setHasUnsavedChanges(false);
      
      toast({
        title: 'Success',
        description: 'Profile saved successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your ColorStack member profile</p>
        </div>
        {hasUnsavedChanges && (
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            You have unsaved changes
          </p>
        )}
      </div>

      <form className="space-y-6">
        {/* Basic Info Section */}
        <div className="rounded-md border">
          <div className="border-b p-4">
            <div className="flex items-center gap-4">
              <PhotoUpload 
                currentPhotoUrl={formData.photoUrl}
                onPhotoSelect={handlePhotoUpdate}
              />
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 max-w-sm">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="mt-1.5 block w-full rounded-md border px-3 py-1.5 text-sm"
                  placeholder="Your name"
                />
              </div>

              <div className="flex-1 max-w-sm">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1.5 block w-full rounded-md border px-3 py-1.5 text-sm"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="mt-1.5 block w-full rounded-md border px-3 py-1.5 text-sm"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Internship Info Section */}
        <div className="rounded-md border">
          <div className="border-b p-4">
            <h2 className="text-base font-medium">Internship Information</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 max-w-[240px]">
                <label className="text-sm font-medium">Company</label>
                <div className="mt-1.5 flex rounded-md border">
                  <span className="flex items-center border-r bg-muted/50 px-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full rounded-r-md px-3 py-1.5 text-sm"
                    placeholder="e.g. Meta, Google"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium">Office Location</label>
                <div className="mt-1.5 flex flex-col gap-2">
                  <div className="flex rounded-md border">
                    <span className="flex items-center border-r bg-muted/50 px-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      className="w-full rounded-r-md px-3 py-1.5 text-sm"
                      placeholder="e.g. Redmond, California"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={verifyLocation}
                      disabled={!formData.location.trim() || isVerifyingLocation}
                    >
                      {isVerifyingLocation ? 'Verifying...' : 'Verify Address'}
                    </Button>
                    {formData.verifiedLocation && (
                      <span className="text-xs text-muted-foreground">
                        ✓ Verified: {formData.verifiedLocation.formatted}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Role</label>
                <div className="mt-1.5 flex rounded-md border">
                  <span className="flex items-center border-r bg-muted/50 px-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full rounded-r-md px-3 py-1.5 text-sm"
                    placeholder="e.g. Software Engineer Intern"
                  />
                </div>
              </div>

              <div className="flex-1 max-w-[200px]">
                <label className="text-sm font-medium">Internship Period</label>
                <div className="mt-1.5 flex rounded-md border">
                  <span className="flex items-center border-r bg-muted/50 px-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <input
                    type="text"
                    value={formData.internshipPeriod}
                    onChange={(e) => handleInputChange('internshipPeriod', e.target.value)}
                    className="w-full rounded-r-md px-3 py-1.5 text-sm"
                    placeholder="e.g. Summer 2024"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Housing Preferences */}
        <div className="rounded-md border">
          <div className="border-b p-4">
            <h2 className="text-base font-medium">Housing Preferences</h2>
          </div>
          <div className="p-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.preferences.lookingForHousing}
                onChange={(e) => handleInputChange('preferences', { lookingForHousing: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">I'm looking for housing</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.preferences.openToRoommates}
                onChange={(e) => handleInputChange('preferences', { openToRoommates: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">I'm open to having roommates</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="button"
            onClick={saveChanges}
            disabled={isSaving || !hasUnsavedChanges}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 