import { Onboarding } from "@/components/onboarding/onboarding"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { OnboardingFormProvider } from "@/contexts/onboarding-form-context"

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingFormProvider>
        <Onboarding />
      </OnboardingFormProvider>
    </OnboardingProvider>
  )
} 