"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Target, TrendingUp, Shield, CheckCircle2,
  BarChart3, Zap, ArrowRight, Sparkles, Search,
} from "lucide-react";
import {
  collection, onSnapshot, doc, setDoc, updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirestoreLead } from "@/lib/firebase";
import type { AuditResult } from "@/types/audit";
import { SEED_LEADS } from "@/data/seedLeads";
import { AuthButton }      from "@/components/AuthButton";
import { KpiCard }         from "@/components/KpiCard";
import { ProspectCard }    from "@/components/ProspectCard";
import { PipelineStepper } from "@/components/PipelineStepper";
import { SiteSignalsPanel }from "@/components/SiteSignalsPanel";
import { AnalystPanel }    from "@/components/AnalystPanel";
import { CriticPanel }     from "@/components/CriticPanel";
import { ApprovalBox }     from "@/components/ApprovalBox";

type TabFilter = "all" | "pending" | "approved";

interface AuditForm {
  businessName: string;
  websiteUrl:   string;
  niche:        string;
  city:         string;
  googleRating: string;
  reviewCount:  string;
  senderOffer:  string;
}

export default function Home() {
  const [leads, setLeads]               = useState<FirestoreLead[]>(SEED_LEADS as FirestoreLead[]);
  const [selectedLead, setSelectedLead] = useState<FirestoreLead | null>(SEED_LEADS[0] as FirestoreLead);
  const [auditResult, setAuditResult]   = useState<AuditResult | null>(
    (SEED_LEADS[0]?.auditResult as unknown as AuditResult) ?? null
  );
  const [isRunning, setIsRunning]       = useState(false);
  const [activeStep, setActiveStep]     = useState(5);
  const [auditError, setAuditError]     = useState<string | null>(null);
  const [tab, setTab]                   = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery]   = useState("");

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const [form, setForm] = useState<AuditForm>({
    businessName: "",
    websiteUrl:   "",
    niche:        "",
    city:         "Chennai",
    googleRating: "",
    reviewCount:  "",
    senderOffer:  "web redesign, local SEO & conversion automation",
  });

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Firestore live sync with graceful fallback
  useEffect(() => {
    if (!db) return;
    try {
      const unsub: Unsubscribe = onSnapshot(
        collection(db, "leads"),
        (snap) => {
          if (snap.empty) return;
          const remote = snap.docs.map((d) => ({ ...(d.data() as FirestoreLead), id: d.id }));
          setLeads((prev) => {
            const ids = new Set(remote.map((l) => l.id));
            return [...remote, ...prev.filter((l) => !ids.has(l.id))];
          });
        },
        (error) => {
          console.warn("Firestore onSnapshot error:", error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn("Firestore sync setup error:", e);
    }
  }, []);

  // Search & tab filter
  const filteredLeads = useMemo(() => {
    let list = tab === "all" ? leads : leads.filter((l) => l.status === tab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.niche.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, tab, searchQuery]);

  // Dynamic KPI calculations
  const kpis = useMemo(() => {
    const audited = leads.filter((l) => l.auditResult);
    const avg = (fn: (ar: Record<string, unknown>) => number) =>
      audited.length
        ? Math.round(audited.reduce((s, l) => s + fn(l.auditResult as Record<string, unknown>), 0) / audited.length)
        : 0;
    return {
      total:     leads.length,
      avgGap:    avg((ar) => ((ar?.analystOutput as Record<string, unknown>)?.digitalGapScore as number) ?? 0),
      avgGround: avg((ar) => ((ar?.criticAudit  as Record<string, unknown>)?.groundednessScore as number) ?? 0),
      approved:  leads.filter((l) => l.status === "approved").length,
    };
  }, [leads]);

  const set = (k: keyof AuditForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Handle lead selection from list
  function handleSelectLead(lead: FirestoreLead) {
    setSelectedLead(lead);
    setAuditError(null);
    if (lead.auditResult) {
      setAuditResult(lead.auditResult as unknown as AuditResult);
      setActiveStep(5);
    } else {
      setAuditResult(null);
      setActiveStep(-1);
    }
  }

  // Multi-agent audit runner
  async function runAudit(overrides?: Partial<AuditForm & { leadId?: string }>) {
    const data: AuditForm & { leadId?: string } = { ...form, ...overrides };
    if (!data.businessName.trim()) return;

    // Reset previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setIsRunning(true);
    setAuditError(null);
    setActiveStep(0);

    // Staged visual progress
    const stepsDelays = [1200, 2600, 5200, 9000];
    timersRef.current = stepsDelays.map((d, i) =>
      setTimeout(() => setActiveStep(i + 1), d)
    );

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: data.businessName,
          niche:        data.niche || "Local Business",
          city:         data.city || "Chennai",
          websiteUrl:   data.websiteUrl || "",
          googleRating: parseFloat(data.googleRating || "0") || 0,
          reviewCount:  parseInt(data.reviewCount  || "0") || 0,
          senderOffer:  data.senderOffer || "web redesign, local SEO & conversion automation",
        }),
      });

      timersRef.current.forEach(clearTimeout);

      if (!res.ok) {
        const errorJson = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorJson.error ?? `Audit failed with status ${res.status}`);
      }

      const result: AuditResult = (await res.json()) as AuditResult;
      setActiveStep(5);
      setAuditResult(result);

      const id = data.leadId ?? `audit-${Date.now()}`;
      const originalCreatedAt = data.leadId ? leads.find((l) => l.id === data.leadId)?.createdAt : undefined;
      const updatedLead: FirestoreLead = {
        id,
        businessName: data.businessName,
        niche:        data.niche || "Local Business",
        city:         data.city || "Chennai",
        websiteUrl:   data.websiteUrl || "",
        googleRating: parseFloat(data.googleRating || "0") || undefined,
        reviewCount:  parseInt(data.reviewCount  || "0") || undefined,
        leadScore:    result.mlScore.leadScore,
        priorityTier: result.mlScore.priorityTier,
        status:       "pending",
        auditResult:  result as unknown as Record<string, unknown>,
        createdAt:    originalCreatedAt ?? Date.now(),
        updatedAt:    Date.now(),
      };

      // Always update local state
      setSelectedLead(updatedLead);
      setLeads((prev) => [updatedLead, ...prev.filter((l) => l.id !== id)]);

      // Sync to Firestore if db is available
      if (db) {
        try {
          await setDoc(doc(db, "leads", id), updatedLead);
        } catch (dbErr) {
          console.warn("Could not persist lead to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      timersRef.current.forEach(clearTimeout);
      const msg = err instanceof Error ? err.message : "Audit request failed";
      setAuditError(msg);
      setActiveStep(0);
    } finally {
      setIsRunning(false);
    }
  }

  // Audit now triggered from card
  async function handleLeadAudit(lead: FirestoreLead) {
    setSelectedLead(lead);
    setForm({
      businessName: lead.businessName,
      websiteUrl:   lead.websiteUrl ?? "",
      niche:        lead.niche,
      city:         lead.city,
      googleRating: String(lead.googleRating ?? ""),
      reviewCount:  String(lead.reviewCount ?? ""),
      senderOffer:  "web redesign, local SEO & conversion automation",
    });
    await runAudit({
      businessName: lead.businessName,
      websiteUrl:   lead.websiteUrl ?? "",
      niche:        lead.niche,
      city:         lead.city,
      googleRating: String(lead.googleRating ?? ""),
      reviewCount:  String(lead.reviewCount ?? ""),
      leadId:       lead.id,
    });
  }

  // Approve action
  async function handleApprove(subject: string, body: string) {
    if (!selectedLead) return;

    // Local state update
    const updatedLead: FirestoreLead = {
      ...selectedLead,
      status: "approved",
      updatedAt: Date.now(),
      auditResult: selectedLead.auditResult
        ? {
            ...selectedLead.auditResult,
            finalEmail: { subject, body },
            criticAudit: {
              ...((selectedLead.auditResult as unknown as AuditResult).criticAudit || {}),
              finalEmail: { subject, body },
            },
          }
        : undefined,
    };

    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
    setSelectedLead(updatedLead);

    // Sync to Firestore if db exists
    if (db) {
      try {
        await updateDoc(doc(db, "leads", selectedLead.id), {
          status: "approved",
          updatedAt: Date.now(),
          "auditResult.finalEmail": { subject, body },
          "auditResult.criticAudit.finalEmail": { subject, body },
        });
      } catch (err) {
        console.warn("Firestore update error:", err);
      }
    }
  }

  // Reject action
  async function handleReject() {
    if (!selectedLead) return;

    const updatedLead: FirestoreLead = {
      ...selectedLead,
      status: "rejected",
      updatedAt: Date.now(),
    };

    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
    setSelectedLead(updatedLead);

    if (db) {
      try {
        await updateDoc(doc(db, "leads", selectedLead.id), {
          status: "rejected",
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.warn("Firestore reject update error:", err);
      }
    }
  }

  const selectedAudit: AuditResult | null =
    auditResult ?? (selectedLead?.auditResult ? (selectedLead.auditResult as unknown as AuditResult) : null);

  // Dynamic model badge computed from pipeline output
  const activeModelBadge = useMemo(() => {
    if (selectedAudit?.pipeline?.length) {
      const flash = selectedAudit.pipeline.find((p) => p.model.toLowerCase().includes("flash"))?.model;
      const pro = selectedAudit.pipeline.find((p) => p.model.toLowerCase().includes("pro"))?.model;
      if (flash && pro) {
        return `${flash} · ${pro}`;
      }
      if (flash) return flash;
    }
    return "Gemini Flash + Pro";
  }, [selectedAudit]);

  const tabCounts = {
    all:      leads.length,
    pending:  leads.filter((l) => l.status === "pending").length,
    approved: leads.filter((l) => l.status === "approved").length,
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Ambient background gradient */}
      <div className="bg-gradient-layer" />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 nav-blur">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between gap-6">

          {/* Logo container — Sharp dark-mode geometric SVG "Z" emblem + ZERO COLD */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center p-0.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-sm shadow-blue-500/20">
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path
                    d="M5 7h18l-12 14h12"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 7l-8 10"
                    stroke="rgba(96,165,250,0.85)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex items-baseline tracking-wider select-none">
                <span className="text-lg font-black tracking-tight text-white">ZERO</span>
                <span className="text-lg font-black tracking-tight text-blue-500 ml-1">COLD</span>
              </div>
            </div>

            {/* AI badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-2)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              {activeModelBadge}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4 ml-auto">
            <span
              className="text-xs hidden lg:block"
              style={{ color: "var(--text-3)" }}
            >
              Code Ruptors · Startup Buildathon India 2026
            </span>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1800px] mx-auto w-full px-6 py-6 space-y-5">

        {/* ── KPI STRIP ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard
            label="Total Prospects"
            value={kpis.total}
            sub="in intelligence pipeline"
            icon={<BarChart3 className="w-4 h-4 text-blue-400" />}
            animDelay="0ms"
          />
          <KpiCard
            label="Avg Gap Score"
            value={kpis.avgGap ? `${kpis.avgGap}/100` : "—"}
            sub="higher = bigger buying opportunity"
            icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
            animDelay="60ms"
          />
          <KpiCard
            label="Critic Groundedness"
            value={kpis.avgGround ? `${kpis.avgGround}%` : "—"}
            sub="verified hallucination-free accuracy"
            icon={<Shield className="w-4 h-4 text-blue-400" />}
            animDelay="120ms"
          />
          <KpiCard
            label="Approved Queue"
            value={kpis.approved}
            sub="ready for outreach dispatch"
            icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />}
            animDelay="180ms"
          />
        </div>

        {/* ── AUDIT COMMAND BAR ── */}
        <div className="glass-lg p-5 anim-fade-up d-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}
              >
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                  Live Audit Command Bar
                </h2>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Trigger real-time cheerio scraping, logistic regression scoring, and the 3-agent Gemini chain
                </p>
              </div>
            </div>
            <span className="text-xs hidden lg:block" style={{ color: "var(--text-3)" }}>
              Extractor → ML Scorer → Analyst → Writer → Critic
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
            <input
              placeholder="Business Name *"
              value={form.businessName}
              onChange={(e) => set("businessName")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-base"
            />
            <input
              placeholder="Website URL"
              value={form.websiteUrl}
              onChange={(e) => set("websiteUrl")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-base"
            />
            <input
              placeholder="Niche (Dental, Gym...)"
              value={form.niche}
              onChange={(e) => set("niche")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-base"
            />
            <input
              placeholder="City (Chennai)"
              value={form.city}
              onChange={(e) => set("city")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-base"
            />
            <input
              placeholder="Your Service Offer"
              value={form.senderOffer}
              onChange={(e) => set("senderOffer")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-base"
            />
            <button
              onClick={() => runAudit()}
              disabled={isRunning || !form.businessName.trim()}
              className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-base font-semibold"
            >
              {isRunning ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                  Auditing…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── SPLIT WORKSPACE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">

          {/* Left Column — Prospect Queue */}
          <div className="space-y-3 anim-fade-up d-250">

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search leads by name, niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 pr-3 py-2 text-sm w-full"
              />
            </div>

            {/* Tab Filter switcher */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)" }}
            >
              {(["all", "pending", "approved"] as TabFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 text-sm font-semibold py-1.5 px-2 rounded-lg transition-all duration-200 capitalize"
                  style={
                    tab === t
                      ? { background: "rgba(255,255,255,0.08)", color: "var(--text-1)" }
                      : { color: "var(--text-3)" }
                  }
                >
                  {t === "all"
                    ? `All (${tabCounts.all})`
                    : t === "pending"
                    ? `Pending (${tabCounts.pending})`
                    : `Approved (${tabCounts.approved})`}
                </button>
              ))}
            </div>

            {/* Lead Cards List */}
            <div
              className="space-y-2 overflow-y-auto pr-0.5"
              style={{ maxHeight: "calc(100vh - 350px)" }}
            >
              {filteredLeads.length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border border-white/5">
                  <p className="text-sm font-semibold text-zinc-400">No leads match your criteria</p>
                  <p className="text-xs text-zinc-600 mt-1">Try clearing your search or add a new lead above</p>
                </div>
              )}
              {filteredLeads.map((lead, i) => (
                <div
                  key={lead.id}
                  className="anim-fade-up"
                  style={{ animationDelay: `${i * 25}ms` }}
                >
                  <ProspectCard
                    lead={lead}
                    isSelected={selectedLead?.id === lead.id}
                    onSelect={handleSelectLead}
                    onAuditNow={handleLeadAudit}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Multi-Agent Intelligence & Approval Gate */}
          <div className="space-y-4 anim-slide-right d-300 min-w-0">

            <PipelineStepper
              steps={selectedAudit?.pipeline ?? []}
              activeStep={isRunning ? activeStep : selectedAudit ? 5 : -1}
              isRunning={isRunning}
              error={auditError}
              onRetry={() => runAudit()}
            />

            {selectedAudit && (
              <>
                <SiteSignalsPanel siteSignals={selectedAudit.siteSignals} mlScore={selectedAudit.mlScore} />
                <AnalystPanel analyst={selectedAudit.analystOutput} />
                <CriticPanel critic={selectedAudit.criticAudit} writerDraft={selectedAudit.writerDraft} />
                <ApprovalBox
                  key={selectedLead?.id ?? selectedAudit.businessName}
                  critic={selectedAudit.criticAudit}
                  businessName={selectedAudit.businessName}
                  leadId={selectedLead?.id}
                  initialEmail={selectedAudit.writerDraft?.initialEmail}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  currentStatus={selectedLead?.status ?? "pending"}
                />
              </>
            )}

            {!selectedAudit && !isRunning && (
              <div
                className="rounded-2xl flex flex-col items-center justify-center min-h-[400px] anim-fade-in p-8 text-center"
                style={{
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <div className="space-y-5 max-w-md mx-auto">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                    style={{
                      background: "rgba(37,99,235,0.08)",
                      border: "1px solid rgba(37,99,235,0.15)",
                    }}
                  >
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>
                      Select a prospect or run a live audit
                    </h3>
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-3)" }}>
                      Choose any local business from the queue or input a new one in the Command Bar to run the complete 5-step Gemini intelligence chain.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    {["Signal Extractor", "ML Scorer", "Analyst", "Writer", "Critic"].map((s, i) => (
                      <div key={s} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {["🔍", "🧠", "🤖", "✍️", "🧪"][i]}
                        </div>
                        <span className="text-[10px] font-semibold tracking-wide" style={{ color: "var(--text-3)" }}>
                          {s.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 mt-8"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-md overflow-hidden flex items-center justify-center p-0.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
              <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
                <path d="M5 7h18l-12 14h12" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white tracking-wider">ZERO<span className="text-blue-500 ml-0.5">COLD</span></span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            Google Cloud BigQuery ML · Gemini Intelligence · Cloud Firestore · Team: Code Ruptors · Startup Buildathon India 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
