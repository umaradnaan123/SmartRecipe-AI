import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ToastContainer from "@/components/Toast";
import { LanguageProvider } from "@/components/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Recipe Generator from Food Images | Smart Recipe Finder",
  description: "Upload a food or ingredient image and instantly generate AI-powered recipes, cooking instructions, nutrition facts, YouTube recipe videos, and Google recipe resources.",
  alternates: {
    canonical: 'http://localhost:3000',
  },
  openGraph: {
    title: "AI Recipe Generator from Food Images | Smart Recipe Finder",
    description: "Upload a food or ingredient image and instantly generate AI-powered recipes, cooking instructions, nutrition facts, YouTube recipe videos, and Google recipe resources.",
    type: 'website',
    url: 'http://localhost:3000',
    siteName: 'GourmetAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Recipe Generator from Food Images | Smart Recipe Finder",
    description: "Upload a food or ingredient image and instantly generate AI-powered recipes, cooking instructions, nutrition facts, YouTube recipe videos, and Google recipe resources.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500 selection:text-white antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
