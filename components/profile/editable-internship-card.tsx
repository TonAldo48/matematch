"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, X, Loader2, MapPin } from "lucide-react"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { CompanyLogo } from "@/components/ui/company-logo"
import { techCompanies } from "@/data/companies"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EditableInternshipCardProps {
  userId: string
  company: string
  role: string
  location: string
  internshipDates?: {
    term: string
    year: number
  }
  onUpdate: (newData: any) => void
}

export function EditableInternshipCard({ 
  userId, 
  company, 
  role, 
  location, 
  internshipDates,
  onUpdate 
}: EditableInternshipCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    company,
    role,
    location,
    internshipDates: {
      term: internshipDates?.term || "",
      year: internshipDates?.year || new Date().getFullYear()
    }
  })
  const [availableLocations, setAvailableLocations] = useState<string[]>([])

  useEffect(() => {
    // Update available locations when company changes
    const selectedCompany = techCompanies.find(c => c.name === formData.company)
    setAvailableLocations(selectedCompany?.locations || [])
  }, [formData.company])

  const currentYear = new Date().getFullYear()
  const terms = ['Spring', 'Summer', 'Fall', 'Winter']

  const handleSave = async () => {
    if (!formData.company || !formData.role || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const updateData = {
        companyName: formData.company,
        role: formData.role,
        location: { address: formData.location },
        internshipDates: formData.internshipDates.term && formData.internshipDates.year ? {
          term: formData.internshipDates.term,
          year: parseInt(String(formData.internshipDates.year))
        } : null,
        updatedAt: Timestamp.now()
      }

      await updateDoc(doc(db, "userProfiles", userId), updateData)
      onUpdate(updateData)
      setIsEditing(false)
      toast.success('Internship details updated')
    } catch (error) {
      console.error('Error updating internship details:', error)
      toast.error('Failed to update internship details')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Internship Details</CardTitle>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, company: value, location: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {techCompanies.map(company => (
                      <SelectItem key={company.name} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Your role"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                disabled={!formData.company}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.company ? "Select location" : "Select a company first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Term</Label>
                <Select
                  value={formData.internshipDates.term}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    internshipDates: { ...prev.internshipDates, term: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map(term => (
                      <SelectItem key={term} value={term}>{term}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={formData.internshipDates.year}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    internshipDates: { ...prev.internshipDates, year: parseInt(e.target.value) }
                  }))}
                  min={currentYear}
                  max={currentYear + 2}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CompanyLogo company={company} />
                <div>
                  <h3 className="font-medium">Company</h3>
                  <p>{company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{location}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium">Role</h3>
                <p>{role}</p>
              </div>
              <div>
                <h3 className="font-medium">Dates</h3>
                <p className="text-gray-600">
                  {internshipDates?.term && internshipDates?.year ? 
                    `${internshipDates.term} ${internshipDates.year}` :
                    'Term not specified'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 