import { cn } from "@/lib/utils";
import type { FindingStatus, RemediationStatus, ReportStatus, ReviewStage } from "@/lib/types";

const styles: Record<string, string> = {
  // finding statuses
  New: "bg-info-soft text-navy-soft border-navy/20",
  "Under Review": "bg-medium-soft text-medium border-medium/40",
  Confirmed: "bg-high-soft text-high border-high/30",
  "Remediation Pending": "bg-accent text-accent-foreground border-primary/25",
  Resolved: "bg-low-soft text-low border-low/30",
  Dismissed: "bg-muted text-muted-foreground border-border",
  // report statuses
  Uploaded: "bg-info-soft text-navy-soft border-navy/20",
  Parsing: "bg-medium-soft text-medium border-medium/40",
  Processing: "bg-accent text-accent-foreground border-primary/25",
  Indexed: "bg-accent text-accent-foreground border-primary/25",
  "Analysis Complete": "bg-low-soft text-low border-low/30",
  Failed: "bg-critical-soft text-critical border-critical/30",
  // remediation statuses
  "Not Started": "bg-muted text-muted-foreground border-border",
  "In Progress": "bg-accent text-accent-foreground border-primary/25",
  "Pending Verification": "bg-medium-soft text-medium border-medium/40",
  Completed: "bg-low-soft text-low border-low/30",
  Overdue: "bg-critical-soft text-critical border-critical/30",
  // review stages
  "AI Suggested": "bg-info-soft text-navy-soft border-navy/20",
  "Pending Auditor Review": "bg-medium-soft text-medium border-medium/40",
  "Auditor Confirmed": "bg-accent text-accent-foreground border-primary/25",
  "Remediation Approved": "bg-low-soft text-low border-low/30",
  Success: "bg-low-soft text-low border-low/30",
  Warning: "bg-high-soft text-high border-high/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: FindingStatus | ReportStatus | RemediationStatus | ReviewStage | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {status}
    </span>
  );
}
