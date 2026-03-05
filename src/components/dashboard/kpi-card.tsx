import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
  color?: "indigo" | "emerald" | "amber" | "rose";
}

const colorStyles = {
  indigo: {
    bg: "from-indigo-500/15 to-indigo-600/5",
    icon: "text-indigo-600",
    ring: "ring-indigo-500/20",
  },
  emerald: {
    bg: "from-emerald-500/15 to-emerald-600/5",
    icon: "text-emerald-600",
    ring: "ring-emerald-500/20",
  },
  amber: {
    bg: "from-amber-500/15 to-amber-600/5",
    icon: "text-amber-600",
    ring: "ring-amber-500/20",
  },
  rose: {
    bg: "from-rose-500/15 to-rose-600/5",
    icon: "text-rose-600",
    ring: "ring-rose-500/20",
  },
};

export function KPICard({ icon: Icon, label, value, description, color = "indigo" }: KPICardProps) {
  const c = colorStyles[color];

  return (
    <div className="group glass rounded-2xl p-5 transition-all duration-300 hover:shadow-[var(--elevation-3)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${c.bg} p-3.5 ring-1 ${c.ring} transition-all duration-300 group-hover:scale-110`}>
          <Icon className={`size-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
