import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore'
import { db } from './config'
import { Profile, CreateProfileInput, UpdateProfileInput } from '@/types/profile'

const COLLECTION = 'profiles'

export async function createProfile(userId: string, data: CreateProfileInput) {
  const ref = doc(collection(db, COLLECTION))
  const profile: Omit<Profile, 'id'> = {
    ...data,
    userId,
    createdAt: serverTimestamp() as unknown as Date,
    updatedAt: serverTimestamp() as unknown as Date,
  }
  
  await setDoc(ref, profile)
  return {
    id: ref.id,
    ...profile
  }
}

export async function updateProfile(profileId: string, data: UpdateProfileInput) {
  const ref = doc(db, COLLECTION, profileId)
  const updates = {
    ...data,
    updatedAt: serverTimestamp()
  }
  
  await updateDoc(ref, updates)
  return getProfile(profileId)
}

export async function getProfile(profileId: string) {
  const ref = doc(db, COLLECTION, profileId)
  const snapshot = await getDoc(ref)
  
  if (!snapshot.exists()) {
    return null
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data()
  } as Profile
}

export async function getProfileByUserId(userId: string) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  )
  
  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }
  
  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  } as Profile
}

export async function searchProfiles(filters: {
  company?: string
  location?: string
  internshipSeason?: Profile['internshipSeason']
  internshipYear?: number
  school?: string
}) {
  const constraints: QueryConstraint[] = []
  
  if (filters.company) {
    constraints.push(where('company', '==', filters.company))
  }
  if (filters.location) {
    constraints.push(where('location', '==', filters.location))
  }
  if (filters.internshipSeason) {
    constraints.push(where('internshipSeason', '==', filters.internshipSeason))
  }
  if (filters.internshipYear) {
    constraints.push(where('internshipYear', '==', filters.internshipYear))
  }
  if (filters.school) {
    constraints.push(where('school', '==', filters.school))
  }
  
  const q = query(collection(db, COLLECTION), ...constraints)
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Profile[]
} 