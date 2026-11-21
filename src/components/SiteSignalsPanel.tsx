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
      className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors"
      style={value
        ? { background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.14)", color: "#86efac" }
        : { background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--text-3)" }
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {value
        ? <Check className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />
        : <X className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: "var(--text-3)" }} />}
    </div>
  );
}

function StatusTag({ tier }: { tier: "High" | "Medium" | "Low" }) {
  const color = tier === "High" ? "#4ade80" : tier === "Medium" ? "#fbbf24" : "var(--text-2)";
  return <span className="text-xs font-semibold" style={{ color }}>{tier} Priority</span>;
}

export function SiteSignalsPanel({ siteSignals, mlScore }: SiteSignalsPanelProps) {
  const scoreColor =
    mlScore.leadScore >= 65 ? "#22c55e"
    : mlScore.leadScore >= 40 ? "#f59e0b"
    : "var(--text-2)";

  return (
    <div className="glass-lg p-5 anim-fade-up d-100 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Digital Footprint</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Real-time signal extraction</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-3xl font-black tabular-nums" style={{ color: scoreColor }}>
              {mlScore.leadScore}
            </span>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>/100</span>
          </div>
          <StatusTag tier={mlScore.priorityTier} />
        </div>
      </div>

      {/* Signal badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        <Badge label="HTTPS"        value={siteSignals.hasHttps}              icon={<Shield className="w-3.5 h-3.5" />} />
        <Badge label="Mobile Ready" value={siteSignals.hasViewportMeta}       icon={<Smartphone className="w-3.5 h-3.5" />} />
        <Badge label="Meta SEO"     value={!!siteSignals.metaDescription}      icon={<Search className="w-3.5 h-3.5" />} />
        <Badge label="Booking CTA"  value={siteSignals.hasBookingOrContactCta} icon={<Calendar className="w-3.5 h-3.5" />} />
        <Badge label="Analytics"    value={siteSignals.hasAnalyticsOrPixel}    icon={<Globe className="w-3.5 h-3.5" />} />
        <Badge label="Schema"       value={siteSignals.hasSchemaMarkup}        icon={<Code className="w-3.5 h-3.5" />} />
      </div>

      {/* Core Web Vitals (Google PageSpeed Insights) */}
      {siteSignals.pageSpeed && (
        <div
          className="rounded-xl p-3.5 space-y-2.5"
          style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)" }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "#60a5fa" }}>
              <Gauge className="w-3.5 h-3.5" /> Core Web Vitals (Mobile PSI)
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Google API</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg p-2.5 bg-white/2 border border-white/5">
              <p className="text-[11px] text-zinc-400 font-medium">Performance</p>
              <p
                className="text-lg font-black mt-0.5 tabular-nums"
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
            <div className="rounded-lg p-2.5 bg-white/2 border border-white/5">
              <p className="text-[11px] text-zinc-400 font-medium">Mobile SEO</p>
              <p
                className="text-lg font-black mt-0.5 tabular-nums"
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
            <div className="rounded-lg p-2.5 bg-white/2 border border-white/5">
              <p className="text-[11px] text-zinc-400 font-medium">LCP (Load)</p>
              <p
                className="text-lg font-black mt-0.5 tabular-nums"
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
          className="rounded-lg px-3.5 py-2.5 space-y-1"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
        >
          {siteSignals.title && (
            <p className="text-sm truncate" style={{ color: "var(--text-2)" }}>
              <span style={{ color: "var(--text-3)" }}>Title · </span>{siteSignals.title}
            </p>
          )}
          <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
            {siteSignals.responseTimeMs ?? 0}ms response time
          </p>
        </div>
      )}
      {!siteSignals.reachable && (
        <p
          className="text-sm rounded-lg px-3.5 py-2.5"
          style={{
            color: "#fbbf24",
            background: "rgba(245,158,11,0.05)",
            border: "1px solid rgba(245,158,11,0.12)",
          }}
        >
          Site unreachable — running on business profile data only
        </p>
      )}

      {/* Score factors */}
      <div className="space-y-2">
        <p className="section-label">Score factors</p>
        {mlScore.scoreFactors?.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs flex-1 truncate" style={{ color: "var(--text-2)" }}>{f.label}</span>
            <div className="w-24 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full bar-grow"
                style={{
                  width: `${Math.min(100, Math.abs(f.contribution) * 25)}%`,
                  background: f.contribution > 0 ? "#22c55e" : "#ef4444",
                }}
              />
            </div>
            <span
              className="text-xs font-mono tabular-nums w-10 text-right shrink-0"
              style={{ color: f.contribution > 0 ? "#4ade80" : "#f87171" }}
            >
              {f.contribution > 0 ? "+" : ""}{f.contribution.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
