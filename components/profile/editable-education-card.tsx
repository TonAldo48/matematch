"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Pencil, X, Loader2, GraduationCap } from "lucide-react"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { schools } from "@/data/profiles"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditableEducationCardProps {
  userId: string
  school?: string
  onUpdate: (newData: any) => void
}

export function EditableEducationCard({ 
  userId, 
  school,
  onUpdate 
}: EditableEducationCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    school: school || "",
    isCustomSchool: !schools.includes(school || "")
  })
  const [customSchool, setCustomSchool] = useState(
    !schools.includes(school || "") ? school || "" : ""
  )

  const handleSchoolChange = (value: string) => {
    if (value === "other") {
      setFormData(prev => ({ ...prev, isCustomSchool: true, school: "" }))
    } else {
      setFormData(prev => ({ ...prev, isCustomSchool: false, school: value }))
    }
  }

  const handleCustomSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomSchool(value)
    setFormData(prev => ({ ...prev, school: value }))
  }

  const handleSave = async () => {
    if (!formData.school) {
      toast.error('Please enter your school')
      return
    }

    setIsSaving(true)
    try {
      const updateData = {
        school: formData.school,
        updatedAt: Timestamp.now()
      }

      await updateDoc(doc(db, "userProfiles", userId), updateData)
      onUpdate(updateData)
      setIsEditing(false)
      toast.success('Education details updated')
    } catch (error) {
      console.error('Error updating education details:', error)
      toast.error('Failed to update education details')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Education</CardTitle>
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
              <Label>School</Label>
              <Select
                value={formData.isCustomSchool ? "other" : formData.school}
                onValueChange={handleSchoolChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(school => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (Add your school)</SelectItem>
                </SelectContent>
              </Select>
              {formData.isCustomSchool && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter your school name"
                    value={customSchool}
                    onChange={handleCustomSchoolChange}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium">School</h3>
              <p>{school || "Not specified"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 