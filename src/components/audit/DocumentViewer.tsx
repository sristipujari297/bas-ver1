import { useEffect, useMemo, useState } from "react";
import { FileText, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/audit/SectionHeader";
import type { BankReport } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DocumentViewer({
  report,
  focusPage,
  onFocusPage,
}: {
  report: BankReport;
  focusPage?: number;
  onFocusPage?: (page: number) => void;
}) {
  const pages = report.documentPages;
  const [active, setActive] = useState(pages[0]?.page ?? 1);

  useEffect(() => {
    if (focusPage && pages.some((p) => p.page === focusPage)) setActive(focusPage);
  }, [focusPage, pages]);

  const index = useMemo(() => pages.findIndex((p) => p.page === active), [pages, active]);
  const current = pages[index];

  const go = (dir: -1 | 1) => {
    const next = pages[index + dir];
    if (next) {
      setActive(next.page);
      onFocusPage?.(next.page);
    }
  };

  if (!current) {
    return (
      <EmptyState
        icon={<FileText className="size-6" aria-hidden />}
        title="No document preview available"
        description="This report failed extraction, so no rendered pages could be produced."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0 text-navy" aria-hidden />
          <span className="truncate text-xs font-medium text-foreground">{report.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="num px-1 text-xs text-muted-foreground">
            Page {current.page} / {report.pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => go(1)}
            disabled={index === pages.length - 1}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="bg-muted/40 p-4">
        <div className="mx-auto max-w-2xl bg-card p-6 shadow-raised">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {report.branch} · {report.sector}
            </p>
            <p className="text-[11px] text-muted-foreground">{report.period}</p>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-foreground">{current.heading}</h3>
          <div
            className={cn(
              "mt-3 space-y-1.5 rounded-md p-2 text-[13px] leading-relaxed text-foreground transition-colors",
              current.highlight && "bg-medium-soft ring-1 ring-medium/40",
            )}
          >
            {current.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-6 space-y-2" aria-hidden>
            {[92, 78, 86, 64, 70].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-muted" style={{ width: `${w}%` }} />
            ))}
          </div>
          <p className="mt-6 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <Lock className="size-3" aria-hidden />
            Rendered locally · prototype document preview
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
        {pages.map((p) => (
          <button
            key={p.page}
            onClick={() => {
              setActive(p.page);
              onFocusPage?.(p.page);
            }}
            className={cn(
              "num rounded-md border px-2 py-1 text-xs transition-colors",
              p.page === active
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            p.{p.page}
          </button>
        ))}
      </div>
    </div>
  );
}
