import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import { PageHeader, Panel, EmptyState, MetaItem } from "@/components/audit/SectionHeader";
import { StatusBadge } from "@/components/audit/StatusBadge";
import { ConfidenceIndicator } from "@/components/audit/ConfidenceIndicator";
import { DocumentViewer } from "@/components/audit/DocumentViewer";
import { EvidenceCard } from "@/components/audit/EvidenceCard";
import { FindingsTable } from "@/components/audit/FindingsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports/$id")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    tab?: string | undefined;
    page?: number | undefined;
    highlight?: string | undefined;
  } => {
    const res: {
      tab?: string | undefined;
      page?: number | undefined;
      highlight?: string | undefined;
    } = {};
    if (typeof search["tab"] === "string") res.tab = search["tab"];
    if (typeof search["page"] === "number") res.page = search["page"];
    else if (typeof search["page"] === "string") {
      const p = parseInt(search["page"], 10);
      if (!isNaN(p)) res.page = p;
    }
    if (typeof search["highlight"] === "string") res.highlight = search["highlight"];
    return res;
  },
  head: () => ({
    meta: [
      { title: "Report Detail — AuditAI" },
      {
        name: "description",
        content:
          "Inspect a parsed bank report: extracted KPIs, detected anomalies, linked findings, evidence references and AI analysis.",
      },
      { property: "og:title", content: "Report Detail — AuditAI" },
      {
        property: "og:description",
        content: "Extracted data, anomalies, evidence and AI analysis for a single bank report.",
      },
    ],
  }),
  component: ReportDetail,
});

function ReportDetail() {
  const { id } = useParams({ from: "/reports/$id" });
  const search = Route.useSearch();
  const { reports, findings, evidence } = useAppStore();
  const report = reports.find((r) => r.id === id);
  const [focusPage, setFocusPage] = useState<number>(search.page ?? 0);
  const [tab, setTab] = useState<string>(search.tab ?? "overview");

  useEffect(() => {
    if (search.tab) setTab(search.tab);
    if (typeof search.page === "number") setFocusPage(search.page);
  }, [search.tab, search.page]);

  if (!report) {
    return (
      <Panel>
        <EmptyState
          title="Report not found"
          description="This report may have been removed from the demo dataset."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/reports">Back to reports</Link>
            </Button>
          }
        />
      </Panel>
    );
  }

  const linkedFindings = findings.filter((f) => report.findingIds.includes(f.id));
  const linkedEvidence = evidence.filter(
    (e) =>
      e.documentName.toLowerCase().includes((report.name.split("_")[0] ?? "").toLowerCase()) ||
      (report.findingIds && report.findingIds.some((fid) => e.findingIds.includes(fid))) ||
      e.documentId === report.id,
  );

  const openSource = (page: number) => {
    setTab("evidence");
    setFocusPage(page);
  };

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/reports">
          <ArrowLeft className="size-4" aria-hidden />
          All reports
        </Link>
      </Button>

      <PageHeader
        title={report.name}
        subtitle={`${report.reportType} · ${report.branch} · ${report.sector}`}
        actions={<StatusBadge status={report.status} className="px-2.5 py-1 text-xs" />}
      />

      {report.status === "Failed" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-critical/30 bg-critical-soft p-3 text-sm text-critical">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Unable to process this report. Please retry.</p>
            <p className="mt-0.5 text-xs">
              Table extraction failed on a scanned appendix (pages 11–14).
            </p>
          </div>
        </div>
      )}

      <Panel title="Report Information">
        <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetaItem label="File name" value={report.name} />
          <MetaItem label="Branch" value={`${report.branch} · ${report.branchCode}`} />
          <MetaItem label="Sector" value={report.sector} />
          <MetaItem label="Reporting period" value={report.period} />
          <MetaItem label="Uploaded by" value={report.uploadedBy} />
          <MetaItem label="Upload date" value={report.uploadedAt} />
          <MetaItem
            label="Processing status"
            value={
              <span className="flex flex-col gap-1.5">
                <StatusBadge status={report.status} />
                {report.progress < 100 && report.status !== "Failed" && (
                  <Progress value={report.progress} className="h-1 w-24" />
                )}
              </span>
            }
          />
          <MetaItem
            label="Pages · records"
            value={`${report.pages} pages · ${report.records.toLocaleString()} records`}
          />
        </dl>
      </Panel>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="ai">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Document Preview" bodyClassName="p-0">
            <DocumentViewer
              report={report}
              focusPage={focusPage}
              onFocusPage={(p) => setFocusPage(p)}
            />
          </Panel>
          <Panel
            title="Extracted Information"
            description="KPIs, values and detected anomalies"
            bodyClassName="p-3"
          >
            <ExtractedList report={report} onSource={openSource} />
          </Panel>
        </TabsContent>

        <TabsContent value="extracted" className="mt-4">
          <Panel title="Extracted Records" bodyClassName="p-0">
            {report.extracted.length === 0 ? (
              <EmptyState
                title="No extracted data"
                description="Extraction did not complete for this report."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Metric</th>
                      <th className="px-3 py-2 font-medium">Value</th>
                      <th className="px-3 py-2 font-medium">Change</th>
                      <th className="px-3 py-2 font-medium">Source</th>
                      <th className="px-3 py-2 font-medium">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.extracted.map((row) => (
                      <tr key={row.label} className="hover:bg-muted/60">
                        <td className="px-3 py-2.5 text-foreground">{row.label}</td>
                        <td className="num px-3 py-2.5 font-medium">{row.value}</td>
                        <td
                          className={cn(
                            "num px-3 py-2.5",
                            row.anomaly ? "text-critical" : "text-muted-foreground",
                          )}
                        >
                          {row.delta ?? "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => openSource(row.page)}
                            className="text-xs text-primary hover:underline"
                          >
                            Page {row.page}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {row.anomaly ? (
                            <span className="text-critical">Anomaly detected</span>
                          ) : (
                            <span className="text-muted-foreground">Within expected range</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="findings" className="mt-4">
          <Panel title="Linked Findings" bodyClassName="p-0">
            {linkedFindings.length === 0 ? (
              <EmptyState
                title="No findings from this report yet."
                description="Analysis may still be running."
              />
            ) : (
              <FindingsTable
                findings={linkedFindings}
                columns={["finding", "branch", "risk", "score", "confidence", "status"]}
              />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Document Viewer" bodyClassName="p-0">
            <DocumentViewer
              report={report}
              focusPage={focusPage}
              onFocusPage={(p) => setFocusPage(p)}
            />
          </Panel>
          <Panel title="Evidence References" bodyClassName="space-y-2 p-3">
            {linkedEvidence.length === 0 ? (
              <EmptyState title="No supporting evidence was found for this report." />
            ) : (
              linkedEvidence.map((e) => (
                <EvidenceCard
                  key={e.id}
                  evidence={e}
                  highlight={search.highlight === e.id}
                  onView={(ev) => setFocusPage(ev.page ?? 0)}
                />
              ))
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Panel title="AI Analysis" bodyClassName="space-y-3">
            <div className="rounded-lg border border-primary/25 bg-accent/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                Analysis summary
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground">{report.aiSummary}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ConfidenceIndicator value={report.aiConfidence} />
              <p className="text-xs text-muted-foreground">
                Generated by the Audit Agent · reviewed by no auditor yet
              </p>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExtractedList({
  report,
  onSource,
}: {
  report: ReturnType<typeof useAppStore>["reports"][number];
  onSource: (page: number) => void;
}) {
  if (report.extracted.length === 0) {
    return (
      <EmptyState title="No extracted information" description="This report could not be parsed." />
    );
  }
  return (
    <ul className="space-y-2">
      {report.extracted.map((row) => (
        <li
          key={row.label}
          className={cn(
            "rounded-md border p-2.5",
            row.anomaly ? "border-critical/30 bg-critical-soft" : "border-border bg-card",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-muted-foreground">{row.label}</p>
            {row.delta && (
              <span
                className={cn(
                  "num text-xs font-semibold",
                  row.anomaly ? "text-critical" : "text-muted-foreground",
                )}
              >
                {row.delta}
              </span>
            )}
          </div>
          <p className="num mt-0.5 text-sm font-semibold text-foreground">{row.value}</p>
          <button
            onClick={() => onSource(row.page)}
            className="mt-1 text-[11px] text-primary hover:underline"
          >
            Source: Page {row.page}
          </button>
        </li>
      ))}
    </ul>
  );
}
