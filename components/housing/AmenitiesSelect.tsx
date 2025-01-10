import { Checkbox } from "@/components/ui/checkbox";

interface AmenitiesSelectProps {
  selectedAmenities: string[];
  onAmenityChange: (amenity: string, checked: boolean) => void;
}

const AMENITIES = [
  { id: 'parking', label: 'Parking' },
  { id: 'furnished', label: 'Furnished' },
  { id: 'pets', label: 'Pet Friendly' },
];

export function AmenitiesSelect({ selectedAmenities, onAmenityChange }: AmenitiesSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Amenities</label>
      <div className="space-y-2">
        {AMENITIES.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox 
              id={id} 
              checked={selectedAmenities.includes(id)}
              onCheckedChange={(checked) => onAmenityChange(id, checked === true)}
            />
            <label htmlFor={id}>{label}</label>
          </div>
        ))}
      </div>
    </div>
  );
} 