interface StatusPillProps {
  status: "pending" | "approved" | "rejected" | "High" | "Medium" | "Low";
  size?: "sm" | "md";
}

export function StatusPill({ status, size = "sm" }: StatusPillProps) {
  const sz = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  const styles: Record<string, React.CSSProperties> = {
    pending:  { color: "#fbbf24", border: "1px solid rgba(245,158,11,0.22)", background: "rgba(245,158,11,0.1)" },
    approved: { color: "#4ade80", border: "1px solid rgba(34,197,94,0.22)",  background: "rgba(34,197,94,0.1)"  },
    rejected: { color: "#f87171", border: "1px solid rgba(239,68,68,0.22)",  background: "rgba(239,68,68,0.1)"  },
    High:     { color: "#4ade80", border: "1px solid rgba(34,197,94,0.22)",  background: "rgba(34,197,94,0.1)"  },
    Medium:   { color: "#fbbf24", border: "1px solid rgba(245,158,11,0.22)", background: "rgba(245,158,11,0.1)" },
    Low:      { color: "#71717a", border: "1px solid rgba(255,255,255,0.08)",background: "rgba(255,255,255,0.04)"},
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide shrink-0 ${sz}`}
      style={styles[status] ?? styles["Low"]}
    >
      {status}
    </span>
  );
}
