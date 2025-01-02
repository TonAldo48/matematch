import { Sidebar } from "@/components/sidebar"
import { SavedListings } from "@/components/saved/saved-listings"

export default function SavedPage() {
  return (
    <div className="flex h-full">
      <div className="sticky top-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <div className="p-6 bg-gray-50 min-h-full">
          <SavedListings />
        </div>
      </main>
    </div>
  )
} 