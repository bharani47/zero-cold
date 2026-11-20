"use client";
import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { CriticAudit, WriterDraft } from "@/types/audit";

interface CriticPanelProps {
  critic: CriticAudit;
  writerDraft: WriterDraft;
}

export function CriticPanel({ critic, writerDraft }: CriticPanelProps) {
  const [showDraft, setShowDraft] = useState(false);

  const scoreColor =
    critic.groundednessScore >= 85 ? "#22c55e"
    : critic.groundednessScore >= 60 ? "#f59e0b"
    : "#ef4444";

  return (
    <div className="glass-lg p-5 anim-fade-up d-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Critic Verification</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Gemini Flash · groundedness audit</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl font-black tabular-nums" style={{ color: scoreColor }}>
              {critic.groundednessScore}
            </span>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>/100</span>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={critic.passed
              ? { color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.08)" }
              : { color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.08)" }
            }
          >
            {critic.passed ? "Passed" : "Revised"}
          </span>
        </div>
      </div>

      {/* Groundedness bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${critic.groundednessScore}%`, background: scoreColor }} />
      </div>

      {/* Critique notes */}
      {critic.critiqueNotes && critic.critiqueNotes.length > 0 && (
        <div
          className="rounded-lg px-3.5 py-2.5 space-y-1"
          style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}
        >
          {critic.critiqueNotes.map((note, i) => (
            <p key={i} className="text-sm flex items-start gap-1.5 leading-relaxed" style={{ color: "#fbbf24" }}>
              <span className="shrink-0 mt-0.5">→</span>{note}
            </p>
          ))}
        </div>
      )}

      {/* Claims verified */}
      <div className="space-y-1.5">
        <p className="section-label">Claims verified</p>
        {critic.claimsVerified?.map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            {c.supportedByEvidence
              ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            <span
              className="text-sm leading-relaxed"
              style={{ color: c.supportedByEvidence ? "var(--text-1)" : "#f87171" }}
            >
              {c.claim}
            </span>
          </div>
        ))}
      </div>

      {/* Draft comparison */}
      {!critic.passed && (
        <>
          <button
            onClick={() => setShowDraft((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            {showDraft ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showDraft ? "Hide" : "Show"} draft vs revision
          </button>

          {showDraft && (
            <div
              className="grid grid-cols-2 gap-3 pt-3 anim-fade-in"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div
                className="rounded-lg p-3.5 space-y-2"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
              >
                <p className="section-label">Writer Draft</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  {writerDraft.initialEmail?.subject || writerDraft.subject}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {writerDraft.initialEmail?.body || writerDraft.body}
                </p>
              </div>
              <div
                className="rounded-lg p-3.5 space-y-2"
                style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)" }}
              >
                <p className="section-label" style={{ color: "rgba(96,165,250,0.6)" }}>Critic Revision ✓</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{critic.finalEmail?.subject}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{critic.finalEmail?.body}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
