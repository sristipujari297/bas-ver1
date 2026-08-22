import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function RootCauseChain({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step}>
            <div
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                i === 0
                  ? "border-navy/20 bg-info-soft font-medium text-navy"
                  : last
                    ? "border-critical/30 bg-critical-soft font-medium text-critical"
                    : "border-border bg-card text-foreground",
              )}
            >
              {step}
            </div>
            {!last && (
              <div className="flex justify-center py-0.5" aria-hidden>
                <ArrowDown className="size-3.5 text-muted-foreground" />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
