import { Link } from "@tanstack/react-router";
import { AlertTriangle, FileText, ShieldAlert, Target, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { FileText, AlertTriangle, ShieldAlert, Target };

const tones = {
  navy: "bg-info-soft text-navy",
  teal: "bg-accent text-accent-foreground",
  high: "bg-high-soft text-high",
  critical: "bg-critical-soft text-critical",
} as const;

export function KpiCard({
  label,
  value,
  subtitle,
  icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: string;
  tone: keyof typeof tones;
  href: string;
}) {
  const Icon = icons[icon] ?? FileText;
  return (
    <Link
      to={href}
      className="panel group block p-4 transition-shadow hover:shadow-raised focus-visible:shadow-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="num mt-2 text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <span className={cn("grid size-9 place-items-center rounded-md", tones[tone])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 border-t border-border pt-2.5 text-xs",
          tone === "critical" ? "text-critical" : "text-muted-foreground",
        )}
      >
        {subtitle}
      </p>
    </Link>
  );
}
