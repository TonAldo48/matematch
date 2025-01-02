"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HousingSearch } from "./housing-search"
import { RoommateSearch } from "./roommate-search"
import { MyHousing } from "./my-housing"
import { SavedListings } from "./saved-listings"
import { useRouter, useSearchParams } from "next/navigation"

interface HousingContentProps {
  defaultTab?: string
}

export function HousingContent({ defaultTab = "find-housing" }: HousingContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    // Update URL without losing search params
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`/housing?${params.toString()}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Housing & Roommates</h1>
        <Tabs 
          defaultValue={defaultTab} 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="find-housing">Find Housing</TabsTrigger>
            <TabsTrigger value="find-roommates">Find Roommates</TabsTrigger>
            <TabsTrigger value="saved-listings">Saved</TabsTrigger>
            <TabsTrigger value="my-housing">My Housing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="find-housing">
            <HousingSearch />
          </TabsContent>
          
          <TabsContent value="find-roommates">
            <RoommateSearch />
          </TabsContent>
          
          <TabsContent value="saved-listings">
            <SavedListings />
          </TabsContent>
          
          <TabsContent value="my-housing">
            <MyHousing />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 