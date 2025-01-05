"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, X, Loader2 } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

interface EditableHousingCardProps {
  userId: string
  monthlyBudget: string
  moveInDate?: string
  onUpdate: (newData: any) => void
}

export function EditableHousingCard({ userId, monthlyBudget, moveInDate, onUpdate }: EditableHousingCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    monthlyBudget: monthlyBudget.replace('$', ''),
    moveInDate: moveInDate || ''
  })

  const validateAndParseBudget = (budgetString: string) => {
    if (!budgetString?.trim()) return null
    
    try {
      const budgetParts = budgetString.split('-').map(part => {
        const value = parseInt(part.trim())
        if (isNaN(value) || value < 0) throw new Error('Invalid budget value')
        return value
      })
      
      if (budgetParts.length !== 2 || budgetParts[0] >= budgetParts[1]) {
        return false
      }
      
      return {
        min: budgetParts[0],
        max: budgetParts[1]
      }
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    const budget = validateAndParseBudget(formData.monthlyBudget)
    if (!budget) {
      toast.error('Please enter a valid budget range (e.g., 2000 - 3000)')
      return
    }

    setIsSaving(true)
    try {
      const updateData: any = {
        monthlyBudget: budget
      }

      if (formData.moveInDate) {
        updateData.moveInDate = new Date(formData.moveInDate)
      }

      await updateDoc(doc(db, "userProfiles", userId), updateData)
      onUpdate(updateData)
      setIsEditing(false)
      toast.success('Housing preferences updated')
    } catch (error) {
      console.error('Error updating housing preferences:', error)
      toast.error('Failed to update housing preferences')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Housing Preferences</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Monthly Budget</Label>
              <Input
                value={formData.monthlyBudget}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyBudget: e.target.value }))}
                placeholder="e.g., 2000 - 3000"
              />
            </div>
            <div className="space-y-2">
              <Label>Move-in Date</Label>
              <Input
                type="date"
                value={formData.moveInDate ? new Date(formData.moveInDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Monthly Budget</h3>
              <p className="text-gray-600">{monthlyBudget}</p>
            </div>
            {moveInDate && (
              <div>
                <h3 className="font-medium">Move-in Date</h3>
                <p className="text-gray-600">{moveInDate}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 