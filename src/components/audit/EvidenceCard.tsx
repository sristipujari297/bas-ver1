import { FileSpreadsheet, FileText, FileType2, Table2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvidenceNavigation } from "@/hooks/useEvidenceNavigation";
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
  showAction = true,
  highlight = false,
}: {
  evidence: EvidenceRef;
  onView?: (evidence: EvidenceRef) => void;
  actionLabel?: string;
  compact?: boolean;
  showAction?: boolean;
  highlight?: boolean;
}) {
  const { openEvidence } = useEvidenceNavigation();
  const handleView = onView ?? openEvidence;
  const Icon = fileIcon[evidence.fileType];

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-3 transition-all hover:shadow-card",
        compact && "p-2.5",
        highlight && "border-primary/60 bg-accent/40 ring-2 ring-primary ring-offset-2",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-info-soft text-navy">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <button
                type="button"
                onClick={() => handleView(evidence)}
                className="text-left font-medium text-foreground transition-colors hover:text-primary focus:underline focus:outline-none"
                title={evidence.documentName}
              >
                <span className="block truncate text-sm">{evidence.documentName}</span>
              </button>
              <p className="mt-0.5 text-xs text-muted-foreground">{evidence.locator}</p>
            </div>
            {evidence.page && (
              <span className="num rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                p. {evidence.page}
              </span>
            )}
          </div>
          <blockquote className="mt-2 border-l-2 border-primary/40 bg-accent/40 py-1.5 pl-2.5 text-xs leading-relaxed text-foreground">
            {evidence.snippet}
          </blockquote>
          {showAction && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2.5 h-7 gap-1.5 px-2 text-xs"
              onClick={() => handleView(evidence)}
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
