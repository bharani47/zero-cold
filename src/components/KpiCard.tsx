interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  animDelay?: string;
  accentColor?: string;
}

export function KpiCard({ label, value, sub, icon, animDelay = "0ms" }: KpiCardProps) {
  return (
    <div
      className="kpi-card anim-fade-up px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-3 min-w-0"
      style={{ animationDelay: animDelay }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="section-label truncate">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.18)" }}
        >
          {icon}
        </div>
      </div>
      <div>
        <span className="text-2xl sm:text-4xl font-black text-zinc-50 tracking-tight tabular-nums leading-none break-words">
          {value}
        </span>
        {sub && (
          <p className="text-[11px] sm:text-xs mt-1.5 leading-snug" style={{ color: "var(--text-2)" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}
