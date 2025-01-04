"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Profile } from '@/types/profile'
import { getProfileByUserId } from '@/lib/firebase/profiles'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: Error | null
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const profile = await getProfileByUserId(user.uid)
      setProfile(profile)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  return (
    <ProfileContext.Provider 
      value={{ 
        profile, 
        loading, 
        error,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
} 