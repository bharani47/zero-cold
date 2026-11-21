import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZeroCold — Stop Guessing. Start Converting.",
  description: "AI-powered B2B outbound intelligence for digital agencies. Verified digital footprint signals, BigQuery ML lead scoring, and Critic-audited cold outreach in under 30 seconds.",
};

function ZLogo({ size = 36 }: { size?: number }) {
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

const STEPS = [
  {
    emoji: "🔍",
    num: "01",
    title: "Signal Extractor",
    sub: "Server-side cheerio + PageSpeed Insights scan every public digital signal in real time.",
    tags: ["HTTPS audit", "Mobile viewport", "Core Web Vitals", "Booking CTA", "Schema markup"],
  },
  {
    emoji: "🧠",
    num: "02",
    title: "BigQuery ML Scorer",
    sub: "Logistic regression model (97.69% accuracy, AUC 0.9969) scores conversion probability.",
    tags: ["97.69% Accuracy", "AUC 0.9969", "Lead Priority Tier", "Top 3 factors"],
  },
  {
    emoji: "🤖",
    num: "03",
    title: "Analyst Agent",
    sub: "Gemini Flash evaluates digital gaps against dynamic local market competitors.",
    tags: ["Digital Gap Score", "Competitor benchmark", "Recommended angle"],
  },
  {
    emoji: "✍️",
    num: "04",
    title: "Writer Agent",
    sub: "Gemini Pro drafts 3-channel outreach in one shot. No sales clichés. Under 100 words.",
    tags: ["Cold Email", "48h Follow-Up", "WhatsApp DM"],
  },
  {
    emoji: "🧪",
    num: "05",
    title: "Critic Agent",
    sub: "Every factual claim is verified against raw DOM signals. Unverifiable claims are rewritten or removed.",
    tags: ["Groundedness 0–100", "Fact-check each claim", "Revised final copy"],
  },
];

const FEATURES = [
  {
    icon: "🛰️",
    title: "Verified Footprint Intelligence",
    body: "We don't guess. Every signal — HTTPS, mobile viewport, analytics pixel, booking CTA, schema markup, Core Web Vitals — is scraped in real time from the prospect's live site. Zero hallucinations.",
  },
  {
    icon: "📊",
    title: "BigQuery ML Lead Scoring",
    body: "A logistic regression model trained on real conversion data scores 0–100 and assigns Priority Tier with top contributing factors. 97.69% accuracy, 0.9969 AUC, 0.077 log-loss.",
  },
  {
    icon: "✅",
    title: "Critic-Verified Outreach",
    body: "Every word of your cold email is audited by a Gemini Critic agent before it reaches your approve queue. Ground truth: extracted DOM signals. Result: 100% factually defensible pitches.",
  },
  {
    icon: "📨",
    title: "3-Channel Outreach Pack",
    body: "One audit generates a full outreach kit: cold email (< 100 words), 48-hour competitor follow-up (< 70 words), and a WhatsApp/LinkedIn DM (< 45 words). Ready to send, human-approved.",
  },
  {
    icon: "🔗",
    title: "Shareable Audit Reports",
    body: "Generate a white-label client report link in one click. Share it in your outreach email. Prospect sees their own digital health score, verified gaps, Core Web Vitals, and your CTA.",
  },
  {
    icon: "⚡",
    title: "Human-in-the-Loop Gate",
    body: "Nothing goes out without you. Edit, revert, or reject any draft. Approve with one click. Full Firestore sync keeps your team aligned in real time across all prospects.",
  },
];

const STATS = [
  { value: "97.69%", label: "ML Model Accuracy" },
  { value: "0.9969", label: "ROC-AUC Score" },
  { value: "< 30s", label: "Full Pipeline Runtime" },
  { value: "3", label: "Outreach Channels per Audit" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <div className="bg-gradient-layer" />

      {/* ═══ NAV ═══ */}
      <header className="sticky top-0 z-50 nav-blur">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 select-none shrink-0">
            <ZLogo size={34} />
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">ZERO</span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-blue-500 ml-1">COLD</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ color: "var(--text-2)", border: "1px solid transparent" }}
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="btn-primary text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl whitespace-nowrap"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">

        {/* ═══ HERO ═══ */}
        <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 xl:pt-24 pb-14 sm:pb-16 xl:pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center justify-center gap-2 mb-8 px-3 py-1.5 rounded-2xl sm:rounded-full text-[11px] sm:text-xs font-semibold max-w-full text-center leading-snug"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", color: "#60a5fa" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Startup Buildathon India 2026 · Team Code Ruptors · Google DeepMind × Google Cloud
          </div>

          <h1 className="text-[2.5rem] sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] mb-6 break-words"
            style={{ color: "var(--text-1)" }}>
            Stop guessing.<br />
            <span style={{
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #2563eb 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Start converting.
            </span>
          </h1>

          <p className="text-base sm:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-2)" }}>
            AI-powered outbound intelligence for digital agencies. Verified signals, ML-scored leads, and Critic-audited cold pitches — in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 xl:mb-16">
            <Link
              href="/login"
              className="btn-primary text-base font-bold px-8 py-4 rounded-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start auditing leads
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="text-base font-semibold px-8 py-4 rounded-2xl transition-all w-full sm:w-auto justify-center flex items-center gap-2"
              style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
            >
              See how it works
            </a>
          </div>

          {/* Pipeline badge cluster */}
          <div
            className="inline-flex flex-wrap items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4 rounded-2xl max-w-full"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {["Cheerio Scraper", "BigQuery ML", "Gemini Flash Analyst", "Gemini Writer", "Critic Agent", "Cloud Firestore"].map((t) => (
              <span
                key={t}
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", color: "#93c5fd" }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ═══ STATS STRIP ═══ */}
        <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STATS.map((s) => (
              <div
                key={s.value}
                className="text-center p-4 sm:p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
                  style={{
                    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                  {s.value}
                </div>
                <div className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-3)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ PROBLEM ═══ */}
        <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div
            className="rounded-3xl p-6 sm:p-14"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="max-w-2xl">
              <div className="text-xs font-bold tracking-widest mb-4" style={{ color: "#2563eb" }}>THE PROBLEM</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-6" style={{ color: "var(--text-1)" }}>
                98% of cold emails get ignored.<br />
                <span style={{ color: "var(--text-3)" }}>Here&apos;s why agencies waste hours per lead.</span>
              </h2>
              <div className="space-y-4">
                {[
                  "45 minutes of manual research per prospect — Google Maps, Lighthouse, SEMrush",
                  "Generic copy that sounds like every other agency's pitch",
                  "No way to verify if your gap claims are even true before sending",
                  "One-size-fits-all email when prospects need email, WhatsApp, and LinkedIn",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                      <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#2563eb" }}>HOW IT WORKS</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-1)" }}>
              5-step intelligence pipeline
            </h2>
            <p className="text-base sm:text-lg mt-3 max-w-xl mx-auto" style={{ color: "var(--text-3)" }}>
              Every audit runs the full chain in parallel — from raw DOM to ready-to-send pitch — in under 30 seconds.
            </p>
          </div>

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="flex flex-col md:flex-row gap-4 md:gap-5 p-5 sm:p-6 lg:p-8 rounded-2xl transition-all"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-start gap-4 md:w-56 lg:w-64 shrink-0">
                  <div className="text-2xl">{step.emoji}</div>
                  <div>
                    <div className="text-[10px] font-black tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
                      STEP {step.num}
                    </div>
                    <div className="text-base font-black" style={{ color: "var(--text-1)" }}>{step.title}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-2)" }}>{step.sub}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", color: "#93c5fd" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex items-center pl-2">
                    <svg className="w-4 h-4" style={{ color: "var(--text-3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest mb-3" style={{ color: "#2563eb" }}>DIFFERENTIATORS</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: "var(--text-1)" }}>
              Built different. By design.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl flex flex-col gap-3 card"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="text-base font-black" style={{ color: "var(--text-1)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CTA SECTION ═══ */}
        <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div
            className="rounded-3xl p-6 sm:p-20 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <div className="text-xs font-bold tracking-widest mb-4" style={{ color: "#60a5fa" }}>GET STARTED FREE</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: "var(--text-1)" }}>
              Start auditing leads in 30 seconds →
            </h2>
            <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--text-3)" }}>
              Sign in with Google. Add a prospect. Watch the 5-agent pipeline turn a URL into a ready-to-send pitch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="btn-primary text-base font-bold px-10 py-4 rounded-2xl"
              >
                Start for free
              </Link>
              <div className="text-sm" style={{ color: "var(--text-3)" }}>
                No credit card · Google Sign-In only
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ZLogo size={28} />
            <div className="flex items-baseline">
              <span className="text-sm font-black text-white">ZERO</span>
              <span className="text-sm font-black text-blue-500 ml-0.5">COLD</span>
            </div>
          </div>
          <p className="text-xs text-center sm:text-right" style={{ color: "var(--text-3)" }}>
            Gemini · BigQuery ML · Cloud Firestore · PageSpeed Insights · Team Code Ruptors · Startup Buildathon India 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
