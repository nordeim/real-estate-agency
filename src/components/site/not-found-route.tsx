"use client";

import { usePathname } from "next/navigation";

/**
 * The original app's 404 copy quotes the missing route in the message
 * ("The page "X" could not be found in this application.") — the route is
 * only knowable client-side, hence this client leaf inside the server
 * not-found page.
 */
export function NotFoundRoute() {
  const pathname = usePathname();
  return (
    <p className="text-slate-600 leading-relaxed">
      The page{" "}
      <span className="font-medium text-slate-700">&quot;{pathname}&quot;</span>{" "}
      could not be found in this application.
    </p>
  );
}
