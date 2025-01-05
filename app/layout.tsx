import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UserProfileProvider } from "@/contexts/user-profile-context"
import { Toaster as SonnerToaster } from "sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MateMatch",
  description: "Find your perfect intern housing match",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "h-screen")}>
        <AuthProvider>
          <OnboardingProvider>
            <UserProfileProvider>
              {children}
            </UserProfileProvider>
          </OnboardingProvider>
        </AuthProvider>
        <SonnerToaster />
      </body>
    </html>
  );
}
