"use client"

import { ProfileForm } from "./profile-form"

export function ProfileContent() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <ProfileForm />
    </div>
  )
} 