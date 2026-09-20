import type { Metadata } from "next";

/**
 * The SEO/metadata layer, mirroring the ORIGINAL app's served meta tags
 * (live DOM extraction, session 3 audit): a canonical description, full
 * openGraph + twitter cards on every page, the SVG brand favicon, and the
 * per-page og:description pattern "{Page} on Real Estate Agency. …".
 * The original truncates that sentence to "…experien." (a builder bug);
 * we ship the complete word.
 */

export const SITE_NAME = "Real Estate Agency";

export const SITE_DESCRIPTION =
  "A prestigious real estate platform providing an editorial-style viewing experience for luxury properties and neighborhood insights.";

/** The brand mark re-served at OG dimensions by the original app. */
export const OG_IMAGE_PATH = "/media/brand/og-image.svg";

export function resolveSiteUrl(envUrl: string | undefined): string {
  const trimmed = envUrl?.trim();
  if (trimmed) return trimmed.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function siteUrl(): string {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export interface PageMetadataInput {
  /** Page title without the "| Real Estate Agency" suffix. */
  title?: string;
  /** Absolute page path, e.g. "/properties". */
  path: string;
}

/**
 * Per-page Metadata that emits the FULL openGraph/twitter objects —
 * Next.js replaces a segment's objects wholesale, so partial overrides
 * would drop the root fields (same lesson as the scandihaven reference).
 * The description follows the original's per-page pattern
 * "{Page} on Real Estate Agency. {site description}".
 */
export function pageMetadata({ title, path }: PageMetadataInput): Metadata {
  const isHome = path === "/";
  const ogTitle = isHome
    ? SITE_NAME
    : title
      ? `${title} | ${SITE_NAME}`
      : SITE_NAME;
  const ogDescription = isHome
    ? SITE_DESCRIPTION
    : title
      ? `${title} on ${SITE_NAME}. ${SITE_DESCRIPTION}`
      : SITE_DESCRIPTION;

  return {
    ...(title ? { title } : {}),
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      url: path,
      siteName: SITE_NAME,
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [OG_IMAGE_PATH],
    },
    alternates: { canonical: path },
  };
}
