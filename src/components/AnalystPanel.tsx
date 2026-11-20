"use client";
import type { AnalystOutput } from "@/types/audit";

interface AnalystPanelProps {
  analyst: AnalystOutput;
}

export function AnalystPanel({ analyst }: AnalystPanelProps) {
  return (
    <div className="glass-lg p-5 anim-fade-up d-150 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Analyst Findings</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Gemini Flash · verified gaps</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black tabular-nums" style={{ color: "var(--text-1)" }}>
            {analyst.digitalGapScore}
          </span>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>/100 gap</span>
        </div>
      </div>

      {/* Gap score bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${analyst.digitalGapScore}%`,
            background: analyst.digitalGapScore >= 65 ? "var(--accent)" : "#f59e0b",
          }}
        />
      </div>

      {/* Verified gaps */}
      <div className="space-y-2.5">
        {analyst.verifiedGaps?.map((gap, i) => (
          <div
            key={i}
            className="rounded-lg px-3.5 py-3 space-y-1.5 anim-fade-up"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <span
              className="text-[10px] font-bold tracking-widest uppercase rounded px-2 py-0.5"
              style={{
                color: "var(--text-2)",
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {gap.category}
            </span>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-1)" }}>
              {gap.finding}
            </p>
            <p className="text-xs italic leading-relaxed" style={{ color: "var(--text-3)" }}>
              Evidence: {gap.exactEvidence}
            </p>
            <p className="text-xs font-medium leading-relaxed" style={{ color: "#fbbf24" }}>
              ↳ {gap.businessImpact}
            </p>
          </div>
        ))}
      </div>

      {/* Competitor + angle */}
      <div className="divider" />
      <div className="space-y-3">
        <div>
          <p className="section-label mb-1.5">Competitor Benchmark</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            {analyst.competitorBenchmark}
          </p>
        </div>
        <div>
          <p className="section-label mb-1.5">Recommended Angle</p>
          <p className="text-sm font-semibold leading-relaxed" style={{ color: "#60a5fa" }}>
            {analyst.recommendedAngle}
          </p>
        </div>
      </div>
    </div>
  );
}
