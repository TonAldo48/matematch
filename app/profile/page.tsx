import { Sidebar } from "@/components/sidebar"
import { ProfileView } from "@/components/profile/profile-view"

export default function ProfilePage() {
  // In a real app, this would come from your database
  const profile = {
    name: "David Nintang",
    role: "Software Engineering Intern",
    company: "Apple",
    location: "Cupertino, CA",
    monthlyBudget: 2500,
    bio: "SWE Intern at Meta for Summer 2024. I'm a clean, organized person who enjoys both socializing and quiet time. Looking for housing near Menlo Park office. I'm an early riser, enjoy cooking, and like to keep common areas tidy. Hoping to find roommates who are also interns and share similar schedules.",
    email: "dnintang@gsumail.gram.edu",
    phone: "3187506130"
  }

  return (
    <div className="flex h-full">
      <div className="sticky top-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <div className="bg-gray-50 min-h-full">
          <ProfileView profile={profile} />
        </div>
      </main>
    </div>
  )
} 