import { AirbnbTester } from "@/components/tools/airbnb-tester"

export default function AirbnbTestPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Airbnb API Tester</h1>
        <AirbnbTester />
      </div>
    </div>
  )
} 