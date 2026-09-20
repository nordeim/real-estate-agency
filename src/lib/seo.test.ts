import { describe, expect, it } from "vitest";
import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  pageMetadata,
  resolveSiteUrl,
} from "./seo";

/**
 * Expectations derive from the ORIGINAL app's served meta tags (live DOM
 * extraction, session 3 audit) — an independent source of truth, not from
 * the implementation.
 */

const OG_IMAGE_PATH = "/media/brand/og-image.svg";

// Next 16 types openGraph/twitter as unions; read the emitted runtime shape.
interface OgShape {
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  siteName?: string;
  images?: Array<{ url: string; width?: number; height?: number }>;
}

interface TwitterShape {
  card?: string;
  title?: string;
  description?: string;
  images?: string[];
}

function ogOf(meta: Metadata): OgShape {
  return meta.openGraph as unknown as OgShape;
}

function twitterOf(meta: Metadata): TwitterShape {
  return meta.twitter as unknown as TwitterShape;
}

describe("site constants", () => {
  it("uses the original app's description verbatim", () => {
    expect(SITE_DESCRIPTION).toBe(
      "A prestigious real estate platform providing an editorial-style viewing experience for luxury properties and neighborhood insights."
    );
  });

  it("uses the original app's site name", () => {
    expect(SITE_NAME).toBe("Real Estate Agency");
  });
});

describe("resolveSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL when set", () => {
    expect(resolveSiteUrl("https://example.com")).toBe("https://example.com");
  });

  it("falls back to localhost when unset or blank", () => {
    expect(resolveSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(resolveSiteUrl("  ")).toBe("http://localhost:3000");
  });
});

describe("pageMetadata", () => {
  it("emits the page title (rendered as 'X | Real Estate Agency' by the template)", () => {
    const meta = pageMetadata({ title: "About", path: "/about" });
    expect(meta.title).toBe("About");
  });

  it("emits the original app's per-page og:description pattern", () => {
    const meta = pageMetadata({ title: "About", path: "/about" });
    expect(ogOf(meta).description).toBe(
      "About on Real Estate Agency. A prestigious real estate platform providing an editorial-style viewing experience for luxury properties and neighborhood insights."
    );
  });

  it("emits og:title with the template suffix like the original", () => {
    const meta = pageMetadata({ title: "Property Search", path: "/properties" });
    expect(ogOf(meta).title).toBe("Property Search | Real Estate Agency");
  });

  it("emits the brand og:image, og:url, type and site name on every page", () => {
    const meta = pageMetadata({ title: "Sell", path: "/sell" });
    const og = ogOf(meta);
    expect(og.images).toEqual([{ url: OG_IMAGE_PATH, width: 1200, height: 630 }]);
    expect(og.url).toBe("/sell");
    expect(og.type).toBe("website");
    expect(og.siteName).toBe("Real Estate Agency");
  });

  it("emits the full twitter card like the original", () => {
    const meta = pageMetadata({ title: "Privacy", path: "/privacy" });
    const twitter = twitterOf(meta);
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.title).toBe("Privacy | Real Estate Agency");
    expect(twitter.images).toEqual([OG_IMAGE_PATH]);
  });

  it("falls back to the plain site description for the home page", () => {
    const meta = pageMetadata({ path: "/" });
    const og = ogOf(meta);
    expect(og.title).toBe("Real Estate Agency");
    expect(og.description).toBe(SITE_DESCRIPTION);
    expect(meta.description).toBe(SITE_DESCRIPTION);
  });

  it("derives the meta description from the same per-page pattern", () => {
    const meta = pageMetadata({ title: "Terms", path: "/terms" });
    expect(meta.description).toBe(
      "Terms on Real Estate Agency. A prestigious real estate platform providing an editorial-style viewing experience for luxury properties and neighborhood insights."
    );
    expect(twitterOf(meta).description).toBe(meta.description);
  });
});
