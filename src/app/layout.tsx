import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import {
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
} from "@/lib/seo";

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
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "luxury real estate",
    "San Francisco homes",
    "estates",
    "penthouses",
    "waterfront properties",
    "Maison Estate",
  ],
  icons: { icon: { url: "/media/brand/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> (not <body>): the :root tokens in
    // globals.css (--font-display-src / --font-body) reference them, and
    // custom-property substitution must resolve at the html level or the
    // whole cascade collapses to the system sans-serif fallback.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable}`}
    >
      <body className="antialiased bg-background text-foreground font-body">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
