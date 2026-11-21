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
      className="kpi-card anim-fade-up px-5 py-5 sm:px-6 sm:py-6 flex flex-col gap-3 min-w-0"
      style={{ animationDelay: animDelay }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="section-label truncate">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(6, 182, 212, 0.12)", border: "1px solid rgba(34, 211, 238, 0.25)" }}
        >
          {icon}
        </div>
      </div>
      <div>
        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums leading-none break-words">
          {value}
        </span>
        {sub && (
          <p className="text-xs sm:text-sm mt-2 leading-snug" style={{ color: "var(--text-2)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
