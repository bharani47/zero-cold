"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db, type FirestoreLead } from "@/lib/firebase";
import { SEED_LEADS } from "@/data/seedLeads";
import type { AuditResult } from "@/types/audit";
import {
  Shield, AlertTriangle, ArrowLeft,
  Calendar, Gauge, Globe, ExternalLink
} from "lucide-react";

function ClientAuditReportContent() {
  const params = useParams();
  const id = params?.id as string;

  const localSeed = SEED_LEADS.find((l) => l.id === id);

  const [lead, setLead] = useState<FirestoreLead | null>(localSeed?.auditResult ? localSeed : null);
  const [loading, setLoading] = useState<boolean>(!localSeed?.auditResult);

  useEffect(() => {
    if (!id || (localSeed && localSeed.auditResult)) return;

    let isCancelled = false;
    async function fetchLead() {
      // First check localStorage fallback (supports Guest Demo Mode & immediate tab previews)
      try {
        if (typeof window !== "undefined") {
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith("zc_leads_")) {
              const raw = window.localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw) as FirestoreLead[];
                const found = parsed.find((item) => item.id === id);
                if (found && found.auditResult && !isCancelled) {
                  setLead(found);
                  setLoading(false);
                  return;
                }
              }
            }
          }
        }
      } catch {
        // ignore localStorage read errors
      }

      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "leads", id));
        if (!isCancelled && snap.exists()) {
          setLead({ ...(snap.data() as FirestoreLead), id: snap.id });
        }
      } catch (err) {
        console.warn("Error fetching lead audit:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchLead();

    return () => {
      isCancelled = true;
    };
  }, [id, localSeed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-400">Loading verified digital footprint audit...</p>
        </div>
      </div>
    );
  }

  if (!lead || !lead.auditResult) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 glass-lg p-5 sm:p-8 rounded-2xl border border-white/10">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">Report Not Found</h1>
          <p className="text-sm text-zinc-400">
            This digital audit report link may have expired or is still being generated.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg mt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to ZeroCold
          </Link>
        </div>
      </div>
    );
  }

  const audit = lead.auditResult as unknown as AuditResult;
  const score = lead.leadScore ?? 0;
  const scoreColor = score >= 65 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col selection:bg-blue-600/30">
      {/* Subtle top ambient glow */}
      <div className="bg-gradient-layer" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 nav-blur px-4 sm:px-6 py-3.5 border-b border-white/8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Workspace
            </Link>
            <span className="text-zinc-700">|</span>
            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold tracking-wide text-zinc-300 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              NXT <span className="text-blue-500">APEX</span> <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Shield className="w-3.5 h-3.5" /> Nxt Apex Verified Footprint Audit
          </div>
        </div>
      </header>

      {/* Main Content Report Container */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 flex-1">

        {/* Hero Banner */}
        <div className="glass-lg p-5 sm:p-8 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Independent Digital Health Audit
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {lead.businessName}
              </h1>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <span>{lead.niche}</span> · <span>{lead.city}</span>
                {lead.websiteUrl && (
                  <>
                    <span>·</span>
                    <a
                      href={lead.websiteUrl.startsWith("http") ? lead.websiteUrl : `https://${lead.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {lead.websiteUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Score Badge */}
            <div className="text-right shrink-0 p-4 rounded-xl bg-white/2 border border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Digital Health Score
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-4xl font-black tabular-nums" style={{ color: scoreColor }}>
                  {score}
                </span>
                <span className="text-sm text-zinc-500">/100</span>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-2"
                style={{
                  color: scoreColor,
                  background: `${scoreColor}15`,
                  border: `1px solid ${scoreColor}30`,
                }}
              >
                {lead.priorityTier ?? "High"} Priority Opportunity
              </span>
            </div>
          </div>
        </div>

        {/* Core Web Vitals (if present) */}
        {audit.siteSignals?.pageSpeed && (
          <div className="glass-lg p-6 rounded-2xl border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2 text-white">
                <Gauge className="w-4 h-4 text-blue-400" /> Google Core Web Vitals (Mobile Performance)
              </h2>
              <span className="text-xs font-mono text-zinc-500">Official Google PSI Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-xl p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-zinc-400 font-medium">Mobile Performance</p>
                <p
                  className="text-2xl font-black mt-1 tabular-nums"
                  style={{
                    color:
                      audit.siteSignals.pageSpeed.mobilePerformanceScore >= 75
                        ? "#4ade80"
                        : audit.siteSignals.pageSpeed.mobilePerformanceScore >= 50
                        ? "#fbbf24"
                        : "#f87171",
                  }}
                >
                  {audit.siteSignals.pageSpeed.mobilePerformanceScore}/100
                </p>
              </div>

              <div className="rounded-xl p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-zinc-400 font-medium">Mobile SEO Score</p>
                <p
                  className="text-2xl font-black mt-1 tabular-nums"
                  style={{
                    color:
                      audit.siteSignals.pageSpeed.seoScore >= 80
                        ? "#4ade80"
                        : audit.siteSignals.pageSpeed.seoScore >= 60
                        ? "#fbbf24"
                        : "#f87171",
                  }}
                >
                  {audit.siteSignals.pageSpeed.seoScore}/100
                </p>
              </div>

              <div className="rounded-xl p-4 bg-white/2 border border-white/5">
                <p className="text-xs text-zinc-400 font-medium">Largest Contentful Paint</p>
                <p
                  className="text-2xl font-black mt-1 tabular-nums"
                  style={{
                    color:
                      audit.siteSignals.pageSpeed.lcpMs <= 2500
                        ? "#4ade80"
                        : audit.siteSignals.pageSpeed.lcpMs <= 4000
                        ? "#fbbf24"
                        : "#f87171",
                  }}
                >
                  {(audit.siteSignals.pageSpeed.lcpMs / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Verified Technical Gaps & Conversion Friction */}
        <div className="glass-lg p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Verified Technical Gaps</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Concrete evidence audited from public DOM signals</p>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {audit.analystOutput?.verifiedGaps?.length ?? 0} Critical Areas
            </span>
          </div>

          <div className="space-y-3">
            {audit.analystOutput?.verifiedGaps?.map((gap, i) => (
              <div
                key={i}
                className="rounded-xl p-4 bg-white/2 border border-white/6 space-y-2 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    {gap.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">{gap.finding}</h3>
                <p className="text-xs text-zinc-400 italic">Evidence: {gap.exactEvidence}</p>
                <p className="text-xs font-medium text-amber-400">↳ Business Impact: {gap.businessImpact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Benchmark Comparison */}
        {audit.analystOutput?.competitorBenchmark && (
          <div className="glass-lg p-6 rounded-2xl border border-white/8 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Local Competitor Benchmark
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed bg-white/2 p-4 rounded-xl border border-white/5">
              {audit.analystOutput.competitorBenchmark}
            </p>
          </div>
        )}

        {/* Action Call to Action Card — Connected to Nxt Apex */}
        <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-r from-blue-900/35 via-indigo-900/25 to-purple-900/20 border border-blue-500/30 text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
            Nxt Apex · Web Engineering &amp; AI Automation
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Let Nxt Apex Fix These Gaps in Under 7 Days
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Where modern web development meets smart AI automation. We build high-converting web architectures, optimize Core Web Vitals, and deploy automated WhatsApp &amp; AI lead capture workflows tailored for {lead.businessName}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://nxt-apex.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-bold rounded-xl w-full sm:w-auto"
            >
              Explore Nxt Apex Solutions <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(
                `Nxt Apex Audit & Fix Roadmap for ${lead.businessName}`
              )}&body=${encodeURIComponent(
                `Hi Nxt Apex Team,\n\nWe reviewed our Digital Health Audit for ${lead.businessName} (Score: ${score}/100) and would like to schedule a 10-minute walkthrough to fix our technical & conversion gaps.`
              )}`}
              className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold rounded-xl w-full sm:w-auto text-zinc-200"
            >
              <Calendar className="w-4 h-4 text-blue-400" /> Book a 10-Min Strategy Call
            </a>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/6 text-center text-xs text-zinc-500">
        Generated by ZeroCold Intelligence Engine · An{" "}
        <a
          href="https://nxt-apex.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline font-semibold"
        >
          Nxt Apex
        </a>{" "}
        Product
      </footer>
    </div>
  );
}

export default function ClientAuditReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-6 text-center">
          <div className="space-y-4">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-zinc-400">Loading verified digital footprint audit...</p>
          </div>
        </div>
      }
    >
      <ClientAuditReportContent />
    </Suspense>
  );
}
