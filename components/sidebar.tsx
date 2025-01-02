"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/routes"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  return (
    <div className="w-64 border-r h-full bg-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">ColorStack</h1>
      </div>
      
      <nav className="space-y-1 px-2">
        {routes.map((route) => {
          const Icon = route.icon
          
          if (route.items) {
            const isExpanded = expandedMenus.includes(route.label)
            return (
              <div key={route.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between",
                    isExpanded && "bg-gray-100"
                  )}
                  onClick={() => toggleMenu(route.label)}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {route.label}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "transform rotate-180"
                  )} />
                </Button>
                
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {route.items.map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-gray-100",
                            pathname === item.href && "bg-gray-100 text-teal-600"
                          )}
                        >
                          <ItemIcon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100",
                pathname === route.href && "bg-gray-100 text-teal-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {route.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 