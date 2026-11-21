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
      senderOffer: "high-converting dental website, WhatsApp appointment funnel & local SEO",
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
      senderOffer: "conversion redesign, Core Web Vitals optimization & schema deployment",
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
      senderOffer: "automated trial class booking landing page & WhatsApp lead capture",
    },
  },
];

function ZLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-lg overflow-hidden flex items-center justify-center p-0.5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-sm shadow-blue-500/20 shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M5 7h18l-12 14h12" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7l-8 10" stroke="rgba(96,165,250,0.85)" strokeWidth="1.8" strokeLinecap="round" />
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
    setLeads((prev) => {
      const remaining = prev.filter((l) => l.id !== id);
      if (selectedLead?.id === id) {
        const next = remaining[0] ?? null;
        setSelectedLead(next);
        setAuditResult(next?.auditResult ? (next.auditResult as unknown as AuditResult) : null);
        setActiveStep(next?.auditResult ? 5 : -1);
      }
      return remaining;
    });

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
    <div className="relative min-h-screen flex flex-col">
      <div className="bg-gradient-layer" />

      {/* ═══ TOP WORKSPACE HEADER ═══ */}
      <header className="sticky top-0 z-50 nav-blur">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
              <ZLogo size={32} />
              <div className="flex items-baseline tracking-wider select-none">
                <span className="text-lg font-black tracking-tight text-white">ZERO</span>
                <span className="text-lg font-black tracking-tight text-blue-500 ml-1">COLD</span>
              </div>
            </Link>

            <div
              className="hidden md:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold max-w-[340px] truncate"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-2)", background: "rgba(255,255,255,0.02)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{activeModelBadge}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 ml-auto min-w-0">
            {/* Sync mode badge */}
            {user ? (
              <div
                className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#86efac",
                }}
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[160px]">{user.displayName ?? user.email}</span>
              </div>
            ) : (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(37,99,235,0.1)",
                  border: "1px solid rgba(37,99,235,0.22)",
                  color: "#93c5fd",
                }}
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>Demo Workspace</span>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:text-white cursor-pointer"
              style={{ color: "var(--text-2)", border: "1px solid var(--border)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{user ? "Sign out" : "Exit Demo"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-[1800px] mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* ═══ KPI STRIP ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Total Prospects"
            value={kpis.total}
            sub="audited in your workspace"
            icon={<BarChart3 className="w-4 h-4 text-blue-400" />}
            animDelay="0ms"
          />
          <KpiCard
            label="Avg Digital Gap"
            value={kpis.avgGap ? `${kpis.avgGap}/100` : "—"}
            sub="higher = stronger buying urgency"
            icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
            animDelay="60ms"
          />
          <KpiCard
            label="Critic Groundedness"
            value={kpis.avgGround ? `${kpis.avgGround}%` : "—"}
            sub="DOM evidence verification rate"
            icon={<Shield className="w-4 h-4 text-blue-400" />}
            animDelay="120ms"
          />
          <KpiCard
            label="Approved Outreach"
            value={kpis.approved}
            sub="verified & ready for dispatch"
            icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />}
            animDelay="180ms"
          />
        </div>

        {/* ═══ LIVE AUDIT COMMAND BAR ═══ */}
        <div className="glass-lg p-4 sm:p-5 anim-fade-up d-200 space-y-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(37,99,235,0.14)", border: "1px solid rgba(37,99,235,0.25)" }}
              >
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                  Live Audit Command Bar
                </h2>
                <p className="text-xs" style={{ color: "var(--text-2)" }}>
                  Enter any prospect below to trigger Cheerio scraping, BigQuery ML scoring, and the 3-agent Gemini chain
                </p>
              </div>
            </div>

            {/* Quick-Fill Sample Presets for Live Demos */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Quick-fill sample:</span>
              {QUICK_FILL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm(preset.form)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer hover:border-blue-500/40 hover:text-white"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    color: "var(--text-2)",
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
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                  title="Clear form fields"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Primary Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.4fr_1.3fr_1fr_0.9fr_0.65fr_0.65fr_auto] gap-2.5">
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
              className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm sm:text-base font-semibold whitespace-nowrap sm:col-span-2 lg:col-span-2 xl:col-span-1"
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

          {/* Secondary Service Offer Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 shrink-0 hidden sm:inline">
                Agency Offer:
              </span>
              <input
                placeholder="Your Service Offer (e.g. web redesign, local SEO & WhatsApp booking automation)"
                value={form.senderOffer}
                onChange={(e) => set("senderOffer")(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAudit()}
                className="input px-3 py-1.5 text-xs sm:text-sm w-full"
              />
            </div>
          </div>
        </div>

        {/* ═══ SPLIT WORKSPACE ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)] gap-4 xl:gap-5 items-start">
          {/* Left Column — Prospect Queue */}
          <div className="space-y-3 anim-fade-up d-250 lg:sticky lg:top-[72px]">
            {/* Search & Sort Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search prospects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 pr-7 py-2 text-xs sm:text-sm w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setSortBy((s) => (s === "recent" ? "score" : "recent"))}
                className="text-xs font-semibold px-2.5 py-2 rounded-lg shrink-0 transition-colors cursor-pointer hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  color: "var(--text-2)",
                }}
                title="Toggle sort order between most recent and highest ML score"
              >
                {sortBy === "score" ? "Score ↓" : "Recent ↓"}
              </button>
            </div>

            {/* Filter Tabs */}
            <div
              className="grid grid-cols-4 gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)" }}
            >
              {(["all", "pending", "approved", "rejected"] as TabFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="text-xs font-semibold py-1.5 px-1.5 rounded-lg transition-all duration-200 capitalize truncate cursor-pointer"
                  style={
                    tab === t
                      ? { background: "rgba(37,99,235,0.2)", color: "#93c5fd", border: "1px solid rgba(37,99,235,0.3)" }
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
                  className="text-center py-12 px-5 rounded-2xl space-y-3"
                  style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.015)" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
                  >
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">Your queue starts at zero</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-2)" }}>
                      Enter a business in the Command Bar above or click a quick-fill sample to run your first live audit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(QUICK_FILL_PRESETS[0].form);
                      businessNameInputRef.current?.focus();
                    }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Pre-fill sample prospect ↑
                  </button>
                </div>
              )}

              {filteredLeads.length === 0 && leads.length > 0 && (
                <div className="text-center py-10 px-4 rounded-xl border border-white/5">
                  <p className="text-sm font-semibold text-zinc-300">No prospects match this filter</p>
                  <button
                    onClick={() => {
                      setTab("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-blue-400 hover:underline mt-1.5 cursor-pointer"
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
                          className="text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          {selectedLead.websiteUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/audit/${encodeURIComponent(selectedLead.id)}`}
                    target="_blank"
                    className="btn-ghost text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                  >
                    Client Report <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </Link>
                  <button
                    onClick={() => handleLeadAudit(selectedLead)}
                    disabled={isRunning}
                    className="btn-ghost text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-400" /> Re-Audit
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
                className="rounded-2xl flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] anim-fade-in p-6 sm:p-10 text-center"
                style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.015)" }}
              >
                <div className="space-y-5 max-w-lg mx-auto">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                    style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
                  >
                    <Target className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-1)" }}>
                      Ready to run your 5-stage intelligence audit
                    </h3>
                    <p className="text-xs sm:text-sm mt-2 leading-relaxed" style={{ color: "var(--text-2)" }}>
                      Enter a business in the Command Bar above—or click one of the quick-fill sample pills—and click{" "}
                      <span className="text-white font-semibold">Run Audit</span> to execute live DOM scraping, BigQuery ML lead scoring, and the 3-agent Gemini chain.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2 flex-wrap">
                    {PIPELINE_ICONS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex flex-col items-center gap-1.5">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
                          >
                            <Icon className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-[10px] font-semibold tracking-wide" style={{ color: "var(--text-2)" }}>
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
            <span className="text-xs font-bold text-white tracking-wider">
              ZERO<span className="text-blue-500 ml-0.5">COLD</span>
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            Google Cloud BigQuery ML · Gemini Multi-Agent Chain · Cloud Firestore · Team: Code Ruptors · Startup Buildathon India 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
