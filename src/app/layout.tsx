import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MAISON ESTATE — Luxury Real Estate",
    template: "%s | MAISON ESTATE",
  },
  description:
    "Maison Estate is the definitive authority in luxury real estate. Discover curated collections of estates, penthouses, and waterfront residences in San Francisco's most coveted neighborhoods.",
  keywords: [
    "luxury real estate",
    "San Francisco homes",
    "estates",
    "penthouses",
    "waterfront properties",
    "Maison Estate",
  ],
  openGraph: {
    title: "MAISON ESTATE — Luxury Real Estate",
    description:
      "Curated collections of estates, penthouses, and waterfront residences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${inter.variable} antialiased bg-background text-foreground font-body`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
