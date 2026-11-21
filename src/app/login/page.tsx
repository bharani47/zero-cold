"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import Link from "next/link";

function ZLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center p-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/25"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M5 7h18l-12 14h12" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7l-8 10" stroke="rgba(96,165,250,0.85)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already signed in
  useEffect(() => {
    if (!auth) {
      const t = setTimeout(() => setCheckingAuth(false), 0);
      return () => clearTimeout(t);
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  async function handleGoogleSignIn() {
    if (!auth || !googleProvider) {
      setError("Authentication is not configured. Please add Firebase credentials.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(
        msg.includes("popup-closed")
          ? "Sign-in cancelled."
          : msg.includes("unauthorized-domain")
          ? "This domain is not yet authorized in Firebase. Use guest mode below."
          : "Sign-in failed. You can continue in guest mode below."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="bg-gradient-layer" />

      {/* Back link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: "var(--text-3)" }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>
      </div>

      {/* Auth card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{
          background: "rgba(255,255,255,0.025)",
          backdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <ZLogo size={48} />
          <div className="flex items-baseline gap-1 select-none">
            <span className="text-2xl font-black tracking-tight text-white">ZERO</span>
            <span className="text-2xl font-black tracking-tight text-blue-500">COLD</span>
          </div>
          <p className="text-sm text-center leading-relaxed" style={{ color: "var(--text-3)" }}>
            B2B Outbound Intelligence · Powered by Gemini
          </p>
        </div>

        {/* Divider */}
        <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* Sign in section */}
        <div className="w-full flex flex-col gap-4">
          <p className="text-center text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            Sign in to your workspace
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              background: loading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-1)",
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18 }} />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          {error && (
            <p className="text-xs text-center rounded-lg py-2 px-3" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
              {error}
            </p>
          )}

          <button
            onClick={() => {
              try { window.sessionStorage.setItem("zc_guest", "1"); } catch { /* ignore */ }
              router.push("/dashboard");
            }}
            className="w-full text-center text-xs font-semibold py-2 rounded-lg transition-colors"
            style={{ color: "var(--text-2)", border: "1px dashed rgba(255,255,255,0.1)" }}
          >
            Continue as guest (demo mode) →
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center leading-relaxed" style={{ color: "var(--text-3)" }}>
          By signing in you agree to our terms. Your data is synced securely via Firebase.
        </p>
      </div>

      {/* Bottom badge */}
      <div className="relative z-10 mt-8 flex items-center gap-2 text-xs" style={{ color: "var(--text-3)" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Gemini · BigQuery ML · Firestore · Team Code Ruptors
      </div>
    </div>
  );
}
