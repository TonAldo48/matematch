"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Users, Calendar } from "lucide-react"

export function MyHousing() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold mb-1">Summer 2024 Housing</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>May 15 - Aug 15, 2024</span>
            </div>
          </div>
          <Badge>Confirmed</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <h4 className="font-medium mb-2">Housing Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Tech Ave, Mountain View, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>$1,800/month</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Roommates</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">2 ColorStack members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">View Details</Button>
          <Button variant="outline">Message Roommates</Button>
        </div>
      </Card>
    </div>
  )
} 