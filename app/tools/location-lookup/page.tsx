import { LocationLookup } from "@/components/tools/location-lookup"

export default function LocationLookupPage() {
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Company Location Lookup</h1>
        <LocationLookup />
      </div>
    </div>
  )
} 