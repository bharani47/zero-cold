"use client";
import { Check, X, Shield, Smartphone, Search, Calendar, Globe, Code, Gauge } from "lucide-react";
import type { SiteSignalsData, MLScoreData } from "@/types/audit";

interface SiteSignalsPanelProps {
  siteSignals: SiteSignalsData;
  mlScore: MLScoreData;
}

interface BadgeProps { label: string; value: boolean; icon: React.ReactNode }

function Badge({ label, value, icon }: BadgeProps) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm sm:text-base font-medium transition-colors"
      style={
        value
          ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }
          : { background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", color: "var(--text-2)" }
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {value ? (
        <Check className="w-4 h-4 ml-auto text-emerald-400 shrink-0" />
      ) : (
        <X className="w-4 h-4 ml-auto shrink-0 text-red-400/80" />
      )}
    </div>
  );
}

function StatusTag({ tier }: { tier: "High" | "Medium" | "Low" }) {
  const color = tier === "High" ? "#4ade80" : tier === "Medium" ? "#fbbf24" : "var(--text-2)";
  return <span className="text-xs sm:text-sm font-semibold" style={{ color }}>{tier} Priority</span>;
}

export function SiteSignalsPanel({ siteSignals, mlScore }: SiteSignalsPanelProps) {
  const scoreColor =
    mlScore.leadScore >= 65 ? "#22c55e"
    : mlScore.leadScore >= 40 ? "#f59e0b"
    : "var(--text-2)";

  return (
    <div className="glass-lg p-6 anim-fade-up d-100 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>Digital Footprint</h3>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-2)" }}>Real-time DOM &amp; CWV signal extraction</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: scoreColor }}>
              {mlScore.leadScore}
            </span>
            <span className="text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>/100</span>
          </div>
          <StatusTag tier={mlScore.priorityTier} />
        </div>
      </div>

      {/* Signal badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-2">
        <Badge label="HTTPS / SSL"  value={siteSignals.hasHttps}              icon={<Shield className="w-4 h-4" />} />
        <Badge label="Mobile Ready" value={siteSignals.hasViewportMeta}       icon={<Smartphone className="w-4 h-4" />} />
        <Badge label="Meta SEO"     value={!!siteSignals.metaDescription}     icon={<Search className="w-4 h-4" />} />
        <Badge label="Booking CTA"  value={siteSignals.hasBookingOrContactCta} icon={<Calendar className="w-4 h-4" />} />
        <Badge label="Analytics"    value={siteSignals.hasAnalyticsOrPixel}    icon={<Globe className="w-4 h-4" />} />
        <Badge label="JSON-LD Schema" value={siteSignals.hasSchemaMarkup}     icon={<Code className="w-4 h-4" />} />
      </div>

      {/* Core Web Vitals (Google PageSpeed Insights) */}
      {siteSignals.pageSpeed && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(6, 182, 212, 0.06)", border: "1px solid rgba(34, 211, 238, 0.22)" }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400">
              <Gauge className="w-4 h-4" /> Core Web Vitals (Mobile PSI)
            </span>
            <span className="text-xs font-mono text-slate-400">Google API</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-lg p-3 bg-white/3 border border-white/8">
              <p className="text-xs text-slate-300 font-medium">Performance</p>
              <p
                className="text-xl font-black mt-1 tabular-nums"
                style={{
                  color:
                    siteSignals.pageSpeed.mobilePerformanceScore >= 75
                      ? "#4ade80"
                      : siteSignals.pageSpeed.mobilePerformanceScore >= 50
                      ? "#fbbf24"
                      : "#f87171",
                }}
              >
                {siteSignals.pageSpeed.mobilePerformanceScore}/100
              </p>
            </div>
            <div className="rounded-lg p-3 bg-white/3 border border-white/8">
              <p className="text-xs text-slate-300 font-medium">Mobile SEO</p>
              <p
                className="text-xl font-black mt-1 tabular-nums"
                style={{
                  color:
                    siteSignals.pageSpeed.seoScore >= 80
                      ? "#4ade80"
                      : siteSignals.pageSpeed.seoScore >= 60
                      ? "#fbbf24"
                      : "#f87171",
                }}
              >
                {siteSignals.pageSpeed.seoScore}/100
              </p>
            </div>
            <div className="rounded-lg p-3 bg-white/3 border border-white/8">
              <p className="text-xs text-slate-300 font-medium">LCP (Load)</p>
              <p
                className="text-xl font-black mt-1 tabular-nums"
                style={{
                  color:
                    siteSignals.pageSpeed.lcpMs <= 2500
                      ? "#4ade80"
                      : siteSignals.pageSpeed.lcpMs <= 4000
                      ? "#fbbf24"
                      : "#f87171",
                }}
              >
                {(siteSignals.pageSpeed.lcpMs / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      {siteSignals.reachable && (
        <div
          className="rounded-xl px-4 py-3 space-y-1"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)" }}
        >
          {siteSignals.title && (
            <p className="text-sm sm:text-base truncate" style={{ color: "var(--text-1)" }}>
              <span style={{ color: "var(--text-3)" }}>Title · </span>{siteSignals.title}
            </p>
          )}
          <p className="text-xs sm:text-sm font-mono" style={{ color: "var(--text-3)" }}>
            {siteSignals.responseTimeMs ?? 0}ms server response time
          </p>
        </div>
      )}
      {!siteSignals.reachable && (
        <p
          className="text-sm sm:text-base rounded-xl px-4 py-3"
          style={{
            color: "#fbbf24",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.18)",
          }}
        >
          Site unreachable or no website deployed — scoring via business reputation &amp; missing-web signals
        </p>
      )}

      {/* Score factors */}
      <div className="space-y-2.5">
        <p className="section-label">BigQuery ML Top Score Factors</p>
        {mlScore.scoreFactors?.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm flex-1 truncate" style={{ color: "var(--text-2)" }}>{f.label}</span>
            <div className="w-24 h-2 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full bar-grow"
                style={{
                  width: `${Math.min(100, Math.abs(f.contribution) * 25)}%`,
                  background: f.contribution > 0 ? "#22c55e" : "#06b6d4",
                }}
              />
            </div>
            <span
              className="text-xs sm:text-sm font-mono font-semibold tabular-nums w-12 text-right shrink-0"
              style={{ color: f.contribution > 0 ? "#4ade80" : "#22d3ee" }}
            >
              {f.contribution > 0 ? "+" : ""}{f.contribution.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
