export interface Profile {
  id: string
  name: string
  role: string
  company: string
  location: string
  monthlyBudget: number
  bio: string
  email: string
  phone: string
  school: string
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
  profileImage?: string
  createdAt: Date
  updatedAt: Date
  // Additional fields for matching and filtering
  internshipSeason: 'Summer' | 'Fall' | 'Winter' | 'Spring'
  internshipYear: number
  lookingForRoommates: boolean
  preferredRoommateCount?: number
  moveInDate?: Date
  moveOutDate?: Date
  userId: string // Reference to auth user
}

export type CreateProfileInput = Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>> 