import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationControlsProps {
  onNext: () => void
  onBack: () => void
  canProgress: boolean
  showBack?: boolean
}

export function NavigationControls({ 
  onNext, 
  onBack, 
  canProgress,
  showBack = true 
}: NavigationControlsProps) {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      {showBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      ) : <div />}

      <Button
        onClick={onNext}
        disabled={!canProgress}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
      >
        Continue
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 