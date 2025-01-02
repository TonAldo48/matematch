import { Sidebar } from "@/components/sidebar"
import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <div className="flex h-full">
      <div className="sticky top-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <div className="p-6 bg-gray-50 min-h-full">
          <ProfileContent />
        </div>
      </main>
    </div>
  )
} 