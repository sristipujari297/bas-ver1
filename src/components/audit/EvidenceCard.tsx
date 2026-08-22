import { FileSpreadsheet, FileText, FileType2, Table2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvidenceRef } from "@/lib/types";
import { cn } from "@/lib/utils";

const fileIcon = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  CSV: Table2,
  DOCX: FileType2,
} as const;

export function EvidenceCard({
  evidence,
  onView,
  actionLabel = "View Source",
  compact = false,
}: {
  evidence: EvidenceRef;
  onView?: (evidence: EvidenceRef) => void;
  actionLabel?: string;
  compact?: boolean;
}) {
  const Icon = fileIcon[evidence.fileType];
  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-card",
        compact && "p-2.5",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-info-soft text-navy">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground" title={evidence.documentName}>
            {evidence.documentName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{evidence.locator}</p>
          <blockquote className="mt-2 border-l-2 border-primary/40 bg-accent/40 py-1.5 pl-2.5 text-xs leading-relaxed text-foreground">
            {evidence.snippet}
          </blockquote>
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2.5 h-7 gap-1.5 px-2 text-xs"
              onClick={() => onView(evidence)}
            >
              <ExternalLink className="size-3.5" aria-hidden />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
