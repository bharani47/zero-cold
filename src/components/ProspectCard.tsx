"use client";
import { StatusPill } from "./StatusPill";
import type { FirestoreLead } from "@/lib/firebase";

interface ProspectCardProps {
  lead: FirestoreLead;
  isSelected: boolean;
  onSelect: (lead: FirestoreLead) => void;
  onAuditNow: (lead: FirestoreLead) => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 65 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#6b7280";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full bar-grow"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-7 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function ProspectCard({ lead, isSelected, onSelect, onAuditNow }: ProspectCardProps) {
  const hasAudit = !!lead.auditResult;

  return (
    <div
      onClick={() => onSelect(lead)}
      className={`cursor-pointer rounded-xl p-4 transition-all duration-250 ${
        isSelected ? "card-selected" : "card"
      }`}
      style={{ willChange: "transform" }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold truncate" style={{ color: "var(--text-1)" }}>
            {lead.businessName}
          </p>
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--text-2)" }}>
            {lead.niche} · {lead.city}
          </p>
        </div>
        <StatusPill status={lead.status} />
      </div>

      <ScoreBar score={lead.leadScore} />

      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <StatusPill status={lead.priorityTier} size="sm" />
          {lead.googleRating != null && lead.googleRating > 0 && (
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              ★ {lead.googleRating}
            </span>
          )}
          {!lead.websiteUrl && (
            <span className="text-xs text-red-500/70 font-medium">No site</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAuditNow(lead); }}
          className="text-xs font-bold transition-colors flex items-center gap-1"
          style={{ color: hasAudit ? "#60a5fa" : "var(--accent)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-hover)")}
          onMouseLeave={e => (e.currentTarget.style.color = hasAudit ? "#60a5fa" : "var(--accent)")}
          title={hasAudit ? "Re-run full agent audit" : "Run multi-agent audit"}
        >
          {hasAudit ? "Re-Audit ↺" : "Audit →"}
        </button>
      </div>
    </div>
  );
}
