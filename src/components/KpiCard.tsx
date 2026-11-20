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
      className="kpi-card anim-fade-up px-5 py-5 flex flex-col gap-3"
      style={{ animationDelay: animDelay }}
    >
      <div className="flex items-center justify-between">
        <span className="section-label">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.18)" }}
        >
          {icon}
        </div>
      </div>
      <div>
        <span className="text-4xl font-black text-zinc-50 tracking-tight tabular-nums leading-none">
          {value}
        </span>
        {sub && (
          <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}
