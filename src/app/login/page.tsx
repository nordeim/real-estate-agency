"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Sign-in screen — mirrors the original app's login page: split layout,
 * "Continue with Google" (only when configured), credentials form.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleConfigured =
    process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  const onCredentialsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsPending(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    toast("Welcome back", { description: "You are now signed in." });
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Form panel */}
      <div className="flex flex-col justify-center px-[8%] md:px-[12%] py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <Link
            href="/"
            className="font-display text-xl font-light tracking-editorial mb-12 inline-block"
          >
            MAISON <span className="text-accent">ESTATE</span>
          </Link>

          <h1 className="font-display text-display-md font-light">
            Welcome to Real Estate Agency
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2 mb-10">
            Sign in to continue
          </p>

          {googleConfigured ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full h-12 rounded-full font-body text-sm mb-6"
              >
                Continue with Google
              </Button>
              <div className="flex items-center gap-4 mb-6">
                <div className="hairline flex-1" />
                <span className="font-body text-xs text-muted-foreground uppercase tracking-label">
                  or
                </span>
                <div className="hairline flex-1" />
              </div>
            </>
          ) : null}

          <form onSubmit={onCredentialsSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="font-body text-xs tracking-label uppercase text-muted-foreground"
              >
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px] mt-2"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="font-body text-xs tracking-label uppercase text-muted-foreground"
              >
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="bg-transparent border-border/50 font-body text-sm h-12 rounded-[6px] mt-2"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="ghost-btn w-full disabled:opacity-50"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="flex flex-col gap-3 mt-8">
            <Link
              href="/login"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
            <p className="font-body text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                href="/login"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Visual panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="/media/pages/parallax-home.jpg"
          alt="Luxury modern home exterior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-display text-3xl font-light text-white max-w-md leading-snug">
            Curated collections. <span className="italic">Discreet</span>{" "}
            representation.
          </p>
        </div>
      </div>
    </main>
  );
}
