"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Properties", path: "/properties" },
  { label: "Sell", path: "/sell" },
  { label: "About", path: "/about" },
];

const MOBILE_CATEGORIES = [
  "Penthouses",
  "Waterfront",
  "Modernist Retreats",
  "Estates",
];

/**
 * Fixed header — transparent over the hero on the home page, solid
 * elsewhere; hides on scroll-down, reveals on scroll-up (as the original).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);
      setHidden(current > lastScrollY && current > 200);
      setLastScrollY(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  const logoPrimary = menuOpen
    ? "text-foreground"
    : isHome
      ? "text-white"
      : "text-foreground";
  const logoSecondary = menuOpen
    ? "text-accent"
    : isHome
      ? "text-[#facca3]"
      : "text-accent";
  const navText = (active: boolean) =>
    active ? "text-accent" : isHome && !menuOpen ? "text-white" : "text-foreground";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          scrolled
            ? isHome
              ? "bg-foreground/60 backdrop-blur-xl"
              : "bg-background/95 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-[4%] md:px-[2%]">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" aria-label="MAISON ESTATE — home" className="relative z-10">
              <span
                className={`font-display text-2xl md:text-3xl font-light tracking-editorial ${logoPrimary}`}
              >
                MAISON
              </span>
              <span
                className={`font-display text-2xl md:text-3xl font-light tracking-editorial ${logoSecondary}`}
              >
                {" ESTATE"}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`font-body text-xs tracking-label uppercase relative group pb-1 ${navText(
                    pathname === link.path
                  )}`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              ))}
              <Link
                href="/properties"
                className={`text-xs px-8 py-3 text-sm font-body tracking-widest uppercase transition-all duration-500 rounded-full border ${
                  isHome
                    ? "border-white bg-white text-black hover:bg-white/80"
                    : "border-foreground bg-foreground text-background hover:bg-foreground/80"
                }`}
              >
                View Listings
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`md:hidden relative z-10 p-2 ${
                menuOpen ? "text-foreground" : isHome ? "text-white" : "text-foreground"
              }`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-start justify-center px-[4%]"
          >
            <nav
              className="flex flex-col items-start gap-6"
              aria-label="Mobile primary"
            >
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Link
                    href={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="font-display text-display-md text-foreground hover:text-[#976620] transition-colors text-left"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/properties"
                  onClick={() => setMenuOpen(false)}
                  className="ghost-btn text-sm mt-6"
                >
                  View Listings
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-col items-start gap-2 text-muted-foreground font-body text-xs tracking-label uppercase"
              >
                {MOBILE_CATEGORIES.map((category) => (
                  <span key={category}>{category}</span>
                ))}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
