import Link from "next/link";
import type { Metadata } from "next";
import {
  Globe,
  Cpu,
  SearchCheck,
  PenTool,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  MessagesSquare,
  FileText,
  UserCheck,
  Zap,
  Lock,
  Smartphone,
  Calendar,
  Code,
  Gauge,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ZeroCold by Nxt Apex — B2B Outbound & Footprint Intelligence",
  description:
    "AI-powered B2B outbound intelligence for digital agencies by Nxt Apex. Real-time DOM & Core Web Vitals extraction, BigQuery ML lead scoring, and Critic-verified 3-channel cold outreach.",
};

function ZLogo({ size = 36 }: { size?: number }) {
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

const PIPELINE_STEPS = [
  {
    num: "01",
    title: "Real-Time Signal Extractor",
    engine: "Cheerio DOM + Google PSI API",
    icon: Globe,
    sub: "Fetches live prospect HTML and mobile Lighthouse telemetry in parallel with strict 4.5s timeouts and Cloudflare/WAF edge detection.",
    tags: ["HTTPS & SSL", "Mobile Viewport", "Core Web Vitals (LCP)", "Booking / WhatsApp CTA", "JSON-LD Schema"],
  },
  {
    num: "02",
    title: "BigQuery ML Lead Scorer",
    engine: "Logistic Regression (BQML)",
    icon: Cpu,
    sub: "Evaluates 8 normalized technical and reputation features using weights exported from Google Cloud BigQuery ML (97.69% accuracy).",
    tags: ["0–100 Urgency Score", "High / Medium / Low Tier", "Top 3 Factor Attribution", "ROC-AUC 0.9969"],
  },
  {
    num: "03",
    title: "Gemini Analyst Agent",
    engine: "Gemini Flash · Structured JSON",
    icon: SearchCheck,
    sub: "Cross-examines extracted DOM gaps against local market competitors in the prospect's exact city and niche to isolate high-leverage buying triggers.",
    tags: ["Digital Gap Score", "Evidence-Backed Findings", "City Competitor Benchmark", "Recommended Pitch Angle"],
  },
  {
    num: "04",
    title: "Gemini Writer Agent",
    engine: "Gemini Pro / Flash · Multi-Touch",
    icon: PenTool,
    sub: "Synthesizes a synchronized 3-channel outreach pack in a single deterministic JSON pass—strictly banning generic sales clichés.",
    tags: ["Cold Email (<100w)", "48h Follow-Up (<70w)", "WhatsApp / LinkedIn DM (<45w)", "Zero Buzzwords"],
  },
  {
    num: "05",
    title: "Gemini Critic Agent",
    engine: "Gemini Flash · Groundedness Gate",
    icon: ShieldCheck,
    sub: "Audits every sentence of the Writer's draft against raw extracted DOM signals. Rewrites or strips any claim lacking hard technical evidence.",
    tags: ["Groundedness Score 0–100", "Claim-by-Claim Fact Check", "Auto-Revised Final Copy", "Human Approval Gate"],
  },
];

const FEATURES = [
  {
    icon: Globe,
    badge: "Real-Time Telemetry",
    title: "Verified Footprint Intelligence",
    body: "Every signal—HTTPS, mobile viewport, analytics pixel, booking CTA, schema markup, and Google PageSpeed Core Web Vitals—is scraped live from the target URL.",
  },
  {
    icon: BarChart3,
    badge: "Google Cloud BQML",
    title: "Explainable ML Lead Scoring",
    body: "Trained on Google Cloud BigQuery ML with 97.69% accuracy and 0.9969 ROC-AUC. Surfaces the exact top 3 positive or negative drivers behind every score.",
  },
  {
    icon: ShieldCheck,
    badge: "Hallucination Firewall",
    title: "Critic-Verified Outreach",
    body: "Before any draft reaches your queue, a dedicated Critic agent audits every factual claim against raw DOM signals and auto-revises unsupported statements.",
  },
  {
    icon: MessagesSquare,
    badge: "Omni-Channel Pack",
    title: "3-Channel Synchronized Copy",
    body: "One audit generates an initial cold email (<100 words), a 48-hour competitor nudge (<70 words), and a conversational WhatsApp/LinkedIn opener (<45 words).",
  },
  {
    icon: FileText,
    badge: "Client Deliverable",
    title: "White-Label Public Audit Links",
    body: "Share a live /audit/[id] report link directly in your outreach. Prospects see their digital health gauge, Core Web Vitals, verified gaps, and booking CTA.",
  },
  {
    icon: UserCheck,
    badge: "Enterprise Control",
    title: "Human-in-the-Loop Dispatch",
    body: "Edit copy inline with live word-count guardrails, revert to Critic defaults, approve to Cloud Firestore, and launch directly in Mail or WhatsApp Web.",
  },
];

const BQML_WEIGHTS = [
  { feature: "reviewsNorm", label: "High Review Volume (Established Business)", weight: "+4.53", pct: 98, positive: true },
  { feature: "ratingNorm", label: "Strong Google Rating (3.0★ – 5.0★)", weight: "+3.63", pct: 79, positive: true },
  { feature: "hasWebsite", label: "Missing Website (Highest Urgency Signal)", weight: "-4.61", pct: 100, positive: false },
  { feature: "hasViewportMeta", label: "Missing Mobile Viewport Meta Tag", weight: "-2.68", pct: 58, positive: false },
  { feature: "hasBookingCta", label: "Missing Online Booking / WhatsApp CTA", weight: "-2.66", pct: 57, positive: false },
  { feature: "hasHttps", label: "Insecure HTTP Connection (No SSL)", weight: "-2.42", pct: 52, positive: false },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-grid-pattern" style={{ background: "var(--bg)" }}>
      <div className="bg-gradient-layer" />

      {/* ═══ TOP NAVIGATION ═══ */}
      <header className="sticky top-0 z-50 nav-blur w-full">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3 select-none shrink-0">
              <ZLogo size={38} />
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">ZERO</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-cyan-400 ml-1">COLD</span>
              </div>
            </Link>
            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full hover:border-cyan-400/50 transition-all"
              style={{
                background: "rgba(6, 182, 212, 0.12)",
                border: "1px solid rgba(34, 211, 238, 0.3)",
                color: "#67e8f9",
              }}
            >
              by NXT APEX ↗
            </a>
          </div>

          {/* Center nav links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            <a href="#comparison" className="hover:text-cyan-400 transition-colors">Why ZeroCold</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">5-Agent Pipeline</a>
            <a href="#bigquery-ml" className="hover:text-cyan-400 transition-colors">BigQuery ML</a>
            <a href="#ecosystem" className="hover:text-cyan-400 transition-colors">Nxt Apex Ecosystem</a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors hover:text-cyan-300"
              style={{ color: "var(--text-1)", border: "1px solid var(--border)" }}
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="btn-primary text-sm sm:text-base font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 whitespace-nowrap"
            >
              Launch Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full">
        {/* ═══ HERO SECTION ═══ */}
        <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <div className="text-center max-w-4xl mx-auto anim-fade-up">
            {/* Nxt Apex Venture Badge */}
            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 mb-7 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold max-w-full hover:border-cyan-400/50 transition-all"
              style={{
                background: "rgba(6, 182, 212, 0.12)",
                border: "1px solid rgba(34, 211, 238, 0.32)",
                color: "#67e8f9",
              }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>An Nxt Apex Product · Where Modern Web Engineering Meets Smart AI Automation ↗</span>
            </a>

            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-7"
              style={{ color: "var(--text-1)" }}
            >
              Outbound intelligence built on{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #2dd4bf 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                verified evidence.
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              ZeroCold scrapes live DOM &amp; Core Web Vitals, scores conversion urgency with{" "}
              <span className="text-white font-semibold">BigQuery ML</span>, and runs a{" "}
              <span className="text-white font-semibold">3-agent Gemini pipeline</span> to craft fact-checked cold outreach in under 30 seconds.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/login"
                className="btn-primary text-base sm:text-lg font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 w-full sm:w-auto"
              >
                <Zap className="w-5 h-5" />
                Start Auditing Leads Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-ghost text-base sm:text-lg font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 w-full sm:w-auto"
              >
                <Layers className="w-5 h-5 text-cyan-400" />
                Inspect 5-Agent Pipeline
              </a>
            </div>
          </div>

          {/* ═══ INTERACTIVE ARCHITECTURE PREVIEW WINDOW ═══ */}
          <div
            className="w-full rounded-2xl overflow-hidden anim-fade-up d-150"
            style={{
              background: "rgba(10, 15, 24, 0.88)",
              border: "1px solid rgba(34, 211, 238, 0.22)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.7), 0 0 60px -15px rgba(6, 182, 212, 0.15)",
            }}
          >
            {/* Window Chrome Bar */}
            <div
              className="px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="ml-2 text-xs sm:text-sm font-mono text-slate-300">
                  zerocold://pipeline/5-stage-autonomous-audit
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="badge badge-cyan">BigQuery ML · 97.69% Acc</span>
                <span className="badge badge-green">Critic Verified ✓</span>
              </div>
            </div>

            {/* 3-Column Live Architecture Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10 p-6 sm:p-8 gap-7">
              {/* Col 1: DOM + PageSpeed Extraction */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> 1. Signal Extraction
                  </span>
                  <span className="text-xs font-mono text-slate-400">cheerio + Google PSI</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "HTTPS / SSL", ok: true, icon: Lock },
                    { label: "Mobile Viewport", ok: true, icon: Smartphone },
                    { label: "Booking CTA", ok: false, icon: Calendar },
                    { label: "JSON-LD Schema", ok: false, icon: Code },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
                        style={
                          item.ok
                            ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }
                            : { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5" }
                        }
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
                <div
                  className="rounded-xl p-3.5 flex items-center justify-between"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <Gauge className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">Core Web Vitals (Mobile)</div>
                      <div className="text-xs text-slate-300">LCP 4.2s · Mobile Perf 48/100</div>
                    </div>
                  </div>
                  <span className="badge badge-amber">Friction Detected</span>
                </div>
              </div>

              {/* Col 2: BigQuery ML Scoring */}
              <div className="lg:pl-7 space-y-4 pt-6 lg:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> 2. BigQuery ML Scorer
                  </span>
                  <span className="text-xs font-mono text-slate-400">ROC-AUC 0.9969</span>
                </div>
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(34, 211, 238, 0.25)" }}
                >
                  <div>
                    <div className="text-sm text-slate-300 font-medium">Conversion Urgency Score</div>
                    <div className="text-sm text-emerald-400 font-bold mt-0.5">High Priority Opportunity</div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-emerald-400 tabular-nums">84</span>
                    <span className="text-sm text-slate-400">/100</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Top Explanatory Feature Drivers
                  </div>
                  {[
                    { label: "Review Volume (140+ reviews)", val: "+3.17" },
                    { label: "Missing Online Booking CTA", val: "+2.66" },
                    { label: "Missing LocalBusiness Schema", val: "+1.84" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-200 truncate">{f.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{f.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: 3-Agent Gemini Chain */}
              <div className="lg:pl-7 space-y-4 pt-6 lg:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> 3. Analyst → Writer → Critic
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">Groundedness 96%</span>
                </div>
                <div
                  className="rounded-xl p-4 space-y-2.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Omni-Channel Output</span>
                    <span className="text-cyan-400 font-mono">Email · 48h Follow-Up · DM</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    &ldquo;Noticed your mobile site takes 4.2s to load and lacks a direct WhatsApp or booking CTA—while 140+ Google reviewers actively search for appointments…&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All 3 claims verified against DOM
                    </span>
                    <span className="text-slate-400 font-mono">68 words</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm px-1">
                  <span className="text-slate-300">Public White-Label Audit Link:</span>
                  <span className="font-mono text-cyan-400 font-semibold">/audit/verified-report ↗</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ EXECUTIVE METRICS STRIP ═══ */}
        <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { value: "97.69%", label: "BigQuery ML Accuracy", sub: "Trained logistic regression model" },
              { value: "0.9969", label: "ROC-AUC Validation", sub: "0.077 log-loss · 96.8% precision" },
              { value: "< 30s", label: "End-to-End Pipeline", sub: "Parallel scraper + 3 Gemini agents" },
              { value: "3-in-1", label: "Omni-Channel Outreach", sub: "Cold Email · 48h Follow-Up · DM" },
            ].map((s, idx) => (
              <div
                key={s.label}
                className="kpi-card p-6 sm:p-7 flex flex-col justify-between anim-fade-up"
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <div
                  className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums mb-2"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #67e8f9 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{s.label}</div>
                  <div className="text-xs sm:text-sm text-slate-300 mt-1">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ BEFORE VS AFTER COMPARISON ═══ */}
        <section id="comparison" className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 text-cyan-400">
              THE AGENCY BOTTLENECK
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Why 98% of cold outreach gets ignored
            </h2>
            <p className="text-base sm:text-lg mt-3.5 leading-relaxed" style={{ color: "var(--text-2)" }}>
              Agencies either burn 45 minutes manually auditing a single prospect or blast generic AI templates filled with unverified claims. ZeroCold replaces both.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual / Generic AI Way */}
            <div
              className="rounded-2xl p-7 sm:p-9 space-y-6"
              style={{
                background: "rgba(239, 68, 68, 0.03)",
                border: "1px solid rgba(239, 68, 68, 0.18)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-400">
                  Legacy Manual Outbound
                </span>
                <span className="badge badge-red">45 mins / prospect</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Manual tab-switching &amp; unverified guesswork
              </h3>
              <div className="space-y-4">
                {[
                  "Juggling Google Maps, DevTools, PageSpeed Insights, and spreadsheets by hand",
                  "Generic LLM prompts that hallucinate technical flaws the business doesn't actually have",
                  "No quantitative lead scoring—wasting outreach slots on low-conversion prospects",
                  "Single-channel email blasts with no coordinated follow-up or WhatsApp/LinkedIn touch",
                ].map((pt) => (
                  <div key={pt} className="flex items-start gap-3.5">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-base leading-relaxed text-slate-200">{pt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ZeroCold Autonomous Pipeline */}
            <div
              className="rounded-2xl p-7 sm:p-9 space-y-6"
              style={{
                background: "rgba(6, 182, 212, 0.06)",
                border: "1px solid rgba(34, 211, 238, 0.32)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400">
                  ZeroCold Autonomous Pipeline
                </span>
                <span className="badge badge-cyan">&lt; 30 secs / prospect</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Real DOM telemetry + BigQuery ML + Critic fact-checking
              </h3>
              <div className="space-y-4">
                {[
                  "Automated server-side Cheerio DOM inspection + Google PageSpeed Core Web Vitals",
                  "BigQuery ML logistic regression scores urgency (0–100) with top 3 factor explanations",
                  "Gemini Critic Agent verifies every pitch claim against raw HTML signals before approval",
                  "Instant 3-channel outreach pack + shareable white-label /audit/[id] client report link",
                ].map((pt) => (
                  <div key={pt} className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-base leading-relaxed text-slate-100">{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 5-STEP INTELLIGENCE PIPELINE ═══ */}
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 text-cyan-400">
              SYSTEM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              The 5-Stage Intelligence Chain
            </h2>
            <p className="text-base sm:text-lg mt-3.5 leading-relaxed" style={{ color: "var(--text-2)" }}>
              Every audit executes a deterministic 5-step pipeline combining real-time web scraping, Google Cloud BigQuery ML, and structured multi-agent Gemini reasoning.
            </p>
          </div>

          <div className="space-y-4">
            {PIPELINE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                  <div className="flex items-center gap-4 md:w-80 shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(6, 182, 212, 0.12)",
                        border: "1px solid rgba(34, 211, 238, 0.3)",
                      }}
                    >
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                          STAGE {step.num}
                        </span>
                        <span className="text-xs font-mono text-slate-400">· {step.engine}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-0.5">{step.title}</h3>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
                      {step.sub}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-3 py-1 rounded-lg"
                          style={{
                            background: "rgba(6, 182, 212, 0.08)",
                            border: "1px solid rgba(34, 211, 238, 0.2)",
                            color: "#a5f3fc",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ BIGQUERY ML MODEL TRANSPARENCY ═══ */}
        <section id="bigquery-ml" className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-24">
          <div
            className="rounded-3xl p-7 sm:p-10 lg:p-12"
            style={{
              background: "rgba(10, 15, 24, 0.75)",
              border: "1px solid rgba(34, 211, 238, 0.22)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left explanation */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-semibold px-3.5 py-1.5 rounded-full bg-cyan-500/12 border border-cyan-400/25 text-cyan-300">
                  <Cpu className="w-4 h-4" /> Google Cloud BigQuery ML
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  Trained Logistic Regression Lead Scorer
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
                  Instead of arbitrary heuristic points, ZeroCold uses exported weights from our BigQuery ML model{" "}
                  <code className="text-xs sm:text-sm font-mono text-cyan-300 bg-white/5 px-2 py-0.5 rounded">
                    zerocold_analytics.lead_scorer_bqml
                  </code>
                  . High-reputation businesses with technical footprint gaps score highest for immediate agency conversion.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { k: "Accuracy", v: "97.69%" },
                    { k: "F1 Score", v: "96.34%" },
                    { k: "Log Loss", v: "0.077" },
                  ].map((m) => (
                    <div
                      key={m.k}
                      className="rounded-xl p-3.5 text-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                    >
                      <div className="text-xl sm:text-2xl font-black text-white tabular-nums">{m.v}</div>
                      <div className="text-xs text-slate-300 font-semibold mt-0.5">{m.k}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right feature weights visualization */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-400 pb-2 border-b border-white/10">
                  <span>EXPORTED BQML FEATURE WEIGHTS (intercept = -0.4959)</span>
                  <span>IMPACT ON URGENCY</span>
                </div>
                {BQML_WEIGHTS.map((w) => (
                  <div key={w.feature} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-slate-100">
                        <code className="text-cyan-400 font-mono mr-2">{w.feature}</code>
                        {w.label}
                      </span>
                      <span
                        className="font-mono font-bold tabular-nums"
                        style={{ color: w.positive ? "#4ade80" : "#22d3ee" }}
                      >
                        {w.weight}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-white/6">
                      <div
                        className="h-full rounded-full bar-grow"
                        style={{
                          width: `${w.pct}%`,
                          background: w.positive ? "#22c55e" : "#06b6d4",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 6 CORE CAPABILITIES ═══ */}
        <section id="features" className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 text-cyan-400">
              CAPABILITIES
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Everything required to close local B2B deals
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 sm:p-7 rounded-2xl flex flex-col justify-between gap-4 card">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background: "rgba(6, 182, 212, 0.12)",
                          border: "1px solid rgba(34, 211, 238, 0.25)",
                        }}
                      >
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-xs font-mono font-semibold text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10">
                        {f.badge}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{f.title}</h3>
                    <p className="text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
                      {f.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ NXT APEX × ZEROCOLD REVENUE FLYWHEEL & PLANS ═══ */}
        <section id="ecosystem" className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 text-cyan-400">
              THE NXT APEX ECOSYSTEM
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Two engines. One client-acquisition machine.
            </h2>
            <p className="text-base sm:text-lg mt-3.5 leading-relaxed" style={{ color: "var(--text-2)" }}>
              ZeroCold powers autonomous lead discovery and technical auditing, seamlessly feeding high-intent prospects into{" "}
              <a
                href="https://nxt-apex.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-semibold"
              >
                Nxt Apex
              </a>{" "}
              for full-stack web engineering and AI automation fulfillment—or operating as a standalone SaaS for your own agency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier 1: Freelancer / Indie */}
            <div className="card p-7 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Solo Operator
                  </span>
                  <span className="badge badge-zinc">Self-Serve SaaS</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">Starter</div>
                  <p className="text-sm text-slate-300 mt-1">For solo web/SEO freelancers closing 3–5 clients/month</p>
                </div>
                <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-200">
                  {[
                    "Live Cheerio DOM + Mobile PageSpeed audits",
                    "BigQuery ML 0–100 lead urgency scoring",
                    "3-Channel Critic-verified outreach generation",
                    "Shareable /audit/[id] client report links",
                    "1-Click CSV export & Mail/WhatsApp dispatch",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/login"
                className="btn-ghost w-full py-3 px-4 rounded-xl text-sm sm:text-base font-semibold text-center"
              >
                Start Free Workspace →
              </Link>
            </div>

            {/* Tier 2: Growth Agency */}
            <div
              className="rounded-2xl p-7 sm:p-8 flex flex-col justify-between gap-6"
              style={{
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(34, 211, 238, 0.38)",
                boxShadow: "0 16px 48px -12px rgba(6, 182, 212, 0.18)",
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Agency Growth
                  </span>
                  <span className="badge badge-cyan">Most Popular</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">Pro Agency</div>
                  <p className="text-sm text-slate-200 mt-1">For digital agencies scaling outbound deal flow</p>
                </div>
                <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-100">
                  {[
                    "Everything in Starter + Cloud Firestore team sync",
                    "Custom agency service offer presets & positioning",
                    "White-label client audit reports with booking CTA",
                    "Multi-model Gemini failover & priority throughput",
                    "Bulk CRM CSV exports for Instantly / Smartlead",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/login"
                className="btn-primary w-full py-3 px-4 rounded-xl text-sm sm:text-base font-bold text-center"
              >
                Launch Agency Workspace →
              </Link>
            </div>

            {/* Tier 3: Nxt Apex Done-For-You Engineering */}
            <div className="card p-7 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Nxt Apex Partner
                  </span>
                  <span className="badge badge-green">Done-For-You</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">Nxt Apex Studio</div>
                  <p className="text-sm text-slate-300 mt-1">
                    Full-stack web development &amp; custom AI automation by Nxt Apex
                  </p>
                </div>
                <div className="space-y-3 pt-2 text-sm sm:text-base text-slate-200">
                  {[
                    "End-to-end Next.js web apps & conversion redesigns",
                    "Custom AI agent workflows & WhatsApp automations",
                    "Core Web Vitals, technical SEO & schema engineering",
                    "White-label fulfillment partner for your closed leads",
                    "Direct engineering support from the Nxt Apex team",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="https://nxt-apex.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full py-3 px-4 rounded-xl text-sm sm:text-base font-semibold text-center text-cyan-400 hover:text-cyan-300"
              >
                Visit Nxt Apex Studio ↗
              </a>
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CONVERSION CTA ═══ */}
        <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
          <div
            className="rounded-3xl p-8 sm:p-16 text-center space-y-6"
            style={{
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(10, 15, 24, 0.92) 100%)",
              border: "1px solid rgba(34, 211, 238, 0.32)",
            }}
          >
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-400">
              <Zap className="w-4 h-4" /> Ready for Live Audits
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
              Turn any business URL into a verified pitch in 30 seconds.
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-2)" }}>
              Sign in with Google or launch the instant demo workspace. Start at zero, audit real businesses, and dispatch Critic-approved outreach.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/login"
                className="btn-primary text-base sm:text-lg font-bold px-9 py-4 rounded-xl inline-flex items-center gap-2.5"
              >
                Launch Workspace
                <ArrowRight className="w-5 h-5" />
              </Link>
              <span className="text-sm text-slate-300">
                Google OAuth or 1-Click Guest Demo Mode available
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 w-full" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ZLogo size={30} />
            <div className="flex items-baseline">
              <span className="text-base font-black text-white">ZERO</span>
              <span className="text-base font-black text-cyan-400 ml-0.5">COLD</span>
            </div>
            <span className="text-sm text-slate-400 ml-2">· Outbound Intelligence</span>
          </div>
          <p className="text-xs sm:text-sm text-center sm:text-right" style={{ color: "var(--text-2)" }}>
            ZeroCold Outbound Intelligence · An{" "}
            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-semibold"
            >
              Nxt Apex
            </a>{" "}
            Product · Built with Gemini &amp; Google Cloud BigQuery ML
          </p>
        </div>
      </footer>
    </div>
  );
}
