import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import SessionProvider from "@/components/session-provider";
import { EnvironmentBanner } from "@/components/environment-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlumberPro - CRM for Plumbing Businesses",
  description: "Professional CRM for small plumbing businesses - manage jobs, customers, and invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EnvironmentBanner />
        <AuthProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
