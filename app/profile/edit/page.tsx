"use client"

import { EditProfileForm } from "@/components/profile/edit-profile-form"

export default function EditProfilePage() {
  // In a real app, fetch this from your API
  const profileData = {
    name: "David Nintang",
    role: "Software Engineering Intern",
    company: "Apple",
    location: "Cupertino, CA",
    monthlyBudget: "2500",
    bio: "SWE Intern at Meta for Summer 2024. I'm a clean, organized person who enjoys both socializing and quiet time. Looking for housing near Menlo Park office. I'm an early riser, enjoy cooking, and like to keep common areas tidy. Hoping to find roommates who are also interns and share similar schedules.",
    email: "dnintang@gsumail.gram.edu",
    phone: "3187506130",
    school: "Your School",
    gender: "Male",
  }

  return <EditProfileForm initialData={profileData} />
} 