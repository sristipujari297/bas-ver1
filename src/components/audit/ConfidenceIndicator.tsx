import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ConfidenceIndicator({
  value,
  compact = false,
  className,
}: {
  value: number;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("inline-flex items-center gap-2", className)} tabIndex={0}>
          <div
            className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
            role="meter"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`AI confidence ${value}%`}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
          </div>
          <span className="num text-xs font-medium text-foreground">{value}%</span>
          {!compact && <Info className="size-3.5 text-muted-foreground" aria-hidden />}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Confidence indicates how strongly the available evidence supports this finding. It is not a
        measure of certainty.
      </TooltipContent>
    </Tooltip>
  );
}
