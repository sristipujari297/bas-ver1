import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, CloudUpload, Search, Upload } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/audit/SectionHeader";
import { StatusBadge } from "@/components/audit/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  simulateIngestion,
  generateFindingFromReport,
  generateEvidenceFromReport,
  generateRemediationFromFinding,
  generateNotificationFromFinding,
  generateAuditLogsFromProcessing,
} from "@/services/reportService";
import { useAppStore } from "@/store/appStore";
import { BRANCHES, SECTORS } from "@/data/mockData";
import type { BankReport } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "Bank Reports — AuditAI Report Ingestion" },
      {
        name: "description",
        content:
          "Upload, monitor and analyze incoming weekly bank audit reports. Track parsing, indexing and analysis status per branch and sector.",
      },
      { property: "og:title", content: "Bank Reports — AuditAI" },
      {
        property: "og:description",
        content: "Upload, monitor and analyze incoming audit reports across branches and sectors.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const {
    reports,
    findings,
    addReport,
    updateReport,
    addFinding,
    addEvidence,
    addDocument,
    addRemediation,
    addNotification,
    addAuditLog,
  } = useAppStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dragging, setDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        const q = query.trim().toLowerCase();
        const matchQ =
          !q ||
          [r.name, r.branch, r.branchCode, r.sector, r.reportType]
            .join(" ")
            .toLowerCase()
            .includes(q);
        return matchQ && (status === "all" || r.status === status);
      }),
    [reports, query, status],
  );

  const startUpload = (fileName: string) => {
    const id = `r-${Date.now()}`;
    const ext = (fileName.split(".").pop() ?? "pdf").toUpperCase();
    const fileType = (
      ["PDF", "XLSX", "CSV", "DOCX"].includes(ext) ? ext : "PDF"
    ) as BankReport["fileType"];
    const report: BankReport = {
      id,
      name: fileName,
      fileType,
      branch: BRANCHES[0]!.name,
      branchCode: BRANCHES[0]!.code,
      sector: SECTORS[1]!,
      reportType: "Weekly Branch Audit",
      period: "15–21 Aug 2026",
      uploadedAt: "Just now",
      uploadedBy: "M. Shah (Audit Analyst)",
      status: "Uploaded",
      progress: 6,
      pages: 22,
      records: 3980,
      findingIds: [],
      extracted: [
        {
          label: "Outbound transaction volume",
          value: "INR 388.1 Cr",
          delta: "+162%",
          page: 7,
          anomaly: true,
        },
        { label: "Reported loan disbursement", value: "INR 91.4 Cr", delta: "+28%", page: 9 },
      ],
      documentPages: [
        {
          page: 7,
          heading: "7. Transaction Summary — Corporate Lending",
          lines: [
            "Newly ingested document. Outbound transaction volume reached INR 388.1 Cr (+162%),",
            "concentrated in 19 counterparties within the reporting period.",
          ],
          highlight: true,
        },
      ],
      aiSummary:
        "Newly ingested report. Preliminary analysis shows a transaction-versus-KPI mismatch consistent with the Branch 042 pattern.",
      aiConfidence: 84,
    };
    addReport(report);
    toast.info(`Ingestion started for ${fileName}`);
    void simulateIngestion((tick) => {
      updateReport(id, { progress: tick.progress, status: tick.status });
      setUploadMessage(tick.progress === 100 ? null : tick.message);
      if (tick.progress === 100) {
        const finding = generateFindingFromReport(
          { ...report, status: "Analysis Complete", progress: 100 },
          findings.length,
        );
        const { evidence, document } = generateEvidenceFromReport(report, finding);
        finding.evidenceIds = [evidence.id];

        const remediationAction = generateRemediationFromFinding(finding);
        const notification = generateNotificationFromFinding(report, finding);
        const auditLogs = generateAuditLogsFromProcessing(report, finding, remediationAction);

        addFinding(finding);
        addEvidence(evidence);
        addDocument(document);
        addRemediation(remediationAction);
        addNotification(notification);
        addAuditLog(auditLogs);

        updateReport(id, {
          status: "Analysis Complete",
          progress: 100,
          findingIds: [finding.id],
          aiSummary: finding.whyFlagged,
          aiConfidence: finding.confidence,
        });
        toast.success(`${fileName} processed — finding ${finding.ref} created.`);
      }
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bank Reports"
        subtitle="Upload, monitor and analyze incoming audit reports."
        actions={
          <Button className="gap-1.5" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" aria-hidden />
            Upload Report
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.xlsx,.csv,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) startUpload(file.name);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          startUpload(file ? file.name : "Branch_055_Weekly_Audit_Report.pdf");
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors",
          dragging && "border-primary bg-accent/40",
        )}
      >
        <CloudUpload className="size-7 text-primary" aria-hidden />
        <p className="mt-3 text-sm font-medium text-foreground">Drag &amp; drop reports here</p>
        <p className="mt-1 text-xs text-muted-foreground">or</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => inputRef.current?.click()}
        >
          Browse Files
        </Button>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Supported: PDF, XLSX, CSV, DOCX · files are processed locally in this prototype
        </p>
        {uploadMessage && (
          <p className="mt-3 flex items-center gap-2 text-xs text-primary">
            <span className="size-2 rounded-full bg-primary pulse-dot" aria-hidden />
            {uploadMessage}
          </p>
        )}
      </div>

      <Panel
        title="Report Register"
        description={`${filtered.length} of ${reports.length} reports`}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports"
                className="h-9 w-44 pl-8 text-xs"
                aria-label="Search reports"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-40 text-xs" aria-label="Status filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "all",
                  "Uploaded",
                  "Parsing",
                  "Processing",
                  "Indexed",
                  "Analysis Complete",
                  "Failed",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        bodyClassName="p-0"
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No reports match your filters."
            description="Try clearing the search or status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  {[
                    "Report Name",
                    "Branch",
                    "Sector",
                    "Type",
                    "Period",
                    "Uploaded",
                    "Status",
                    "Findings",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-muted/60">
                    <td className="px-3 py-2.5">
                      <Link
                        to="/reports/$id"
                        params={{ id: r.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {r.name}
                      </Link>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {r.fileType}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {r.branch} · {r.branchCode}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {r.sector}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {r.reportType}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {r.period}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {r.uploadedAt}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={r.status} />
                      {r.progress < 100 && r.status !== "Failed" && (
                        <Progress value={r.progress} className="mt-1.5 h-1 w-24" />
                      )}
                    </td>
                    <td className="num px-3 py-2.5 text-muted-foreground">{r.findingIds.length}</td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        to="/reports/$id"
                        params={{ id: r.id }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open
                        <ChevronRight className="size-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
