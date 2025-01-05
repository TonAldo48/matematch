"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { techCompanies } from "@/data/companies"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, X, Building2, MapPin } from "lucide-react"

interface CompanySelectProps {
  onSelect: (company: string, location: string) => void
  initialCompany?: string
  initialLocation?: string
}

export function CompanySelect({ onSelect, initialCompany, initialLocation }: CompanySelectProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string | null>(initialCompany || null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialLocation || null)
  const [customCompany, setCustomCompany] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [isCustomCompany, setIsCustomCompany] = useState(false)
  const [showCompanyList, setShowCompanyList] = useState(false)

  const filteredCompanies = React.useMemo(() => {
    return (techCompanies || []).filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const selectedCompanyData = techCompanies.find(c => c.name === selectedCompany)
  const locations = selectedCompanyData?.locations || []

  const handleCompanySelect = (companyName: string) => {
    setSelectedCompany(companyName)
    setSelectedLocation(null)
    setShowCompanyList(false)
    setSearchTerm("")
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
    onSelect(selectedCompany!, location)
  }

  const handleCustomCompany = () => {
    if (customCompany && customLocation) {
      onSelect(customCompany, customLocation)
    }
  }

  const clearSelection = () => {
    setSelectedCompany(null)
    setSelectedLocation(null)
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col gap-4">
      {!isCustomCompany ? (
        <div className="space-y-4">
          {selectedCompany ? (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-50 p-2 flex items-center justify-center">
                    <img
                      src={`https://logo.clearbit.com/${selectedCompanyData?.logo}`}
                      alt={selectedCompany}
                      className="w-8 h-8"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/32x32/teal/white?text=" + selectedCompany[0];
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedCompany}</h3>
                    {selectedLocation && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedLocation}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSelection}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Input
                  placeholder="Search for a company..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowCompanyList(true)
                  }}
                  onClick={() => setShowCompanyList(true)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              {showCompanyList && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
                      onClick={() => {
                        setIsCustomCompany(true)
                        setShowCompanyList(false)
                      }}
                    >
                      <Building2 className="h-4 w-4" />
                      Add custom company
                    </button>
                  </div>
                  <div className="divide-y">
                    {filteredCompanies.map((company) => (
                      <button
                        key={company.name}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        onClick={() => handleCompanySelect(company.name)}
                      >
                        <div className="h-8 w-8 rounded-full bg-gray-50 p-1.5 flex items-center justify-center">
                          <img
                            src={`https://logo.clearbit.com/${company.logo}`}
                            alt={company.name}
                            className="w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://placehold.co/32x32/teal/white?text=" + company.name[0];
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.locations[0]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedCompany && !selectedLocation && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Select Office Location</label>
              <div className="grid grid-cols-1 gap-2">
                {locations.map((location) => (
                  <button
                    key={location}
                    className={cn(
                      "flex items-center gap-2 text-left px-4 py-3 border rounded-lg transition-colors",
                      selectedLocation === location
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <MapPin className="h-4 w-4" />
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Enter company name"
            value={customCompany}
            onChange={(e) => setCustomCompany(e.target.value)}
          />
          <Input
            placeholder="Enter company location"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
          />
          <Button 
            className="w-full"
            onClick={handleCustomCompany}
            disabled={!customCompany || !customLocation}
          >
            Add Custom Company
          </Button>
        </div>
      )}
    </div>
  )
} 