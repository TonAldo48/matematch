"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useAuth } from "@/contexts/auth-context"
import confetti from 'canvas-confetti'
import { useEffect } from "react"

export function Completion() {
  const router = useRouter()
  const { setComplete } = useOnboarding()
  const { user } = useAuth()

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`onboarded_${user.uid}`, 'true')
    }
    setComplete(true)
    router.push('/')
  }

  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">🎉 You're All Set!</h1>
        <p className="text-gray-600 text-lg">
          Your profile is ready. Let's start finding your perfect housing match!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          size="lg"
          className="bg-teal-600 hover:bg-teal-700"
          onClick={handleComplete}
        >
          Go to Dashboard
        </Button>
      </motion.div>
    </div>
  )
} 