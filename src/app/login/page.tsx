"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  requestPasswordReset,
  resendVerificationCode,
  signUpWithEmailAndPassword,
  verifyEmailWithCode,
} from "@/actions/auth";

/**
 * The original app's auth card — a five-view state machine on /login:
 * sign-in → (forgot password) → reset → check-your-email, and
 * (sign up) → create account → verify your email (6-digit code).
 * Structures and copy reproduce the original's views exactly; the
 * verification actions live in src/actions/auth.ts.
 *
 * The sonner Toaster is mounted HERE (and only here) — on the original
 * the toaster exists solely on the login route, which is why the
 * inquiry form's toast() call is a silent no-op everywhere else.
 */

type View = "signin" | "reset" | "check-email" | "signup" | "verify-email";

/** Alert block used by every view — mirrors the original's styling. */
function AuthAlert({
  tone,
  children,
}: {
  tone: "red" | "green";
  children: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground ${
        tone === "red"
          ? "bg-red-50/70 border-red-200"
          : "bg-green-50/70 border-green-200"
      } rounded-xl`}
    >
      <div
        className={`[&_p]:leading-relaxed ${
          tone === "red" ? "text-red-700" : "text-green-700"
        } text-sm`}
      >
        {children}
      </div>
    </div>
  );
}

function BackToSignIn({
  onClick,
  fullWidth = false,
}: {
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${
        fullWidth ? "w-full justify-center" : ""
      } flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors ${
        fullWidth ? "" : "-mb-2"
      }`}
    >
      <ArrowLeft size={16} aria-hidden />
      Back to sign in
    </button>
  );
}

const slateFieldClasses =
  "flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400";

const slateSubmitClasses =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200";

/** Six auto-advancing OTP boxes, as on the original's verify view. */
function OtpInputs({
  digits,
  onChange,
}: {
  digits: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), 5);
    refs.current[clamped]?.focus();
    refs.current[clamped]?.select();
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next);
    if (digit && index < 5) focusAt(index + 1);
  };

  return (
    <div
      className="flex items-center justify-center gap-1.5"
      role="group"
      aria-label="Verification code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => setDigit(index, event.target.value.replace(/\D/g, ""))}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
              event.preventDefault();
              focusAt(index - 1);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            if (!pasted) return;
            const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
            onChange(next);
            focusAt(Math.min(pasted.length, 5));
          }}
          className="flex rounded-lg border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-center w-10 h-11 text-base font-semibold"
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("signin");

  // Sign-in state.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset / check-email state.
  const [resetEmail, setResetEmail] = useState("");
  const [resetPending, setResetPending] = useState(false);

  // Sign-up state.
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupPending, setSignupPending] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Verify state.
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [verifyPending, setVerifyPending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendPending, setResendPending] = useState(false);

  const googleConfigured =
    process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  const onGoogleClick = () => {
    if (!googleConfigured) {
      toast("Google sign-in is not configured", {
        description:
          "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and NEXT_PUBLIC_GOOGLE_ENABLED to enable it.",
      });
      return;
    }
    signIn("google", { callbackUrl: "/" });
  };

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
      setError("Invalid email or password");
      return;
    }
    toast("Welcome back", { description: "You are now signed in." });
    router.push("/");
    router.refresh();
  };

  const onResetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetPending(true);
    const result = await requestPasswordReset({ email: resetEmail });
    setResetPending(false);
    if (result.ok) {
      setView("check-email");
    }
  };

  const onSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError(null);
    setSignupPending(true);
    const result = await signUpWithEmailAndPassword({
      email: signupEmail,
      password: signupPassword,
      confirmPassword,
    });
    setSignupPending(false);
    if (!result.ok) {
      setSignupError(result.error.message);
      return;
    }
    setDigits(Array(6).fill(""));
    setView("verify-email");
  };

  const onVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerifyError(null);
    setVerifyPending(true);
    const result = await verifyEmailWithCode({
      email: signupEmail,
      code: digits.join(""),
    });
    if (!result.ok) {
      setVerifyPending(false);
      setVerifyError(result.error.message);
      return;
    }
    // Verified — sign straight in with the credentials captured at
    // sign-up (they are still in component state).
    const signInResult = await signIn("credentials", {
      email: signupEmail,
      password: signupPassword,
      redirect: false,
    });
    setVerifyPending(false);
    if (signInResult?.error) {
      setVerifyError("Invalid email or password");
      return;
    }
    toast("Welcome back", { description: "You are now signed in." });
    router.push("/");
    router.refresh();
  };

  const onResendClick = async () => {
    if (resendPending) return;
    setResendPending(true);
    // The original's resend round-trip reads ~300ms; keep the pending
    // label on screen for at least that long either way.
    const [result] = await Promise.all([
      resendVerificationCode({ email: signupEmail }),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]);
    setResendPending(false);
    if (result.ok) {
      setDigits(Array(6).fill(""));
      setVerifyError(null);
    } else {
      setVerifyError(result.error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* The toaster lives on the login route only — matching the
          original, where the inquiry form's toast() call is a no-op
          because no toaster is mounted on any other route. */}
      <Toaster />
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              {view === "signin" && (
                <>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
                    <span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300">
                      <img
                        className="aspect-square h-full w-full object-cover"
                        alt="Real Estate Agency logo"
                        src="/media/brand/favicon.svg"
                      />
                    </span>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Welcome to Real Estate Agency
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base font-medium">
                      Sign in to continue
                    </p>
                  </div>

                  <div className="w-full">
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={onGoogleClick}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
                      >
                        <div className="transition-transform duration-200 -ml-4">
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                          >
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        </div>
                        <span>Continue with Google</span>
                      </button>
                    </div>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="shrink-0 h-[1px] w-full bg-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-slate-500 font-medium tracking-wider">
                          or
                        </span>
                      </div>
                    </div>

                    <form
                      onSubmit={onCredentialsSubmit}
                      className="space-y-4 sm:space-y-5"
                    >
                      <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium text-slate-700"
                          >
                            Email
                          </label>
                          <div className="relative">
                            <Mail
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                              aria-hidden
                            />
                            <input
                              id="email"
                              type="email"
                              autoComplete="email"
                              required
                              value={email}
                              onChange={(event) => setEmail(event.target.value)}
                              placeholder="you@example.com"
                              className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="password"
                            className="text-sm font-medium text-slate-700"
                          >
                            Password
                          </label>
                          <div className="relative">
                            <Lock
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                              aria-hidden
                            />
                            <input
                              id="password"
                              type="password"
                              autoComplete="current-password"
                              required
                              value={password}
                              onChange={(event) =>
                                setPassword(event.target.value)
                              }
                              placeholder="••••••••"
                              className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                        >
                          {isPending ? "Signing in…" : "Sign in"}
                        </button>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                          <button
                            type="button"
                            onClick={() => setView("reset")}
                            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                          >
                            Forgot password?
                          </button>
                          <button
                            type="button"
                            onClick={() => setView("signup")}
                            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            Need an account?{" "}
                            <span className="font-medium text-slate-700">
                              Sign up
                            </span>
                          </button>
                        </div>
                      </div>

                      {error && (
                        <AuthAlert tone="red">{error}</AuthAlert>
                      )}
                    </form>
                  </div>
                </>
              )}

              {view === "reset" && (
                <div className="w-full">
                  <div className="space-y-4 sm:space-y-6">
                    <BackToSignIn onClick={() => setView("signin")} />
                    <div className="text-center space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Reset your password
                      </h2>
                      <p className="text-slate-600 text-sm sm:text-base">
                        Enter your email and we&apos;ll send you a link to
                        reset your password
                      </p>
                    </div>
                    <form
                      onSubmit={onResetSubmit}
                      className="space-y-4 sm:space-y-5"
                    >
                      <div className="space-y-1.5">
                        <label
                          htmlFor="reset-email"
                          className="text-sm font-medium text-slate-700"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            aria-hidden
                          />
                          <input
                            id="reset-email"
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(event) =>
                              setResetEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            className={slateFieldClasses}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={resetPending}
                        className={slateSubmitClasses}
                      >
                        {resetPending ? "Sending…" : "Send reset link"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {view === "check-email" && (
                <div className="w-full">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center space-y-3 sm:space-y-4">
                      <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Mail
                          className="h-7 w-7 sm:h-8 sm:w-8 text-slate-700"
                          aria-hidden
                        />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                          Check your email
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                          We&apos;ve sent password reset instructions to
                          <br />
                          <span className="font-medium text-slate-900">
                            {resetEmail}
                          </span>
                        </p>
                      </div>
                    </div>
                    <AuthAlert tone="green">
                      Please check your email for the password reset link. It
                      may take a few minutes to arrive.
                    </AuthAlert>
                    <BackToSignIn
                      onClick={() => setView("signin")}
                      fullWidth
                    />
                  </div>
                </div>
              )}

              {view === "signup" && (
                <div className="w-full">
                  <div className="space-y-4">
                    <BackToSignIn onClick={() => setView("signin")} />
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Create your account
                    </h2>
                    <form
                      onSubmit={onSignUpSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="signup-email"
                            className="text-sm font-medium text-slate-700"
                          >
                            Email
                          </label>
                          <div className="relative">
                            <Mail
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              aria-hidden
                            />
                            <input
                              id="signup-email"
                              type="email"
                              required
                              value={signupEmail}
                              onChange={(event) =>
                                setSignupEmail(event.target.value)
                              }
                              placeholder="you@example.com"
                              className={`${slateFieldClasses} text-sm sm:text-base`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="signup-password"
                            className="text-sm font-medium text-slate-700"
                          >
                            Password
                          </label>
                          <div className="relative">
                            <Lock
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              aria-hidden
                            />
                            <input
                              id="signup-password"
                              type="password"
                              required
                              value={signupPassword}
                              onChange={(event) =>
                                setSignupPassword(event.target.value)
                              }
                              placeholder="Min. 8 characters"
                              className={`${slateFieldClasses} text-sm sm:text-base`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="signup-confirm"
                            className="text-sm font-medium text-slate-700"
                          >
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock
                              size={16}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              aria-hidden
                            />
                            <input
                              id="signup-confirm"
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(event) =>
                                setConfirmPassword(event.target.value)
                              }
                              placeholder="Re-enter password"
                              className={`${slateFieldClasses} text-sm sm:text-base`}
                            />
                          </div>
                        </div>
                      </div>

                      {signupError && (
                        <AuthAlert tone="red">{signupError}</AuthAlert>
                      )}

                      <button
                        type="submit"
                        disabled={signupPending}
                        className={slateSubmitClasses}
                      >
                        {signupPending ? "Creating account…" : "Create account"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {view === "verify-email" && (
                <div className="w-full">
                  <div className="space-y-4 sm:space-y-6">
                    <BackToSignIn onClick={() => setView("signin")} />
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <ShieldCheck
                          className="h-7 w-7 sm:h-8 sm:w-8 text-slate-700"
                          aria-hidden
                        />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Verify your email
                      </h2>
                      <p className="text-slate-600 text-sm sm:text-base">
                        We&apos;ve sent a 6-digit code to
                        <br />
                        <span className="font-medium text-slate-900">
                          {signupEmail}
                        </span>
                      </p>
                    </div>
                    <form
                      onSubmit={onVerifySubmit}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div>
                        <OtpInputs digits={digits} onChange={setDigits} />
                        <p className="text-xs text-slate-500 text-center mt-3">
                          Enter the verification code sent to your email
                        </p>
                      </div>

                      {verifyError && (
                        <AuthAlert tone="red">{verifyError}</AuthAlert>
                      )}

                      <div className="space-y-3">
                        <button
                          type="submit"
                          disabled={verifyPending}
                          className={slateSubmitClasses}
                        >
                          {verifyPending ? "Verifying…" : "Verify email"}
                        </button>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">
                            Didn&apos;t receive the code?{" "}
                            <button
                              type="button"
                              onClick={onResendClick}
                              disabled={resendPending}
                              className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50 transition-colors"
                            >
                              {resendPending ? "Sending..." : "Resend"}
                            </button>
                          </p>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
          <p>&nbsp;</p>
        </div>
      </div>
    </main>
  );
}
