"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Monitor } from "lucide-react"

export function MobileNotice() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if device is mobile
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

  // Debug log to check if component is working
  useEffect(() => {
    console.log('Is Mobile:', isMobile, 'Width:', window.innerWidth, 'Height:', window.innerHeight)
  }, [isMobile])

  if (!isMobile) return null

  return (
    <AlertDialog defaultOpen open>
      <AlertDialogContent className="fixed inset-0 max-w-[90%] mx-auto my-auto h-fit">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Better on Desktop
          </AlertDialogTitle>
          <AlertDialogDescription>
            For the best experience, we recommend using this application on a desktop or laptop computer with a larger screen.
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
} 