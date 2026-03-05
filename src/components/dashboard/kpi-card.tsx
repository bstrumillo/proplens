import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description?: string;
}

export function KPICard({ icon: Icon, label, value, description }: KPICardProps) {
  return (
    <Card
      variant="glass"
      className="group hover:shadow-[var(--elevation-3)] transition-all duration-300"
    >
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 transition-all duration-300 group-hover:from-primary/15 group-hover:to-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
