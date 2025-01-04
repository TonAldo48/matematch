"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function PreferencesSelect({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-2">Housing Preferences</h2>
        <p className="text-gray-600">Tell us about your housing needs</p>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="space-y-2">
          <Label>Monthly Budget</Label>
          <Input 
            type="number" 
            placeholder="Enter your monthly budget"
          />
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea 
            placeholder="Tell potential roommates about yourself..."
            className="h-32"
          />
        </div>

        <Button 
          className="w-full bg-teal-600 hover:bg-teal-700"
          onClick={onNext}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
} 