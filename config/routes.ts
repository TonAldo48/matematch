import { UserCircle, Home, Settings, MapPin, BedDouble, Code, Users, Heart, Bookmark } from "lucide-react"
import { RouteConfig } from "@/types"

export const routes: RouteConfig[] = [
  {
    label: "Profile",
    icon: UserCircle,
    href: "/profile",
  },
  {
    label: "Housing",
    icon: Home,
    items: [
      {
        label: "Find Housing",
        icon: BedDouble,
        href: "/housing?tab=find-housing",
      },
      {
        label: "Find Roommates",
        icon: Users,
        href: "/housing?tab=find-roommates",
      },
      {
        label: "Saved Listings",
        icon: Bookmark,
        href: "/housing?tab=saved-listings",
      },
      {
        label: "My Housing",
        icon: Heart,
        href: "/housing?tab=my-housing",
      }
    ]
  },
  {
    label: "Tools",
    icon: Settings,
    items: [
      {
        label: "Location Lookup",
        icon: MapPin,
        href: "/tools/location-lookup",
      },
      {
        label: "Airbnb Tester",
        icon: BedDouble,
        href: "/tools/airbnb-test",
      },
      {
        label: "Listing Scraper",
        icon: Code,
        href: "/tools/scraper",
      },
      {
        label: "Approximate Location",
        icon: MapPin,
        href: "/tools/approximate",
      }
    ]
  }
] 