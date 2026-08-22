import { AlertTriangle, Check, ChevronDown, Circle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pipelineStages } from "@/data/mockData";
import { cn } from "@/lib/utils";

const stateStyles = {
  complete: { wrap: "border-low/30 bg-low-soft", dot: "bg-low text-white", Icon: Check },
  warning: { wrap: "border-high/30 bg-high-soft", dot: "bg-high text-white", Icon: AlertTriangle },
  pending: { wrap: "border-border bg-muted", dot: "bg-primary text-white pulse-dot", Icon: Circle },
} as const;

export function AuditPipeline() {
  return (
    <ol className="space-y-2">
      {pipelineStages.map((stage, i) => {
        const s = stateStyles[stage.state];
        return (
          <li key={stage.id}>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:brightness-[0.99]",
                  s.wrap,
                )}
              >
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", s.dot)}>
                  <s.Icon className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {stage.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{stage.agent}</span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 text-xs leading-relaxed">
                <p className="mb-1 text-sm font-semibold text-foreground">{stage.label}</p>
                <p className="text-muted-foreground">{stage.detail}</p>
              </PopoverContent>
            </Popover>
            {i < pipelineStages.length - 1 && (
              <div className="ml-6 h-2 w-px bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function HumanInLoopTrack({ stage }: { stage: string }) {
  const steps = ["AI Detection", "Auditor Review", "Decision", "Remediation"];
  const reached =
    stage === "AI Suggested"
      ? 1
      : stage === "Pending Auditor Review"
        ? 2
        : stage === "Auditor Confirmed"
          ? 3
          : 4;
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              i < reached
                ? "border-primary/25 bg-accent text-accent-foreground"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {step}
          </span>
          {i < steps.length - 1 && <span className="text-muted-foreground">→</span>}
        </li>
      ))}
    </ol>
  );
}
