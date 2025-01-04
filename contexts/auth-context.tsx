"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  GoogleAuthProvider, 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null
  loading: boolean
  isNewUser: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNewUser, setIsNewUser] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Check if user has completed onboarding
        const hasOnboarded = localStorage.getItem(`onboarded_${user.uid}`)
        setIsNewUser(!hasOnboarded)
        
        Cookies.set('auth', 'true', { expires: 7 })
        
        if (!hasOnboarded) {
          router.push('/onboarding')
        }
      } else {
        Cookies.remove('auth')
        router.push('/signin')
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      setUser(result.user)
      
      // Check if this is user's first sign in
      const hasOnboarded = localStorage.getItem(`onboarded_${result.user.uid}`)
      if (!hasOnboarded) {
        setIsNewUser(true)
        router.push('/onboarding')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      Cookies.remove('auth')
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isNewUser, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 