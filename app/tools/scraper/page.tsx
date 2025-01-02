import { ScraperTester } from "@/components/tools/scraper-tester"

export default function ScraperPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Airbnb Listing Scraper</h1>
        <ScraperTester />
      </div>
    </div>
  )
} 