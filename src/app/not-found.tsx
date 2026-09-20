import Link from "next/link";
import { Home } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

/**
 * Not-found page — reproduces the original app's standard 404 layout
 * (the Base44 template's centered slate card) inside the site chrome.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-7xl font-light text-slate-300">404</h1>
                <div className="h-0.5 w-16 bg-slate-200 mx-auto" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-medium text-slate-800">
                  Page Not Found
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  The page you are looking for could not be found in this
                  application.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
