"use client";
import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import type { CriticAudit, WriterDraft } from "@/types/audit";

interface CriticPanelProps {
  critic: CriticAudit;
  writerDraft: WriterDraft;
}

export function CriticPanel({ critic, writerDraft }: CriticPanelProps) {
  const [showDraft, setShowDraft] = useState(false);

  const groundednessScore = critic?.groundednessScore ?? 0;
  const scoreColor =
    groundednessScore >= 85 ? "#22c55e"
    : groundednessScore >= 60 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="glass-lg p-5 anim-fade-up d-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)" }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>
              Critic Groundedness Audit
            </h3>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-2)" }}>
              Gemini Flash · factual claim verification against raw DOM signals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color: scoreColor }}>
              {groundednessScore}
            </span>
            <span className="text-xs sm:text-sm" style={{ color: "var(--text-3)" }}>/100</span>
          </div>
          <span
            className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full"
            style={
              critic.passed
                ? { color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.1)" }
                : { color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.1)" }
            }
          >
            {critic.passed ? "Verified Pass ✓" : "Auto-Revised ✓"}
          </span>
        </div>
      </div>

      {/* Groundedness bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, groundednessScore))}%`, background: scoreColor }} />
      </div>

      {/* Critique notes */}
      {critic.critiqueNotes && critic.critiqueNotes.length > 0 && (
        <div
          className="rounded-xl px-3.5 py-2.5 space-y-1.5"
          style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold">
            Critic Audit Notes
          </p>
          {critic.critiqueNotes.map((note, i) => (
            <p key={i} className="text-xs sm:text-sm flex items-start gap-1.5 leading-relaxed" style={{ color: "#fcd34d" }}>
              <span className="shrink-0 mt-0.5">→</span>
              <span>{note}</span>
            </p>
          ))}
        </div>
      )}

      {/* Claims verified */}
      <div className="space-y-1.5">
        <p className="section-label">Claim-by-Claim Evidence Verification</p>
        <div className="grid grid-cols-1 gap-1.5">
          {critic.claimsVerified?.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-lg px-3 py-2"
              style={{
                background: c.supportedByEvidence ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.05)",
                border: c.supportedByEvidence
                  ? "1px solid rgba(34,197,94,0.12)"
                  : "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {c.supportedByEvidence ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span
                className="text-xs sm:text-sm leading-relaxed flex-1"
                style={{ color: c.supportedByEvidence ? "var(--text-1)" : "#fca5a5" }}
              >
                {c.claim}
              </span>
              <span
                className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0"
                style={
                  c.supportedByEvidence
                    ? { color: "#4ade80", background: "rgba(34,197,94,0.1)" }
                    : { color: "#f87171", background: "rgba(239,68,68,0.1)" }
                }
              >
                {c.supportedByEvidence ? "DOM Verified" : "Filtered"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Draft vs Final comparison toggle — always available for transparency */}
      <div>
        <button
          onClick={() => setShowDraft((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-white/5"
          style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
        >
          {showDraft ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showDraft ? "Hide Writer Draft vs. Critic Final" : "Compare Writer Draft vs. Critic Final"}
        </button>

        {showDraft && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 anim-fade-in"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div
              className="rounded-xl p-3.5 space-y-2"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
            >
              <p className="section-label">Stage 4 · Writer Agent Draft</p>
              <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                {writerDraft.initialEmail?.subject || writerDraft.subject}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-2)" }}>
                {writerDraft.initialEmail?.body || writerDraft.body}
              </p>
            </div>
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(34,211,238,0.25)" }}
            >
              <p className="section-label text-cyan-400">
                Stage 5 · Critic Verified Output ✓
              </p>
              <p className="text-sm sm:text-base font-bold" style={{ color: "var(--text-1)" }}>
                {critic.finalEmail?.subject}
              </p>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: "var(--text-2)" }}>
                {critic.finalEmail?.body}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
