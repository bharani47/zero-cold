"use client";
import { Globe, RotateCcw, Trash2, Zap } from "lucide-react";
import { StatusPill } from "./StatusPill";
import type { FirestoreLead } from "@/lib/firebase";

interface ProspectCardProps {
  lead: FirestoreLead;
  isSelected: boolean;
  onSelect: (lead: FirestoreLead) => void;
  onAuditNow: (lead: FirestoreLead) => void;
  onDelete?: (id: string) => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 65 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#6b7280";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full bar-grow"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono font-bold tabular-nums w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function cleanDomain(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ProspectCard({ lead, isSelected, onSelect, onAuditNow, onDelete }: ProspectCardProps) {
  const hasAudit = !!lead.auditResult;
  const domain = cleanDomain(lead.websiteUrl);

  return (
    <div
      onClick={() => onSelect(lead)}
      className={`group cursor-pointer rounded-xl p-3.5 transition-all duration-200 ${
        isSelected ? "card-selected" : "card"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-bold truncate" style={{ color: "var(--text-1)" }}>
            {lead.businessName}
          </p>
          <div className="flex items-center gap-1.5 text-xs mt-0.5 truncate" style={{ color: "var(--text-2)" }}>
            <span className="truncate">{lead.niche}</span>
            <span>·</span>
            <span className="truncate">{lead.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusPill status={lead.status} />
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead.id);
              }}
              title="Remove prospect"
              className="opacity-60 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <ScoreBar score={lead.leadScore} />

      <div
        className="flex items-center justify-between gap-2 mt-2.5 pt-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <StatusPill status={lead.priorityTier} size="sm" />
          {lead.googleRating != null && lead.googleRating > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/3 text-amber-300/90">
              ★ {lead.googleRating}
              {lead.reviewCount ? ` (${lead.reviewCount})` : ""}
            </span>
          )}
          {domain ? (
            <span className="text-xs text-slate-300 flex items-center gap-1 truncate max-w-[135px]">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{domain}</span>
            </span>
          ) : (
            <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/12">
              No site
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAuditNow(lead);
          }}
          className="text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg hover:bg-cyan-500/12 cursor-pointer text-cyan-400 hover:text-cyan-300"
          title={hasAudit ? "Re-run full 5-stage audit" : "Run 5-stage audit"}
        >
          {hasAudit ? (
            <>
              <RotateCcw className="w-3 h-3" /> Re-Audit
            </>
          ) : (
            <>
              <Zap className="w-3 h-3" /> Audit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
