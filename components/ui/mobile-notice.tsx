"use client"

import { useEffect, useState } from "react"
import { Monitor, ArrowUpRight } from "lucide-react"

export function MobileNotice() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsMobile(width <= 768 || (width <= 935 && height <= 700))
    }

    // Run on mount
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  if (!isMobile) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] rounded-lg bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-blue-100 p-3">
            <Monitor className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Better on Desktop
          </h2>
          <p className="text-sm text-gray-600">
            For the best experience, we recommend using MateMatch on a desktop or laptop computer.
          </p>
          <div className="flex items-center text-sm text-blue-600">
            <span>Continue anyway</span>
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  )
} 