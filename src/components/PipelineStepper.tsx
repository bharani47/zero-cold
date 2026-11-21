"use client";
import { CheckCircle, AlertCircle, Zap, RotateCcw } from "lucide-react";
import type { PipelineStep } from "@/types/audit";

interface PipelineStepperProps {
  steps: PipelineStep[];
  activeStep: number;
  isRunning: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const STEPS = [
  { label: "Signal Extractor", meta: "cheerio · fetch", emoji: "🔍" },
  { label: "ML Lead Scorer",   meta: "logistic regression", emoji: "🧠" },
  { label: "Analyst Agent",    meta: "Gemini Flash", emoji: "🤖" },
  { label: "Writer Agent",     meta: "Gemini Pro", emoji: "✍️" },
  { label: "Critic Agent",     meta: "Gemini Flash", emoji: "🧪" },
];

function ModelTag({ model }: { model: string }) {
  const isPro   = model.includes("pro") && !model.includes("flash");
  const label   = model.length > 22 ? model.split("-").slice(-3).join("-") : model;
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
      style={isPro
        ? { color: "#60a5fa", border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.1)" }
        : { color: "var(--text-2)", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }
      }
    >
      {label}
    </span>
  );
}

export function PipelineStepper({ steps, activeStep, isRunning, error, onRetry }: PipelineStepperProps) {
  const pct = activeStep < 0 ? 0 : Math.min(100, (activeStep / STEPS.length) * 100);

  return (
    <div className="glass-lg p-5 anim-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.18)" }}
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
              Live Agent Pipeline
            </h3>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              5-step Gemini intelligence chain
            </p>
          </div>
        </div>

        {isRunning && (
          <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#60a5fa" }}>
            <div className="spinner" style={{ width: 14, height: 14 }} />
            Running Stage {Math.min(activeStep + 1, 5)}/5…
          </span>
        )}
        {!isRunning && activeStep >= 5 && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Complete (5/5)
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="progress-track mb-4">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, "--w": `${pct}%` } as React.CSSProperties}
        />
      </div>

      {/* Steps */}
      <div className="space-y-0.5">
        {STEPS.map((s, i) => {
          const done     = i < activeStep && !isRunning ? true : i < activeStep;
          const active   = i === activeStep && isRunning;
          const hasErr   = !!error && (activeStep === i || (activeStep < 0 && i === 0));
          const stepData = steps[i];

          return (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200"
              style={active ? { background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" } : {}}
            >
              {/* Step indicator */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {hasErr ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : done ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : active ? (
                  <div className="spinner" style={{ width: 14, height: 14 }} />
                ) : (
                  <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold transition-colors duration-200"
                  style={{
                    color: done ? "var(--text-1)" : active ? "#f0f0f4" : "var(--text-3)",
                  }}
                >
                  {s.label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>{s.meta}</p>
              </div>

              {/* Model + latency */}
              {stepData ? (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                  <span className="hidden sm:inline-flex"><ModelTag model={stepData.model} /></span>
                  <span
                    className="text-xs font-mono tabular-nums"
                    style={{ color: "var(--text-3)" }}
                  >
                    {stepData.latencyMs}ms
                  </span>
                </div>
              ) : active ? (
                <div className="dot-loader flex gap-1">
                  <span /><span /><span />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {error && (
        <div
          className="mt-3 flex items-center justify-between gap-3 text-xs rounded-lg px-3.5 py-2.5"
          style={{
            color: "#f87171",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 font-semibold transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
