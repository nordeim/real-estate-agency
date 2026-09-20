import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * Sitemap mirroring the ORIGINAL app's served sitemap.xml (session 3
 * audit): the seven public pages — home at priority 1.0, the rest at 0.8,
 * all weekly. Login, property details, and API surfaces are excluded,
 * exactly like the original.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();
  const paths: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1.0 },
    { path: "/properties", priority: 0.8 },
    { path: "/about", priority: 0.8 },
    { path: "/sell", priority: 0.8 },
    { path: "/accessibility", priority: 0.8 },
    { path: "/privacy", priority: 0.8 },
    { path: "/terms", priority: 0.8 },
  ];

  return paths.map(({ path, priority }) => ({
    url: `${origin}${path === "/" ? "/" : path}`,
    changeFrequency: "weekly",
    priority,
  }));
}
