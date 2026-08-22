import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

const map: Record<RiskLevel, { cls: string; Icon: typeof Info }> = {
  Critical: { cls: "bg-critical-soft text-critical border-critical/30", Icon: AlertOctagon },
  High: { cls: "bg-high-soft text-high border-high/30", Icon: AlertTriangle },
  Medium: { cls: "bg-medium-soft text-medium border-medium/40", Icon: Info },
  Low: { cls: "bg-low-soft text-low border-low/30", Icon: CheckCircle2 },
};

export function RiskBadge({
  risk,
  size = "sm",
  className,
}: {
  risk: RiskLevel;
  size?: "sm" | "md";
  className?: string;
}) {
  const { cls, Icon } = map[risk];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        cls,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {risk}
    </span>
  );
}

export function RiskScore({
  score,
  risk,
  size = "md",
}: {
  score: number;
  risk: RiskLevel;
  size?: "md" | "lg";
}) {
  const color =
    risk === "Critical"
      ? "text-critical"
      : risk === "High"
        ? "text-high"
        : risk === "Medium"
          ? "text-medium"
          : "text-low";
  return (
    <div className="flex items-baseline gap-1">
      <span className={cn("num font-semibold", color, size === "lg" ? "text-5xl" : "text-base")}>
        {score}
      </span>
      <span className={cn("text-muted-foreground", size === "lg" ? "text-lg" : "text-xs")}>
        /100
      </span>
    </div>
  );
}
