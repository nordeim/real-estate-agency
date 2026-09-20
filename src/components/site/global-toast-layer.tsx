"use client";

import { usePathname } from "next/navigation";

/**
 * Fidelity artifact — the original app mounts an EMPTY global toast
 * container on every page EXCEPT /login: two nested
 * `div.fixed.top-0.z-[100]…flex-col-reverse.p-4` divs with no content.
 *
 * On mobile (<640px) the container is top-positioned, full-width and
 * 32px tall at z-[100] — it intercepts taps on the top 24px of the
 * hamburger toggle and the top of the logo (the original's mobile menu
 * only opens from the lower part of the button). On desktop (sm+) it
 * repositions to the bottom-right corner where it covers nothing.
 *
 * This is the original's actual DOM and UX (audited live): reproducing
 * it keeps the clone byte- and behavior-identical. The /login page is
 * excluded because the original mounts its real sonner Toaster there
 * instead (and never both — verified route-by-route).
 */
const CONTAINER_CLASSES =
  "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]";

export function GlobalToastLayer() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return (
    <div className={CONTAINER_CLASSES}>
      <div className={CONTAINER_CLASSES} />
    </div>
  );
}
