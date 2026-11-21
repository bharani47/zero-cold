"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  Shield,
  CheckCircle2,
  BarChart3,
  Zap,
  ArrowRight,
  Sparkles,
  Search,
  LogOut,
  Globe,
  Cpu,
  SearchCheck,
  PenTool,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  X,
  Star,
  Cloud,
  HardDrive,
  Download,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { FirestoreLead } from "@/lib/firebase";
import type { AuditResult } from "@/types/audit";
import { KpiCard } from "@/components/KpiCard";
import { ProspectCard } from "@/components/ProspectCard";
import { PipelineStepper } from "@/components/PipelineStepper";
import { SiteSignalsPanel } from "@/components/SiteSignalsPanel";
import { AnalystPanel } from "@/components/AnalystPanel";
import { CriticPanel } from "@/components/CriticPanel";
import { ApprovalBox, type ApprovedOutreachPack } from "@/components/ApprovalBox";
import { StatusPill } from "@/components/StatusPill";

type TabFilter = "all" | "pending" | "approved" | "rejected";
type SortOrder = "recent" | "score";

interface AuditForm {
  businessName: string;
  websiteUrl: string;
  niche: string;
  city: string;
  googleRating: string;
  reviewCount: string;
  senderOffer: string;
}

const NXT_APEX_OFFER_CHIPS = [
  "Nxt Apex: Full-stack web redesign, Core Web Vitals & local SEO",
  "Nxt Apex: AI WhatsApp appointment booking & lead automation",
  "Nxt Apex: Custom web app & conversion funnel engineering",
];

const QUICK_FILL_PRESETS: Array<{ label: string; form: AuditForm }> = [
  {
    label: "SmileCare Dental (No Website)",
    form: {
      businessName: "SmileCare Dental Clinic",
      websiteUrl: "",
      niche: "Dental Clinic",
      city: "Chennai",
      googleRating: "4.8",
      reviewCount: "165",
      senderOffer: "Nxt Apex: high-converting dental website, WhatsApp appointment funnel & local SEO",
    },
  },
  {
    label: "Example Web Studio (Live URL)",
    form: {
      businessName: "Example Web Studio",
      websiteUrl: "https://example.com",
      niche: "B2B Services",
      city: "Bengaluru",
      googleRating: "4.6",
      reviewCount: "92",
      senderOffer: "Nxt Apex: conversion redesign, Core Web Vitals optimization & schema deployment",
    },
  },
  {
    label: "IronPulse Fitness (High Reviews)",
    form: {
      businessName: "IronPulse Fitness & Recovery",
      websiteUrl: "",
      niche: "Fitness & Gym",
      city: "Mumbai",
      googleRating: "4.7",
      reviewCount: "210",
      senderOffer: "Nxt Apex: automated trial class booking landing page & AI WhatsApp lead capture",
    },
  },
];

function ZLogo({ size = 34 }: { size?: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center p-1 bg-gradient-to-br from-cyan-400 via-cyan-500 to-teal-600 shadow-sm shadow-cyan-500/25 shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M5 7h18l-12 14h12" stroke="#031117" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7l-8 10" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const PIPELINE_ICONS = [
  { label: "Extractor", icon: Globe },
  { label: "BQML Scorer", icon: Cpu },
  { label: "Analyst", icon: SearchCheck },
  { label: "Writer", icon: PenTool },
  { label: "Critic", icon: ShieldCheck },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [leads, setLeads] = useState<FirestoreLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<FirestoreLead | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabFilter>("all");
  const [sortBy, setSortBy] = useState<SortOrder>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const businessNameInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<AuditForm>({
    businessName: "",
    websiteUrl: "",
    niche: "",
    city: "",
    googleRating: "",
    reviewCount: "",
    senderOffer: "",
  });

  const storageKey = `zc_leads_${user?.uid ?? "guest"}`;

  // Auth guard + initial localStorage hydration inside auth callback
  useEffect(() => {
    const hydrateFromStorage = (uid?: string) => {
      try {
        const raw = window.localStorage.getItem(`zc_leads_${uid ?? "guest"}`);
        if (raw) {
          const parsed = JSON.parse(raw) as FirestoreLead[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeads(parsed);
            setSelectedLead((prev) => prev ?? parsed[0]);
            if (parsed[0]?.auditResult) {
              setAuditResult((prev) => prev ?? (parsed[0].auditResult as unknown as AuditResult));
              setActiveStep((prev) => (prev === -1 ? 5 : prev));
            }
          }
        }
      } catch {
        // ignore storage errors
      }
    };

    if (!auth) {
      const t = setTimeout(() => {
        hydrateFromStorage();
        setAuthLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        if (window.sessionStorage.getItem("zc_guest") === "1") {
          hydrateFromStorage();
          setAuthLoading(false);
          return;
        }
        router.replace("/login");
      } else {
        setUser(u);
        hydrateFromStorage(u.uid);
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // Save leads to localStorage whenever leads change
  useEffect(() => {
    if (authLoading) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(leads));
    } catch {
      // ignore quota/storage errors
    }
  }, [leads, authLoading, storageKey]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Firestore live sync when signed in with Google
  useEffect(() => {
    if (!db || !user) return;
    try {
      const unsub: Unsubscribe = onSnapshot(
        query(collection(db, "leads"), where("ownerUid", "==", user.uid)),
        (snap) => {
          const remote = snap.docs.map((d) => ({ ...(d.data() as FirestoreLead), id: d.id }));
          if (remote.length === 0) return;
          setLeads((prev) => {
            const ids = new Set(remote.map((l) => l.id));
            const merged = [...remote, ...prev.filter((l) => !ids.has(l.id))];
            return merged.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
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
  }, [user]);

  const filteredLeads = useMemo(() => {
    let list = tab === "all" ? [...leads] : leads.filter((l) => l.status === tab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.niche.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          (l.websiteUrl && l.websiteUrl.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) =>
      sortBy === "score"
        ? b.leadScore - a.leadScore
        : (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
    );
    return list;
  }, [leads, tab, searchQuery, sortBy]);

  const kpis = useMemo(() => {
    const audited = leads.filter((l) => l.auditResult);
    const avg = (fn: (ar: Record<string, unknown>) => number) =>
      audited.length
        ? Math.round(audited.reduce((s, l) => s + fn(l.auditResult as Record<string, unknown>), 0) / audited.length)
        : 0;
    return {
      total: leads.length,
      avgGap: avg((ar) => ((ar?.analystOutput as Record<string, unknown>)?.digitalGapScore as number) ?? 0),
      avgGround: avg((ar) => ((ar?.criticAudit as Record<string, unknown>)?.groundednessScore as number) ?? 0),
      approved: leads.filter((l) => l.status === "approved").length,
    };
  }, [leads]);

  const set = (k: keyof AuditForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

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

  async function handleDeleteLead(id: string) {
    const remaining = leads.filter((l) => l.id !== id);
    setLeads(remaining);
    if (selectedLead?.id === id) {
      const next = remaining[0] ?? null;
      setSelectedLead(next);
      setAuditResult(next?.auditResult ? (next.auditResult as unknown as AuditResult) : null);
      setActiveStep(next?.auditResult ? 5 : -1);
      setAuditError(null);
    }

    if (db && user) {
      try {
        await deleteDoc(doc(db, "leads", id));
      } catch (err) {
        console.warn("Could not delete lead from Firestore:", err);
      }
    }
  }

  async function runAudit(overrides?: Partial<AuditForm & { leadId?: string }>) {
    const data: AuditForm & { leadId?: string } = { ...form, ...overrides };
    if (!data.businessName.trim()) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!data.leadId || data.leadId !== selectedLead?.id) {
      setAuditResult(null);
      if (!data.leadId) setSelectedLead(null);
    }

    setIsRunning(true);
    setAuditError(null);
    setActiveStep(0);

    const stepsDelays = [1200, 2600, 5200, 9000];
    timersRef.current = stepsDelays.map((d, i) => setTimeout(() => setActiveStep(i + 1), d));

    const parsedRating = Math.min(5, Math.max(0, parseFloat(data.googleRating || "0") || 0));
    const parsedReviews = Math.max(0, parseInt(data.reviewCount || "0", 10) || 0);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: data.businessName.trim(),
          niche: data.niche.trim() || "Local Business",
          city: data.city.trim() || "Your City",
          websiteUrl: data.websiteUrl.trim() || "",
          googleRating: parsedRating,
          reviewCount: parsedReviews,
          senderOffer: data.senderOffer.trim() || "web redesign, local SEO & conversion automation",
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
        businessName: data.businessName.trim(),
        niche: data.niche.trim() || "Local Business",
        city: data.city.trim() || "Your City",
        websiteUrl: data.websiteUrl.trim() || "",
        googleRating: parsedRating > 0 ? parsedRating : undefined,
        reviewCount: parsedReviews > 0 ? parsedReviews : undefined,
        leadScore: result.mlScore.leadScore,
        priorityTier: result.mlScore.priorityTier,
        status: "pending",
        ownerUid: user?.uid,
        auditResult: result as unknown as Record<string, unknown>,
        createdAt: originalCreatedAt ?? Date.now(),
        updatedAt: Date.now(),
      };

      setSelectedLead(updatedLead);
      setLeads((prev) => [updatedLead, ...prev.filter((l) => l.id !== id)]);

      if (db && user) {
        try {
          await setDoc(doc(db, "leads", id), updatedLead);
        } catch (dbErr) {
          console.warn("Could not persist lead to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      timersRef.current.forEach(clearTimeout);
      let msg = err instanceof Error ? err.message : "Audit request failed";
      try {
        const parsed = typeof msg === "string" && msg.startsWith("{") ? JSON.parse(msg) : null;
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        }
      } catch {
        // Keep original message
      }
      setAuditError(msg);
      setActiveStep(0);
    } finally {
      setIsRunning(false);
    }
  }

  async function handleLeadAudit(lead: FirestoreLead) {
    setSelectedLead(lead);
    const nextForm: AuditForm = {
      businessName: lead.businessName,
      websiteUrl: lead.websiteUrl ?? "",
      niche: lead.niche,
      city: lead.city,
      googleRating: lead.googleRating != null ? String(lead.googleRating) : "",
      reviewCount: lead.reviewCount != null ? String(lead.reviewCount) : "",
      senderOffer: form.senderOffer,
    };
    setForm(nextForm);
    await runAudit({
      ...nextForm,
      leadId: lead.id,
    });
  }

  async function handleApprove(pack: ApprovedOutreachPack) {
    if (!selectedLead) return;

    const currentAudit = (selectedLead.auditResult as unknown as AuditResult) || auditResult;
    const updatedAudit = currentAudit
      ? {
          ...currentAudit,
          finalEmail: pack.finalEmail,
          criticAudit: {
            ...(currentAudit.criticAudit || {}),
            finalEmail: pack.finalEmail,
            followUpEmail: pack.followUpEmail,
            whatsappOrLinkedinDm: pack.whatsappOrLinkedinDm,
          },
        }
      : undefined;

    const updatedLead: FirestoreLead = {
      ...selectedLead,
      status: "approved",
      updatedAt: Date.now(),
      auditResult: updatedAudit as unknown as Record<string, unknown>,
    };

    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
    setSelectedLead(updatedLead);
    if (updatedAudit) {
      setAuditResult(updatedAudit as AuditResult);
    }

    if (db && user) {
      try {
        await updateDoc(doc(db, "leads", selectedLead.id), {
          status: "approved",
          updatedAt: Date.now(),
          "auditResult.finalEmail": pack.finalEmail,
          "auditResult.criticAudit.finalEmail": pack.finalEmail,
          "auditResult.criticAudit.followUpEmail": pack.followUpEmail,
          "auditResult.criticAudit.whatsappOrLinkedinDm": pack.whatsappOrLinkedinDm,
        });
      } catch (err) {
        console.warn("Firestore update error:", err);
      }
    }
  }

  async function handleReject() {
    if (!selectedLead) return;

    const updatedLead: FirestoreLead = {
      ...selectedLead,
      status: "rejected",
      updatedAt: Date.now(),
    };

    setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updatedLead : l)));
    setSelectedLead(updatedLead);

    if (db && user) {
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

  const activeModelBadge = useMemo(() => {
    if (selectedAudit?.pipeline?.length) {
      const models = Array.from(
        new Set(
          selectedAudit.pipeline
            .map((p) => p.model)
            .filter((m) => m.toLowerCase().includes("gemini"))
        )
      );
      if (models.length) return models.join(" · ");
    }
    return "Gemini Multi-Agent + BQML";
  }, [selectedAudit]);

  const tabCounts = {
    all: leads.length,
    pending: leads.filter((l) => l.status === "pending").length,
    approved: leads.filter((l) => l.status === "approved").length,
    rejected: leads.filter((l) => l.status === "rejected").length,
  };

  function handleExportCsv() {
    if (leads.length === 0) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://zero-cold.vercel.app";
    const headers = [
      "Business Name",
      "Niche",
      "City",
      "Website URL",
      "Google Rating",
      "Reviews",
      "ML Lead Score",
      "Priority Tier",
      "Status",
      "Client Audit Report URL",
      "Cold Email Subject",
      "Cold Email Body",
      "48h Follow-Up Subject",
      "48h Follow-Up Body",
      "WhatsApp / LinkedIn DM",
    ];
    const escapeCsv = (val: unknown) => {
      const s = String(val ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = leads.map((l) => {
      const ar = l.auditResult as unknown as AuditResult | undefined;
      const critic = ar?.criticAudit;
      return [
        l.businessName,
        l.niche,
        l.city,
        l.websiteUrl || "",
        l.googleRating ?? "",
        l.reviewCount ?? "",
        l.leadScore,
        l.priorityTier,
        l.status,
        `${origin}/audit/${encodeURIComponent(l.id)}`,
        critic?.finalEmail?.subject ?? "",
        critic?.finalEmail?.body ?? "",
        critic?.followUpEmail?.subject ?? "",
        critic?.followUpEmail?.body ?? "",
        critic?.whatsappOrLinkedinDm ?? "",
      ]
        .map(escapeCsv)
        .join(",");
    });
    const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zerocold-nxtapex-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSignOut() {
    try {
      window.sessionStorage.removeItem("zc_guest");
    } catch {
      // ignore
    }
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
    }
    router.push("/");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: 36, height: 36 }} />
          <p className="text-xs font-mono" style={{ color: "var(--text-2)" }}>
            Loading ZeroCold Workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-grid-pattern">
      <div className="bg-gradient-layer" />

      {/* ═══ TOP WORKSPACE HEADER ═══ */}
      <header className="sticky top-0 z-50 nav-blur w-full">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <ZLogo size={34} />
              <div className="flex items-baseline tracking-wider select-none">
                <span className="text-xl font-black tracking-tight text-white">ZERO</span>
                <span className="text-xl font-black tracking-tight text-cyan-400 ml-1">COLD</span>
              </div>
            </Link>

            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full hover:border-cyan-400/50 transition-colors"
              style={{
                background: "rgba(6,182,212,0.12)",
                border: "1px solid rgba(34,211,238,0.28)",
                color: "#67e8f9",
              }}
            >
              by NXT APEX ↗
            </a>

            <div
              className="hidden lg:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold max-w-[340px] truncate"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-2)", background: "rgba(255,255,255,0.03)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{activeModelBadge}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto min-w-0">
            {leads.length > 0 && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all hover:text-white cursor-pointer"
                style={{ color: "#67e8f9", border: "1px solid rgba(34,211,238,0.32)", background: "rgba(6,182,212,0.1)" }}
                title="Export audited prospects and verified 3-channel pitches to CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export CSV ({leads.length})</span>
              </button>
            )}
            {/* Sync mode badge */}
            {user ? (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#86efac",
                }}
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[160px]">{user.displayName ?? user.email}</span>
              </div>
            ) : (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium"
                style={{
                  background: "rgba(6,182,212,0.12)",
                  border: "1px solid rgba(34,211,238,0.28)",
                  color: "#67e8f9",
                }}
              >
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Demo Workspace</span>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all hover:text-cyan-300 cursor-pointer"
              style={{ color: "var(--text-1)", border: "1px solid var(--border)" }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{user ? "Sign out" : "Exit Demo"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1800px] mx-auto w-full px-4 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* ═══ KPI STRIP ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <KpiCard
            label="Total Prospects"
            value={kpis.total}
            sub="audited in your workspace"
            icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
            animDelay="0ms"
          />
          <KpiCard
            label="Avg Digital Gap"
            value={kpis.avgGap ? `${kpis.avgGap}/100` : "—"}
            sub="higher = stronger buying urgency"
            icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
            animDelay="60ms"
          />
          <KpiCard
            label="Critic Groundedness"
            value={kpis.avgGround ? `${kpis.avgGround}%` : "—"}
            sub="DOM evidence verification rate"
            icon={<Shield className="w-4 h-4 text-cyan-400" />}
            animDelay="120ms"
          />
          <KpiCard
            label="Approved Outreach"
            value={kpis.approved}
            sub="verified & ready for dispatch"
            icon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            animDelay="180ms"
          />
        </div>

        {/* ═══ LIVE AUDIT COMMAND BAR ═══ */}
        <div className="glass-lg p-5 sm:p-6 anim-fade-up d-200 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(6,182,212,0.14)", border: "1px solid rgba(34,211,238,0.3)" }}
              >
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>
                  Live Audit Command Bar
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>
                  Enter any prospect below to trigger Cheerio scraping, BigQuery ML scoring, and the 3-agent Gemini chain
                </p>
              </div>
            </div>

            {/* Quick-Fill Sample Presets for Live Demos */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-300 mr-1">Quick-fill sample:</span>
              {QUICK_FILL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm(preset.form)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:border-cyan-400/50 hover:text-cyan-300"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid var(--border)",
                    color: "var(--text-1)",
                  }}
                >
                  {preset.label}
                </button>
              ))}
              {(form.businessName || form.websiteUrl || form.niche) && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      businessName: "",
                      websiteUrl: "",
                      niche: "",
                      city: "",
                      googleRating: "",
                      reviewCount: "",
                      senderOffer: "",
                    })
                  }
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                  title="Clear form fields"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Primary Inputs Row — Stage Projector & Wide Desktop Safe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-[1.4fr_1.3fr_1fr_0.9fr_0.75fr_0.75fr_auto] gap-2.5">
            <input
              ref={businessNameInputRef}
              placeholder="Business Name *"
              value={form.businessName}
              onChange={(e) => set("businessName")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-sm sm:text-base w-full min-w-0"
            />
            <input
              placeholder="Website URL (leave empty if none)"
              value={form.websiteUrl}
              onChange={(e) => set("websiteUrl")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-sm sm:text-base w-full min-w-0"
            />
            <input
              placeholder="Niche (e.g. Dental, Gym)"
              value={form.niche}
              onChange={(e) => set("niche")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-sm sm:text-base w-full min-w-0"
            />
            <input
              placeholder="City (e.g. Chennai)"
              value={form.city}
              onChange={(e) => set("city")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3.5 py-2.5 text-sm sm:text-base w-full min-w-0"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Rating ★"
              title="Google Rating (0.0 – 5.0) for BigQuery ML Scorer"
              value={form.googleRating}
              onChange={(e) => set("googleRating")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3 py-2.5 text-sm sm:text-base w-full min-w-0"
            />
            <input
              type="number"
              min="0"
              placeholder="Reviews #"
              title="Google Review Count for BigQuery ML Scorer"
              value={form.reviewCount}
              onChange={(e) => set("reviewCount")(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              className="input px-3 py-2.5 text-sm sm:text-base w-full min-w-0"
            />
            <button
              onClick={() => runAudit()}
              disabled={isRunning || !form.businessName.trim()}
              className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm sm:text-base font-bold whitespace-nowrap sm:col-span-2 lg:col-span-2 2xl:col-span-1"
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

          {/* Secondary Service Offer Row + Nxt Apex Service Chips */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2.5">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-300 shrink-0 hidden sm:inline">
                Agency Offer:
              </span>
              <input
                placeholder="Your Service Offer (e.g. Nxt Apex web redesign, local SEO & AI WhatsApp booking automation)"
                value={form.senderOffer}
                onChange={(e) => set("senderOffer")(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
                className="input px-3.5 py-2 text-xs sm:text-sm w-full min-w-0"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {NXT_APEX_OFFER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => set("senderOffer")(chip)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer hover:text-white"
                  style={
                    form.senderOffer === chip
                      ? { background: "rgba(6,182,212,0.18)", border: "1px solid rgba(34,211,238,0.38)", color: "#67e8f9" }
                      : { background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-2)" }
                  }
                >
                  {chip.replace("Nxt Apex: ", "")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SPLIT WORKSPACE ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)] gap-5 items-start">
          {/* Left Column — Prospect Queue */}
          <div className="space-y-3 anim-fade-up d-250 lg:sticky lg:top-[80px]">
            {/* Search & Sort Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search prospects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 pr-8 py-2 text-sm w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setSortBy((s) => (s === "recent" ? "score" : "recent"))}
                className="text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg shrink-0 transition-colors cursor-pointer hover:text-cyan-300"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid var(--border)",
                  color: "var(--text-1)",
                }}
                title="Toggle sort order between most recent and highest ML score"
              >
                {sortBy === "score" ? "Score ↓" : "Recent ↓"}
              </button>
            </div>

            {/* Filter Tabs — 2x2 on laptop/projector so labels NEVER clip, 4x1 on ultrawide */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4 gap-1.5 p-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)" }}
            >
              {(["all", "pending", "approved", "rejected"] as TabFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="text-xs sm:text-sm font-semibold py-2 px-2 rounded-lg transition-all duration-200 capitalize whitespace-nowrap cursor-pointer"
                  style={
                    tab === t
                      ? { background: "rgba(6,182,212,0.18)", color: "#67e8f9", border: "1px solid rgba(34,211,238,0.35)" }
                      : { color: "var(--text-2)" }
                  }
                >
                  {t} ({tabCounts[t]})
                </button>
              ))}
            </div>

            {/* Prospect List */}
            <div className="space-y-2 overflow-y-auto pr-0.5 max-h-[420px] lg:max-h-[calc(100vh-220px)]">
              {leads.length === 0 && (
                <div
                  className="text-center py-12 px-5 rounded-2xl space-y-3.5"
                  style={{ border: "1px dashed rgba(34,211,238,0.22)", background: "rgba(6,182,212,0.03)" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}
                  >
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">Your queue starts at zero</p>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: "var(--text-2)" }}>
                      Enter a business in the Command Bar above or click a quick-fill sample to run your first live audit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(QUICK_FILL_PRESETS[0].form);
                      businessNameInputRef.current?.focus();
                    }}
                    className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    Pre-fill sample prospect ↑
                  </button>
                </div>
              )}

              {filteredLeads.length === 0 && leads.length > 0 && (
                <div className="text-center py-10 px-4 rounded-xl border border-white/8">
                  <p className="text-sm sm:text-base font-semibold text-slate-200">No prospects match this filter</p>
                  <button
                    onClick={() => {
                      setTab("all");
                      setSearchQuery("");
                    }}
                    className="text-xs sm:text-sm text-cyan-400 hover:underline mt-1.5 cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {filteredLeads.map((lead, i) => (
                <div
                  key={lead.id}
                  className="anim-fade-up"
                  style={{ animationDelay: `${Math.min(i * 25, 200)}ms` }}
                >
                  <ProspectCard
                    lead={lead}
                    isSelected={selectedLead?.id === lead.id}
                    onSelect={handleSelectLead}
                    onAuditNow={handleLeadAudit}
                    onDelete={handleDeleteLead}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Multi-Agent Intelligence & Approval Gate */}
          <div className="space-y-4 anim-slide-right d-300 min-w-0">
            {/* Active Lead Header Bar when a lead is selected */}
            {selectedLead && (
              <div className="glass-lg px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-black text-white truncate">{selectedLead.businessName}</h2>
                    <StatusPill status={selectedLead.status} />
                    <StatusPill status={selectedLead.priorityTier} />
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1 flex-wrap" style={{ color: "var(--text-2)" }}>
                    <span>{selectedLead.niche}</span>
                    <span>·</span>
                    <span>{selectedLead.city}</span>
                    {selectedLead.googleRating != null && selectedLead.googleRating > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {selectedLead.googleRating} ({selectedLead.reviewCount ?? 0} reviews)
                        </span>
                      </>
                    )}
                    {selectedLead.websiteUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={
                            selectedLead.websiteUrl.startsWith("http")
                              ? selectedLead.websiteUrl
                              : `https://${selectedLead.websiteUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                        >
                          {selectedLead.websiteUrl} <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/audit/${encodeURIComponent(selectedLead.id)}`}
                    target="_blank"
                    className="btn-ghost text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
                  >
                    Client Report <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </Link>
                  <button
                    onClick={() => handleLeadAudit(selectedLead)}
                    disabled={isRunning}
                    className="btn-ghost text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Re-Audit
                  </button>
                </div>
              </div>
            )}

            <PipelineStepper
              steps={selectedAudit?.pipeline ?? []}
              activeStep={isRunning ? activeStep : selectedAudit ? 5 : -1}
              isRunning={isRunning}
              error={auditError}
              onRetry={() => runAudit()}
            />

            {selectedAudit && (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                  <div className="min-w-0">
                    <SiteSignalsPanel siteSignals={selectedAudit.siteSignals} mlScore={selectedAudit.mlScore} />
                  </div>
                  <div className="min-w-0">
                    <AnalystPanel analyst={selectedAudit.analystOutput} />
                  </div>
                </div>
                <CriticPanel critic={selectedAudit.criticAudit} writerDraft={selectedAudit.writerDraft} />
                <ApprovalBox
                  key={`${selectedLead?.id ?? selectedAudit.businessName}-${selectedLead?.updatedAt ?? 0}`}
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
                className="rounded-2xl flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px] anim-fade-in p-6 sm:p-10 text-center"
                style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="space-y-5 max-w-lg mx-auto">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto anim-float"
                    style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(34,211,238,0.28)" }}
                  >
                    <Target className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
                      Ready to run your 5-stage intelligence audit
                    </h3>
                    <p className="text-sm sm:text-base mt-2 leading-relaxed" style={{ color: "var(--text-2)" }}>
                      Enter a business in the Command Bar above—or click one of the quick-fill sample pills—and click{" "}
                      <span className="text-cyan-300 font-semibold">Run Audit</span> to execute live DOM scraping, BigQuery ML lead scoring, and the 3-agent Gemini chain.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 flex-wrap">
                    {PIPELINE_ICONS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex flex-col items-center gap-1.5">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(34,211,238,0.2)" }}
                          >
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-2)" }}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-8" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ZLogo size={24} />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wider">
              ZERO<span className="text-cyan-400 ml-0.5">COLD</span>
            </span>
          </div>
          <span className="text-xs sm:text-sm" style={{ color: "var(--text-2)" }}>
            ZeroCold Outbound Engine · Built by{" "}
            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-semibold"
            >
              Nxt Apex
            </a>{" "}
            (Web Engineering &amp; Smart AI Automation)
          </span>
        </div>
      </footer>
    </div>
  );
}
