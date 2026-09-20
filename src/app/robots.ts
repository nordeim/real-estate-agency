import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * robots.txt mirroring the ORIGINAL app's (session 3 audit): minimal —
 * allow everything for all agents, reference the sitemap absolutely.
 * (The scaffold's bot-specific blocks are deliberately gone.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
