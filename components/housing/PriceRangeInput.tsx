import { DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PriceRange {
  min: number;
  max: number;
}

interface PriceRangeInputProps {
  priceRange: PriceRange;
  onPriceChange: (type: 'min' | 'max', value: string) => void;
  onReset: () => void;
}

export function PriceRangeInput({ priceRange, onPriceChange, onReset }: PriceRangeInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Price Range</label>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onReset}
          className="h-8 text-xs"
        >
          Reset
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="Min"
            value={priceRange.min || ''}
            onChange={(e) => onPriceChange('min', e.target.value)}
            className="pl-8"
            min={0}
          />
        </div>
        <span className="text-muted-foreground">to</span>
        <div className="relative flex-1">
          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max || ''}
            onChange={(e) => onPriceChange('max', e.target.value)}
            className="pl-8"
            min={0}
          />
        </div>
      </div>
    </div>
  );
} 