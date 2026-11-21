"use client";
import { useState } from "react";
import { Check, Copy, X, Send, RotateCcw, Link2, Mail, Clock, MessageSquare } from "lucide-react";
import type { CriticAudit, OutreachMessage } from "@/types/audit";
import type { LeadStatus } from "@/lib/firebase";

type OutreachTab = "email" | "followup" | "dm";

interface ApprovalBoxProps {
  critic: CriticAudit;
  businessName: string;
  leadId?: string;
  initialEmail?: OutreachMessage;
  onApprove: (subject: string, body: string) => Promise<void>;
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

  // Email draft state
  const defaultSubject = initialEmail?.subject || critic.finalEmail?.subject || "";
  const defaultBody = initialEmail?.body || critic.finalEmail?.body || "";
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  // Follow-up draft state
  const defaultFollowUpSubject =
    critic.followUpEmail?.subject || `quick follow-up: ${businessName}'s digital gaps`;
  const defaultFollowUpBody =
    critic.followUpEmail?.body ||
    `Hi,\n\nChecking in on my previous note regarding the missing booking flow. Our Adyar benchmark showed competitors capturing 35% more inquiries.\n\nOpen to a 5-min review?\n\nBest,\nZeroCold Team`;
  const [followUpSubject, setFollowUpSubject] = useState(defaultFollowUpSubject);
  const [followUpBody, setFollowUpBody] = useState(defaultFollowUpBody);

  // WhatsApp / LinkedIn DM draft state
  const defaultDm =
    critic.whatsappOrLinkedinDm ||
    `Hey, noticed ${businessName}'s mobile visitors can't book appointments directly on WhatsApp. We built an automated fix for a nearby practice—mind if I send a 60-sec video breakdown?`;
  const [dmText, setDmText] = useState(defaultDm);

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saving, setSaving] = useState(false);

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
      setSubject(critic.finalEmail?.subject || defaultSubject);
      setBody(critic.finalEmail?.body || defaultBody);
    } else if (activeTab === "followup") {
      setFollowUpSubject(defaultFollowUpSubject);
      setFollowUpBody(defaultFollowUpBody);
    } else {
      setDmText(defaultDm);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await onApprove(subject, body);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await onReject();
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

  return (
    <div
      className="rounded-2xl p-5 anim-fade-up d-250 space-y-4"
      style={{ border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.04)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
            Omni-Channel Outreach Pack
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{businessName}</p>
        </div>

        <div className="flex items-center gap-2">
          {leadId && (
            <button
              onClick={handleCopyReportLink}
              title="Copy shareable white-label report link"
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors"
              style={{
                color: copiedLink ? "#4ade80" : "#60a5fa",
                border: copiedLink ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(37,99,235,0.3)",
                background: copiedLink ? "rgba(34,197,94,0.08)" : "rgba(37,99,235,0.08)",
              }}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              {copiedLink ? "Report Link Copied!" : "Copy Client Report Link"}
            </button>
          )}

          <button
            onClick={handleResetCurrentTab}
            title="Reset to Critic-approved draft"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded border border-white/10"
          >
            <RotateCcw className="w-3 h-3" /> Revert
          </button>

          <span className="text-xs font-mono tabular-nums text-zinc-500">
            {activeWordCount} words
          </span>

          {currentStatus !== "pending" && (
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={
                currentStatus === "approved"
                  ? { color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.08)" }
                  : { color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)" }
              }
            >
              {currentStatus}
            </span>
          )}
        </div>
      </div>

      {/* 3 Channel Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
      >
        <button
          onClick={() => setActiveTab("email")}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
          style={
            activeTab === "email"
              ? { background: "rgba(37,99,235,0.18)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.3)" }
              : { color: "var(--text-3)" }
          }
        >
          <Mail className="w-3.5 h-3.5" /> Cold Email
        </button>
        <button
          onClick={() => setActiveTab("followup")}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
          style={
            activeTab === "followup"
              ? { background: "rgba(37,99,235,0.18)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.3)" }
              : { color: "var(--text-3)" }
          }
        >
          <Clock className="w-3.5 h-3.5" /> 48h Follow-Up
        </button>
        <button
          onClick={() => setActiveTab("dm")}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg transition-all"
          style={
            activeTab === "dm"
              ? { background: "rgba(37,99,235,0.18)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.3)" }
              : { color: "var(--text-3)" }
          }
        >
          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp / LinkedIn
        </button>
      </div>

      {/* Channel Form Fields */}
      {activeTab === "email" && (
        <div className="space-y-3 anim-fade-in">
          <div>
            <label className="section-label block mb-1.5">Initial Cold Email Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input px-3.5 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="section-label block mb-1.5">Email Body (&lt; 100 words)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="input px-3.5 py-2.5 text-base leading-relaxed resize-none"
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
              onChange={(e) => setFollowUpSubject(e.target.value)}
              className="input px-3.5 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="section-label block mb-1.5">Follow-Up Body (&lt; 70 words)</label>
            <textarea
              value={followUpBody}
              onChange={(e) => setFollowUpBody(e.target.value)}
              rows={5}
              className="input px-3.5 py-2.5 text-base leading-relaxed resize-none"
            />
          </div>
        </div>
      )}

      {activeTab === "dm" && (
        <div className="space-y-3 anim-fade-in">
          <div>
            <label className="section-label block mb-1.5">Direct Message / DM (&lt; 45 words)</label>
            <textarea
              value={dmText}
              onChange={(e) => setDmText(e.target.value)}
              rows={4}
              placeholder="Conversational opener suitable for WhatsApp or LinkedIn outreach..."
              className="input px-3.5 py-2.5 text-base leading-relaxed resize-none"
            />
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          onClick={handleApprove}
          disabled={saving || currentStatus === "approved"}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-base font-semibold"
        >
          <Send className="w-4 h-4" />
          {currentStatus === "approved" ? "Approved ✓" : saving ? "Saving…" : "Approve & Save"}
        </button>

        <button
          onClick={handleCopyCurrentTab}
          className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-base font-semibold"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied
            ? "Copied to Clipboard!"
            : activeTab === "email"
            ? "Copy Cold Email"
            : activeTab === "followup"
            ? "Copy Follow-Up"
            : "Copy DM Message"}
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
            className="btn-ghost flex items-center gap-1.5 px-3.5 py-2.5 text-base font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            title="Launch default email client with draft preloaded"
          >
            <Mail className="w-4 h-4" /> Open in Mail
          </a>
        ) : (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(dmText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex items-center gap-1.5 px-3.5 py-2.5 text-base font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Open WhatsApp Web with pre-filled message"
          >
            <MessageSquare className="w-4 h-4" /> Open WhatsApp
          </a>
        )}

        <button
          onClick={handleReject}
          disabled={saving || currentStatus === "rejected"}
          className="btn-danger flex items-center gap-2 px-4 py-2.5 text-base font-semibold ml-auto disabled:opacity-40"
        >
          <X className="w-4 h-4" /> Reject
        </button>
      </div>

      {currentStatus === "approved" && (
        <div
          className="flex items-center gap-2 text-sm font-medium rounded-lg px-3.5 py-2.5 anim-fade-in"
          style={{
            color: "#4ade80",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <Check className="w-4 h-4 shrink-0" />
          Saved to outreach queue — ready for dispatch
        </div>
      )}
    </div>
  );
}
