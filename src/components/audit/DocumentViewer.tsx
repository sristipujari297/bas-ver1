import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  FileType2,
  Table2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/audit/SectionHeader";
import type { BankReport } from "@/lib/types";
import { cn } from "@/lib/utils";

const fileIcon = {
  PDF: FileText,
  XLSX: FileSpreadsheet,
  CSV: Table2,
  DOCX: FileType2,
} as const;

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
  const Icon = fileIcon[report.fileType] ?? FileText;

  useEffect(() => {
    if (focusPage && pages.some((p) => p.page === focusPage)) {
      setActive(focusPage);
    }
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
        icon={<Icon className="size-6" aria-hidden />}
        title="No document preview available"
        description="This report failed extraction, so no rendered pages could be produced."
      />
    );
  }

  const isSpreadsheet = report.fileType === "XLSX" || report.fileType === "CSV";

  return (
    <div className="flex flex-col">
      {/* Top Document Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-navy" aria-hidden />
          <span className="truncate text-xs font-medium text-foreground">{report.name}</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
              isSpreadsheet ? "bg-success-soft text-success" : "bg-info-soft text-navy",
            )}
          >
            {report.fileType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label={isSpreadsheet ? "Previous sheet" : "Previous page"}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="num px-1 text-xs text-muted-foreground">
            {isSpreadsheet
              ? `Sheet/Page ${current.page} / ${report.pages}`
              : `Page ${current.page} / ${report.pages}`}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => go(1)}
            disabled={index === pages.length - 1}
            aria-label={isSpreadsheet ? "Next sheet" : "Next page"}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Main Body: Spreadsheet structured view vs PDF page view */}
      {isSpreadsheet ? (
        <SpreadsheetEvidenceView report={report} current={current} />
      ) : (
        <PdfEvidenceView report={report} current={current} />
      )}

      {/* Bottom Sheet / Page Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
        <span className="mr-1 text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          {isSpreadsheet ? (
            <>
              <Layers className="size-3" aria-hidden />
              Sheets:
            </>
          ) : (
            "Pages:"
          )}
        </span>
        {pages.map((p) => {
          const sheetLabel = p.heading.match(/Sheet:\s*([^—–-]+)/i)?.[1]?.trim() || `p.${p.page}`;
          return (
            <button
              key={p.page}
              onClick={() => {
                setActive(p.page);
                onFocusPage?.(p.page);
              }}
              className={cn(
                "num rounded-md border px-2 py-1 text-xs transition-colors",
                p.page === active
                  ? "border-primary bg-accent text-accent-foreground font-medium"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {isSpreadsheet ? sheetLabel : `p.${p.page}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Standard PDF / Document Page View */
function PdfEvidenceView({
  report,
  current,
}: {
  report: BankReport;
  current: BankReport["documentPages"][0];
}) {
  return (
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
          PDF Document Preview · page-based source citation
        </p>
      </div>
    </div>
  );
}

/** Structured Spreadsheet / XLSX / CSV Evidence View */
function SpreadsheetEvidenceView({
  report,
  current,
}: {
  report: BankReport;
  current: BankReport["documentPages"][0];
}) {
  const heading = current.heading;
  const sheetMatch = heading.match(/Sheet:\s*([^—–-]+)/i);
  const rowMatch = heading.match(/Rows?\s*([\d–-]+)/i);

  const sheetName =
    sheetMatch?.[1]?.trim() ||
    (heading.toLowerCase().includes("kyc") ? "KYC_Exceptions" : "Disbursement_Data");
  const rowRange =
    rowMatch?.[0]?.trim() ||
    (report.name.toLowerCase().includes("kyc") ? "Rows 41–77" : "Rows 182–196");

  const isKyc = report.name.toLowerCase().includes("kyc") || heading.toLowerCase().includes("kyc");

  const rows = useMemo(() => {
    if (isKyc) {
      return [
        {
          row: 41,
          colA: "SME-LP-70492",
          colB: "02 Jul 2026",
          colC: "46 days (>30d SLA)",
          colD: "Pending",
          flag: true,
          flagText: "Past 30d SLA",
        },
        {
          row: 42,
          colA: "SME-LP-70501",
          colB: "04 Jul 2026",
          colC: "44 days (>30d SLA)",
          colD: "Pending",
          flag: true,
          flagText: "Past 30d SLA",
        },
        {
          row: 43,
          colA: "SME-LP-70518",
          colB: "05 Jul 2026",
          colC: "43 days (>30d SLA)",
          colD: "Pending",
          flag: true,
          flagText: "Past 30d SLA",
        },
        {
          row: 77,
          colA: "SME-LP-70589",
          colB: "14 Jul 2026",
          colC: "34 days (>30d SLA)",
          colD: "Pending",
          flag: true,
          flagText: "Past 30d SLA",
        },
      ];
    }

    if (
      report.name.toLowerCase().includes("lending") ||
      heading.toLowerCase().includes("disbursement")
    ) {
      return [
        {
          row: 182,
          colA: "CL-2026-8812",
          colB: "INR 4.80 Cr",
          colC: "M. Shah",
          colD: "MISSING REF",
          flag: true,
          flagText: "No Sanction Ref",
        },
        {
          row: 183,
          colA: "CL-2026-8813",
          colB: "INR 5.20 Cr",
          colC: "M. Shah",
          colD: "MISSING REF",
          flag: true,
          flagText: "No Sanction Ref",
        },
        {
          row: 184,
          colA: "CL-2026-8814",
          colB: "INR 3.50 Cr",
          colC: "R. Verma",
          colD: "MISSING REF",
          flag: true,
          flagText: "No Sanction Ref",
        },
        {
          row: 185,
          colA: "CL-2026-8815",
          colB: "INR 6.10 Cr",
          colC: "M. Shah",
          colD: "MISSING REF",
          flag: true,
          flagText: "No Sanction Ref",
        },
        {
          row: 196,
          colA: "CL-2026-8826",
          colB: "INR 4.40 Cr",
          colC: "R. Verma",
          colD: "MISSING REF",
          flag: true,
          flagText: "No Sanction Ref",
        },
      ];
    }

    if (report.extracted.length > 0) {
      return report.extracted.map((item, idx) => ({
        row: idx + 1,
        colA: item.label,
        colB: item.value,
        colC: item.delta ?? "—",
        colD: item.anomaly ? "ANOMALY" : "NORMAL",
        flag: item.anomaly,
        flagText: item.anomaly ? "Flagged Outlier" : "Normal",
      }));
    }

    return [
      {
        row: 1,
        colA: "Record 01",
        colB: "Value A",
        colC: "Ref 101",
        colD: "VERIFIED",
        flag: false,
        flagText: "Normal",
      },
    ];
  }, [report, isKyc, heading]);

  const colHeaders = isKyc
    ? [
        "Row",
        "Account / ID (Col A)",
        "Onboard Date (Col B)",
        "Ageing (Col C)",
        "KYC Status (Col D)",
        "Audit Flag",
      ]
    : [
        "Row",
        "Loan ID (Col A)",
        "Disbursement (Col B)",
        "Maker (Col C)",
        "Sanction Letter (Col D)",
        "Audit Flag",
      ];

  return (
    <div className="bg-muted/40 p-4">
      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-4 shadow-raised">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded bg-success-soft text-success text-[11px] font-bold">
              {report.fileType}
            </span>
            <span className="text-xs font-semibold text-foreground">Spreadsheet Evidence Grid</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {report.branch} · {report.sector} · {report.period}
          </span>
        </div>

        {/* Structured Metadata Breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-md border border-border/80 bg-muted/30 p-2.5 text-xs">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Document Name
            </span>
            <span className="block truncate font-medium text-foreground" title={report.name}>
              {report.name}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Sheet Name
            </span>
            <span className="block font-medium text-foreground">{sheetName}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Row Range
            </span>
            <span className="block font-semibold text-primary">{rowRange}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Total Records
            </span>
            <span className="num block font-medium text-foreground">
              {report.records.toLocaleString()} records
            </span>
          </div>
        </div>

        {/* Evidence Snippet / Context */}
        <div className="mt-3.5 space-y-1 rounded-md border border-primary/30 bg-accent/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
            Evidence Context & Snippet
          </p>
          {current.lines.map((line) => (
            <p key={line} className="text-xs leading-relaxed text-foreground">
              {line}
            </p>
          ))}
        </div>

        {/* Relevant Cells & Values Table */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Relevant Cells & Values ({rowRange})
          </p>
          <div className="mt-2 overflow-hidden rounded-md border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/80 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {colHeaders.map((h, i) => (
                      <th key={i} className="px-2.5 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "transition-colors",
                        r.flag
                          ? "bg-critical-soft/30 hover:bg-critical-soft/50"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <td className="num px-2.5 py-2 font-mono font-medium text-muted-foreground">
                        {r.row}
                      </td>
                      <td className="px-2.5 py-2 font-medium text-foreground">{r.colA}</td>
                      <td className="num px-2.5 py-2">{r.colB}</td>
                      <td className="px-2.5 py-2 text-muted-foreground">{r.colC}</td>
                      <td
                        className={cn(
                          "num px-2.5 py-2 font-semibold",
                          r.flag ? "text-critical" : "text-foreground",
                        )}
                      >
                        {r.colD}
                      </td>
                      <td className="px-2.5 py-2">
                        {r.flag ? (
                          <span className="inline-flex items-center rounded bg-critical-soft px-1.5 py-0.5 text-[10px] font-medium text-critical">
                            {r.flagText}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          Structured Spreadsheet Viewer · extracted from indexed workbook data
        </p>
      </div>
    </div>
  );
}
