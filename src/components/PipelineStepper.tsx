"use client";
import {
  CheckCircle,
  AlertCircle,
  Zap,
  RotateCcw,
  Globe,
  Cpu,
  SearchCheck,
  PenTool,
  ShieldCheck,
} from "lucide-react";
import type { PipelineStep } from "@/types/audit";

interface PipelineStepperProps {
  steps: PipelineStep[];
  activeStep: number;
  isRunning: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const STEPS = [
  { label: "Signal Extractor", meta: "Cheerio DOM · Google PSI", icon: Globe },
  { label: "ML Lead Scorer",   meta: "BigQuery ML Logistic Regression", icon: Cpu },
  { label: "Analyst Agent",    meta: "Gemini Flash · Gap & Benchmark", icon: SearchCheck },
  { label: "Writer Agent",     meta: "Gemini Multi-Touch · 3 Channels", icon: PenTool },
  { label: "Critic Agent",     meta: "Gemini Flash · Groundedness Gate", icon: ShieldCheck },
];

function ModelTag({ model }: { model: string }) {
  const isPro = model.includes("pro") || (model.includes("flash") && !model.includes("lite"));
  const label = model.length > 24 ? model.split("-").slice(-3).join("-") : model;
  return (
    <span
      className="text-[10px] font-mono px-2 py-0.5 rounded-md"
      style={
        isPro
          ? { color: "#93c5fd", border: "1px solid rgba(37,99,235,0.25)", background: "rgba(37,99,235,0.1)" }
          : { color: "var(--text-2)", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }
      }
    >
      {label}
    </span>
  );
}

export function PipelineStepper({ steps, activeStep, isRunning, error, onRetry }: PipelineStepperProps) {
  const pct = activeStep < 0 ? 0 : Math.min(100, (activeStep / STEPS.length) * 100);
  const totalMs = steps.reduce((acc, s) => acc + (s.latencyMs || 0), 0);

  return (
    <div className="glass-lg p-5 anim-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.22)" }}
          >
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
              5-Stage Intelligence Pipeline
            </h3>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              Real-time DOM telemetry → BigQuery ML → 3-Agent Gemini chain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isRunning && (
            <span className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20" style={{ color: "#60a5fa" }}>
              <div className="spinner" style={{ width: 13, height: 13 }} />
              Stage {Math.min(activeStep + 1, 5)}/5 running…
            </span>
          )}
          {!isRunning && activeStep >= 5 && (
            <div className="flex items-center gap-2">
              {totalMs > 0 && (
                <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/3 border border-white/6">
                  {(totalMs / 1000).toFixed(1)}s total
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified (5/5)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress track */}
      <div className="progress-track mb-4">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, "--w": `${pct}%` } as React.CSSProperties}
        />
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {STEPS.map((s, i) => {
          const done     = i < activeStep && !isRunning ? true : i < activeStep;
          const active   = i === activeStep && isRunning;
          const hasErr   = !!error && (activeStep === i || (activeStep < 0 && i === 0));
          const stepData = steps[i];
          const StepIcon = s.icon;

          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
              style={
                active
                  ? { background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)" }
                  : done
                  ? { background: "rgba(255,255,255,0.015)", border: "1px solid transparent" }
                  : { border: "1px solid transparent" }
              }
            >
              {/* Step indicator */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={
                  hasErr
                    ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }
                    : done
                    ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)" }
                    : active
                    ? { background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }
                }
              >
                {hasErr ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                ) : done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : active ? (
                  <div className="spinner" style={{ width: 13, height: 13 }} />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-sm font-semibold transition-colors duration-200 truncate"
                    style={{
                      color: done ? "var(--text-1)" : active ? "#ffffff" : "var(--text-3)",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
                <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{s.meta}</p>
              </div>

              {/* Model + latency */}
              {stepData ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex"><ModelTag model={stepData.model} /></span>
                  <span
                    className="text-xs font-mono tabular-nums px-2 py-0.5 rounded bg-white/3"
                    style={{ color: "var(--text-2)" }}
                  >
                    {stepData.latencyMs}ms
                  </span>
                </div>
              ) : active ? (
                <div className="dot-loader flex gap-1 pr-2">
                  <span /><span /><span />
                </div>
              ) : (
                <span className="text-[11px] font-mono text-zinc-600">0{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div
          className="mt-3 flex items-center justify-between gap-3 text-xs rounded-xl px-3.5 py-2.5"
          style={{
            color: "#fca5a5",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-200 font-semibold transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
