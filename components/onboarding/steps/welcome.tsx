"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import confetti from 'canvas-confetti'

export function Welcome({ onNext }: { onNext: () => void }) {
  const { user } = useAuth()

  const handleStart = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    onNext()
  }

  return (
    <motion.div 
      className="text-center space-y-6"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold mb-2">
          Welcome to MateMatch, {user?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Let's get your profile set up to find your perfect housing match
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          size="lg"
          className="bg-teal-600 hover:bg-teal-700"
          onClick={handleStart}
        >
          Let's Get Started
        </Button>
      </motion.div>
    </motion.div>
  )
} 