'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/lib/context/auth-context';

interface PhotoUploadProps {
  onPhotoSelect?: (url: string) => void;
  currentPhotoUrl?: string;
}

export function PhotoUpload({ onPhotoSelect, currentPhotoUrl }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string>(currentPhotoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to upload a photo.',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Call the callback with the download URL
      onPhotoSelect?.(downloadUrl);

      toast({
        title: 'Success',
        description: 'Profile photo updated successfully.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32 cursor-pointer" onClick={triggerFileInput}>
        <AvatarImage src={preview} alt="Profile photo" />
        <AvatarFallback>{isUploading ? 'Uploading...' : 'Upload'}</AvatarFallback>
      </Avatar>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <Button 
        onClick={triggerFileInput} 
        variant="outline"
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : (preview ? 'Change Photo' : 'Upload Photo')}
      </Button>
    </div>
  );
} 