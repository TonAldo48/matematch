import { ApproximateLocation } from "@/components/tools/approximate-location"

export default function ApproximatePage() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Approximate Location Finder</h1>
        <ApproximateLocation />
      </div>
    </div>
  )
} 