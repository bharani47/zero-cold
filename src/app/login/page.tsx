"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

function ZLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center p-1 bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/25 shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M5 7h18l-12 14h12" stroke="#031117" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7l-8 10" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const SYSTEM_NODES = [
  { name: "Signal Extractor", detail: "Cheerio DOM + Google PageSpeed API", icon: Globe },
  { name: "BigQuery ML Scorer", detail: "Logistic Regression · 97.69% Acc", icon: Cpu },
  { name: "3-Agent Gemini Chain", detail: "Analyst → Writer → Critic Verification", icon: ShieldCheck },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError("Firebase OAuth is not configured in this environment. Use Instant Demo Workspace below.");
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
          ? "Google sign-in popup was closed. Try again or enter Demo Workspace below."
          : msg.includes("unauthorized-domain")
          ? "Domain pending Firebase OAuth authorization. Click 'Launch Demo Workspace' below to continue immediately."
          : "Google sign-in unavailable. Click 'Launch Demo Workspace' below to continue."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleGuestLaunch() {
    try {
      window.sessionStorage.setItem("zc_guest", "1");
    } catch {
      // ignore storage errors
    }
    router.push("/dashboard");
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <span className="text-sm font-mono text-slate-300">Initializing ZeroCold Workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-5 py-6 sm:px-8 bg-grid-pattern" style={{ background: "var(--bg)" }}>
      <div className="bg-gradient-layer" />

      {/* Top Bar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors hover:text-cyan-300"
            style={{ color: "var(--text-1)", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            ZeroCold Overview
          </Link>
          <a
            href="https://nxt-apex.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors hover:text-cyan-300"
            style={{ color: "var(--text-2)", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}
          >
            Nxt Apex Platform ↗
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-emerald-400 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Nxt Apex × ZeroCold Engine Operational
        </div>
      </header>

      {/* Center Split Grid */}
      <main className="relative z-10 max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column — Architecture & Value Prop */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1 anim-fade-up">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-cyan-300 px-3.5 py-1.5 rounded-full bg-cyan-500/12 border border-cyan-400/25">
              <Sparkles className="w-4 h-4 text-cyan-400" /> ZeroCold Intelligence Workspace
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Audit live digital footprints.{" "}
              <span className="text-cyan-400">Dispatch verified outreach.</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-2)" }}>
              Your workspace starts clean at zero. Every prospect you audit runs through real-time Cheerio DOM scraping, BigQuery ML scoring, and the 3-agent Gemini verification pipeline.
            </p>
          </div>

          {/* Pipeline Telemetry Cards */}
          <div className="space-y-3">
            {SYSTEM_NODES.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.name}
                  className="flex items-center justify-between p-4 rounded-xl card"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(6, 182, 212, 0.12)",
                        border: "1px solid rgba(34, 211, 238, 0.28)",
                      }}
                    >
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-white">{node.name}</div>
                      <div className="text-sm text-slate-300">{node.detail}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Ready
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" /> Per-User Data Isolation
            </span>
            <span>·</span>
            <span>White-Label /audit/[id] Client Reports</span>
            <span>·</span>
            <span>1-Click Mail &amp; WhatsApp Dispatch</span>
          </div>
        </div>

        {/* Right Column — Auth Card */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div
            className="rounded-2xl p-7 sm:p-9 flex flex-col gap-6 anim-fade-up d-100"
            style={{
              background: "rgba(10, 15, 24, 0.85)",
              backdropFilter: "blur(24px) saturate(1.5)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6), 0 0 40px -10px rgba(6, 182, 212, 0.15)",
            }}
          >
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center gap-2.5">
              <ZLogo size={48} />
              <div className="flex items-baseline gap-1 select-none mt-1">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">ZERO</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-cyan-400">COLD</span>
              </div>
              <p className="text-sm sm:text-base" style={{ color: "var(--text-2)" }}>
                Choose how you want to access your outbound workspace
              </p>
            </div>

            <div className="divider" />

            {/* Action Buttons */}
            <div className="space-y-3.5">
              {/* Primary Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer hover:bg-white/12"
                style={{
                  background: loading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "var(--text-1)",
                }}
              >
                {loading ? (
                  <div className="spinner" style={{ width: 18, height: 18 }} />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                <span>{loading ? "Connecting Google…" : "Continue with Google"}</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs font-mono uppercase text-slate-400">or instant access</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Instant Guest Demo Workspace */}
              <button
                onClick={handleGuestLaunch}
                className="btn-primary w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-base font-bold"
              >
                <Zap className="w-5 h-5" />
                <span>Launch Instant Demo Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {error && (
                <div
                  className="text-xs sm:text-sm leading-relaxed rounded-xl p-3.5"
                  style={{
                    color: "#fca5a5",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.22)",
                  }}
                >
                  {error}
                </div>
              )}
            </div>

            <p className="text-xs text-center leading-relaxed" style={{ color: "var(--text-3)" }}>
              Google Sign-In syncs prospects across devices via Cloud Firestore. Instant Demo Workspace persists leads locally in your browser.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto text-center sm:flex items-center justify-between text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>
        <span>
          ZeroCold Outbound Intelligence · An{" "}
          <a
            href="https://nxt-apex.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-semibold"
          >
            Nxt Apex
          </a>{" "}
          Venture
        </span>
        <span className="hidden sm:inline">Where modern web development meets smart AI automation</span>
      </footer>
    </div>
  );
}
