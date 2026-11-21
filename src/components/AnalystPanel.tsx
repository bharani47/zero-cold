"use client";
import type { AnalystOutput } from "@/types/audit";

interface AnalystPanelProps {
  analyst: AnalystOutput;
}

export function AnalystPanel({ analyst }: AnalystPanelProps) {
  const gapScore = analyst?.digitalGapScore ?? 0;
  return (
    <div className="glass-lg p-6 anim-fade-up d-150 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>Analyst Findings</h3>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-2)" }}>Gemini Flash · verified technical &amp; conversion gaps</p>
        </div>
        <div className="text-right">
          <span className="text-3xl sm:text-4xl font-black tabular-nums text-cyan-400">
            {gapScore}
          </span>
          <span className="text-xs sm:text-sm ml-1" style={{ color: "var(--text-3)" }}>/100 gap</span>
        </div>
      </div>

      {/* Gap score bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, gapScore))}%`,
            background: gapScore >= 65 ? "linear-gradient(90deg, #06b6d4, #22d3ee)" : "#f59e0b",
          }}
        />
      </div>

      {/* Verified gaps */}
      <div className="space-y-3">
        {analyst.verifiedGaps?.map((gap, i) => (
          <div
            key={i}
            className="rounded-xl px-4 py-3.5 space-y-2 anim-fade-up"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid var(--border)",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <span
              className="text-xs font-bold tracking-wider uppercase rounded-md px-2.5 py-0.5 inline-block"
              style={{
                color: "#67e8f9",
                border: "1px solid rgba(34, 211, 238, 0.25)",
                background: "rgba(6, 182, 212, 0.1)",
              }}
            >
              {gap.category}
            </span>
            <p className="text-base font-bold leading-relaxed" style={{ color: "var(--text-1)" }}>
              {gap.finding}
            </p>
            <p className="text-xs sm:text-sm italic leading-relaxed" style={{ color: "var(--text-2)" }}>
              Evidence: {gap.exactEvidence}
            </p>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: "#fbbf24" }}>
              ↳ {gap.businessImpact}
            </p>
          </div>
        ))}
      </div>

      {/* Competitor + angle */}
      <div className="divider" />
      <div className="space-y-3.5">
        <div>
          <p className="section-label mb-1.5">Local Competitor Benchmark</p>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-2)" }}>
            {analyst.competitorBenchmark}
          </p>
        </div>
        <div>
          <p className="section-label mb-1.5">Recommended Nxt Apex Pitch Angle</p>
          <p className="text-sm sm:text-base font-semibold leading-relaxed text-cyan-300">
            {analyst.recommendedAngle}
          </p>
        </div>
      </div>
    </div>
  );
}
