"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { InternProfile } from "@/data/profiles"

interface UserProfileContextType {
  userProfile: InternProfile | null
  saveProfile: (profile: InternProfile) => void
  clearProfile: () => void
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<InternProfile | null>(null)

  useEffect(() => {
    // Load profile from localStorage on mount
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
  }, [])

  const saveProfile = (profile: InternProfile) => {
    setUserProfile(profile)
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }

  const clearProfile = () => {
    setUserProfile(null)
    localStorage.removeItem('userProfile')
  }

  return (
    <UserProfileContext.Provider value={{ userProfile, saveProfile, clearProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
} 