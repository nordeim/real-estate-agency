import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-6 text-center py-24">
        <p className="font-display text-display-xl font-light">404</p>
        <h1 className="font-display text-display-sm font-light mt-4">
          Page Not Found
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-4">
          The page you are looking for could not be found.
        </p>
        <Link href="/" className="ghost-btn inline-block mt-8">
          Go Home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
