import { Sidebar } from "@/components/sidebar"

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 