import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/lib/context/auth-context";
import { MobileNotice } from "@/components/ui/mobile-notice";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MateMatch",
  description: "Find your perfect housing mate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <MobileNotice />
        </AuthProvider>
      </body>
    </html>
  );
}
