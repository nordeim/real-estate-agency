import { expect, test } from "@playwright/test";

/**
 * Sitemap + robots parity guards — the ORIGINAL app serves a 7-URL sitemap
 * (home at priority 1.0, six public pages at 0.8, weekly) and a minimal
 * robots.txt that references the sitemap absolutely (session 3 audit).
 */

test("robots.txt allows all agents and references the sitemap", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();

  // Next.js normalizes "User-agent" to "User-Agent" — semantically
  // identical to the original's casing for every crawler.
  expect(body).toMatch(/user-agent: \*/i);
  expect(body).toContain("Allow: /");
  expect(body).toMatch(/Sitemap: http:\/\/localhost:\d+\/sitemap\.xml/);

  // The scaffold's bot-specific blocks are gone (original has none).
  expect(body).not.toContain("Googlebot");
  expect(body).not.toContain("Bingbot");
});

test("sitemap.xml lists the original's seven public URLs with priorities", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const body = await response.text();

  const expected: Array<[string, string]> = [
    ["/", "1.0"],
    ["/properties", "0.8"],
    ["/about", "0.8"],
    ["/sell", "0.8"],
    ["/accessibility", "0.8"],
    ["/privacy", "0.8"],
    ["/terms", "0.8"],
  ];

  for (const [path, priority] of expected) {
    expect(body).toMatch(
      new RegExp(`<loc>http://localhost:\\d+${path === "/" ? "/" : path}</loc>`)
    );
    // Next renders the number 1.0 as "1" — accept the original's "1.0" too.
    expect(body).toMatch(
      new RegExp(`<priority>${priority.replace(/\.0$/, "")}(\\.0)?</priority>`)
    );
  }
  expect(body).toContain("<changefreq>weekly</changefreq>");

  // No private/scaffold surfaces leak into the sitemap.
  expect(body).not.toContain("/login");
  expect(body).not.toContain("/property/");
  expect(body).not.toContain("/api");
});

test("the scaffold /api route is gone (404 like the original)", async ({
  request,
}) => {
  const response = await request.get("/api");
  expect(response.status()).toBe(404);
});
