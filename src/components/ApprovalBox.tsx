"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  X,
  Send,
  RotateCcw,
  Link2,
  Mail,
  Clock,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import type { CriticAudit, OutreachMessage } from "@/types/audit";
import type { LeadStatus } from "@/lib/firebase";

type OutreachTab = "email" | "followup" | "dm";

export interface ApprovedOutreachPack {
  finalEmail: OutreachMessage;
  followUpEmail: OutreachMessage;
  whatsappOrLinkedinDm: string;
}

interface ApprovalBoxProps {
  critic: CriticAudit;
  businessName: string;
  leadId?: string;
  initialEmail?: OutreachMessage;
  onApprove: (pack: ApprovedOutreachPack) => Promise<void>;
  onReject: () => Promise<void>;
  currentStatus: LeadStatus;
}

export function ApprovalBox({
  critic,
  businessName,
  leadId,
  initialEmail,
  onApprove,
  onReject,
  currentStatus,
}: ApprovalBoxProps) {
  const [activeTab, setActiveTab] = useState<OutreachTab>("email");

  // Prioritize Critic-verified finalEmail over raw Writer initialEmail
  const defaultSubject = critic.finalEmail?.subject || initialEmail?.subject || "";
  const defaultBody = critic.finalEmail?.body || initialEmail?.body || "";
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  // Follow-up draft state
  const defaultFollowUpSubject =
    critic.followUpEmail?.subject || `quick follow-up: ${businessName}'s digital gaps`;
  const defaultFollowUpBody =
    critic.followUpEmail?.body ||
    `Hi,\n\nChecking in on my previous note regarding the missing booking flow. Our local benchmark showed competitors capturing 35% more inquiries.\n\nOpen to a 5-min review?\n\nBest,\nZeroCold Team`;
  const [followUpSubject, setFollowUpSubject] = useState(defaultFollowUpSubject);
  const [followUpBody, setFollowUpBody] = useState(defaultFollowUpBody);

  // WhatsApp / LinkedIn DM draft state
  const defaultDm =
    critic.whatsappOrLinkedinDm ||
    `Hey, noticed ${businessName}'s mobile visitors can't book appointments directly on WhatsApp. We built an automated fix for a nearby business—mind if I send a 60-sec breakdown?`;
  const [dmText, setDmText] = useState(defaultDm);

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      return true;
    } catch (err) {
      console.warn("Failed to copy:", err);
      return false;
    }
  };

  const handleCopyCurrentTab = async () => {
    let text = "";
    if (activeTab === "email") {
      text = `Subject: ${subject}\n\n${body}`;
    } else if (activeTab === "followup") {
      text = `Subject: ${followUpSubject}\n\n${followUpBody}`;
    } else {
      text = dmText;
    }
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyReportLink = async () => {
    if (!leadId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const reportUrl = `${origin}/audit/${encodeURIComponent(leadId)}`;
    const ok = await copyToClipboard(reportUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleResetCurrentTab = () => {
    if (activeTab === "email") {
      setSubject(defaultSubject);
      setBody(defaultBody);
    } else if (activeTab === "followup") {
      setFollowUpSubject(defaultFollowUpSubject);
      setFollowUpBody(defaultFollowUpBody);
    } else {
      setDmText(defaultDm);
    }
    setIsDirty(true);
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await onApprove({
        finalEmail: { subject, body },
        followUpEmail: { subject: followUpSubject, body: followUpBody },
        whatsappOrLinkedinDm: dmText,
      });
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await onReject();
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const activeWordCount =
    activeTab === "email"
      ? body.trim().split(/\s+/).filter(Boolean).length
      : activeTab === "followup"
      ? followUpBody.trim().split(/\s+/).filter(Boolean).length
      : dmText.trim().split(/\s+/).filter(Boolean).length;

  const wordLimit = activeTab === "email" ? 100 : activeTab === "followup" ? 70 : 45;
  const withinWordLimit = activeWordCount <= wordLimit;

  return (
    <div
      className="rounded-2xl p-5 anim-fade-up d-250 space-y-4"
      style={{ border: "1px solid rgba(37,99,235,0.25)", background: "rgba(37,99,235,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
              Omni-Channel Outreach Pack
            </h3>
            {currentStatus !== "pending" && (
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
                style={
                  currentStatus === "approved"
                    ? { color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.1)" }
                    : { color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.1)" }
                }
              >
                {currentStatus}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            Human-in-the-loop gate for <span className="text-zinc-300 font-medium">{businessName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {leadId && (
            <>
              <button
                onClick={handleCopyReportLink}
                title="Copy shareable white-label report link"
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer"
                style={{
                  color: copiedLink ? "#4ade80" : "#93c5fd",
                  border: copiedLink ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(37,99,235,0.3)",
                  background: copiedLink ? "rgba(34,197,94,0.1)" : "rgba(37,99,235,0.1)",
                }}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                {copiedLink ? "Report Link Copied!" : "Copy Report Link"}
              </button>

              <Link
                href={`/audit/${encodeURIComponent(leadId)}`}
                target="_blank"
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                title="Open client-facing white-label audit report in a new tab"
              >
                Preview Report <ExternalLink className="w-3 h-3" />
              </Link>
            </>
          )}

          <button
            onClick={handleResetCurrentTab}
            title="Reset current tab to Critic-verified draft"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1.5 rounded-lg border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Revert
          </button>

          <span
            className="text-xs font-mono tabular-nums px-2 py-1 rounded-md"
            style={
              withinWordLimit
                ? { color: "#4ade80", background: "rgba(34,197,94,0.08)" }
                : { color: "#fbbf24", background: "rgba(245,158,11,0.1)" }
            }
          >
            {activeWordCount}/{wordLimit}w
          </span>
        </div>
      </div>

      {/* 3 Channel Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
      >
        <button
          onClick={() => setActiveTab("email")}
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold py-2 px-1.5 sm:px-3 rounded-lg transition-all cursor-pointer"
          style={
            activeTab === "email"
              ? { background: "rgba(37,99,235,0.2)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.35)" }
              : { color: "var(--text-2)" }
          }
        >
          <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Cold Email</span>
        </button>
        <button
          onClick={() => setActiveTab("followup")}
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold py-2 px-1.5 sm:px-3 rounded-lg transition-all cursor-pointer"
          style={
            activeTab === "followup"
              ? { background: "rgba(37,99,235,0.2)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.35)" }
              : { color: "var(--text-2)" }
          }
        >
          <Clock className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">48h Follow-Up</span>
        </button>
        <button
          onClick={() => setActiveTab("dm")}
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold py-2 px-1.5 sm:px-3 rounded-lg transition-all cursor-pointer"
          style={
            activeTab === "dm"
              ? { background: "rgba(37,99,235,0.2)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.35)" }
              : { color: "var(--text-2)" }
          }
        >
          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">DM</span>
            <span className="hidden sm:inline">WhatsApp / LinkedIn</span>
          </span>
        </button>
      </div>

      {/* Channel Form Fields */}
      {activeTab === "email" && (
        <div className="space-y-3 anim-fade-in">
          <div>
            <label className="section-label block mb-1.5">Initial Cold Email Subject</label>
            <input
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setIsDirty(true);
              }}
              className="input px-3.5 py-2.5 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="section-label block mb-1.5">Email Body (Target &lt; 100 words)</label>
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setIsDirty(true);
              }}
              rows={6}
              className="input px-3.5 py-2.5 text-sm sm:text-base leading-relaxed resize-none"
            />
          </div>
        </div>
      )}

      {activeTab === "followup" && (
        <div className="space-y-3 anim-fade-in">
          <div>
            <label className="section-label block mb-1.5">48-Hour Follow-Up Subject</label>
            <input
              value={followUpSubject}
              onChange={(e) => {
                setFollowUpSubject(e.target.value);
                setIsDirty(true);
              }}
              className="input px-3.5 py-2.5 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="section-label block mb-1.5">Follow-Up Body (Target &lt; 70 words)</label>
            <textarea
              value={followUpBody}
              onChange={(e) => {
                setFollowUpBody(e.target.value);
                setIsDirty(true);
              }}
              rows={5}
              className="input px-3.5 py-2.5 text-sm sm:text-base leading-relaxed resize-none"
            />
          </div>
        </div>
      )}

      {activeTab === "dm" && (
        <div className="space-y-3 anim-fade-in">
          <div>
            <label className="section-label block mb-1.5">Direct Message / DM (Target &lt; 45 words)</label>
            <textarea
              value={dmText}
              onChange={(e) => {
                setDmText(e.target.value);
                setIsDirty(true);
              }}
              rows={4}
              placeholder="Conversational opener suitable for WhatsApp or LinkedIn outreach..."
              className="input px-3.5 py-2.5 text-sm sm:text-base leading-relaxed resize-none"
            />
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          onClick={handleApprove}
          disabled={saving || (currentStatus === "approved" && !isDirty)}
          className="btn-primary flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-semibold"
        >
          <Send className="w-4 h-4" />
          {saving
            ? "Saving…"
            : currentStatus === "approved" && isDirty
            ? "Update Approved Copy"
            : currentStatus === "approved"
            ? "Approved ✓"
            : "Approve & Save"}
        </button>

        <button
          onClick={handleCopyCurrentTab}
          className="btn-ghost flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-semibold"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied
            ? "Copied!"
            : activeTab === "email"
            ? "Copy Email"
            : activeTab === "followup"
            ? "Copy Follow-Up"
            : "Copy DM"}
        </button>

        {activeTab !== "dm" ? (
          <a
            href={`mailto:?subject=${encodeURIComponent(
              activeTab === "email" ? subject : followUpSubject
            )}&body=${encodeURIComponent(
              activeTab === "email" ? body : followUpBody
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            title="Launch default email client with draft preloaded"
          >
            <Mail className="w-4 h-4" /> Open in Mail
          </a>
        ) : (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(dmText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Open WhatsApp Web with pre-filled message"
          >
            <MessageSquare className="w-4 h-4" /> Open WhatsApp
          </a>
        )}

        <button
          onClick={handleReject}
          disabled={saving || currentStatus === "rejected"}
          className="btn-danger flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold ml-auto disabled:opacity-40"
        >
          <X className="w-4 h-4" /> Reject
        </button>
      </div>

      {currentStatus === "approved" && (
        <div
          className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 anim-fade-in"
          style={{
            color: "#4ade80",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            Approved &amp; synced to outreach queue — ready for dispatch
          </span>
          {leadId && (
            <Link
              href={`/audit/${encodeURIComponent(leadId)}`}
              target="_blank"
              className="underline font-semibold hover:text-emerald-300 shrink-0"
            >
              View Client Report ↗
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
