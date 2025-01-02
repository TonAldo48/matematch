import { Sidebar } from "@/components/sidebar"
import { HomeContent } from "@/components/home-content"

export default function Home() {
  return (
    <div className="flex h-full">
      <div className="sticky top-0 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto h-full">
        <div className="p-6 bg-gray-50 min-h-full">
          <HomeContent />
        </div>
      </main>
    </div>
  )
}
