import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UserProfileProvider } from "@/contexts/user-profile-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ColorStack",
  description: "ColorStack Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "h-screen")}>
        <UserProfileProvider>
          {children}
        </UserProfileProvider>
        <Toaster />
      </body>
    </html>
  );
}
