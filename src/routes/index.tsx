import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/audit/SectionHeader";
import { KpiCard } from "@/components/audit/KpiCard";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { FindingsTable } from "@/components/audit/FindingsTable";
import { AuditPipeline } from "@/components/audit/AuditPipeline";
import { RiskTrendChart, type RiskMetric } from "@/components/audit/charts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardInsight } from "@/services/auditService";
import { BRANCHES, SECTORS } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import {
  computeFilteredRiskTrend,
  computeKpis,
  filterFindings,
  filterReports,
  isActiveFinding,
  type DateRangeKey,
} from "@/lib/dashboardUtils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — AuditAI Audit Intelligence" },
      {
        name: "description",
        content:
          "Weekly audit intelligence for bank internal audit teams: risk trends, critical alerts, audit pipeline status and AI-detected findings.",
      },
      { property: "og:title", content: "Executive Overview — AuditAI" },
      {
        property: "og:description",
        content: "Weekly audit intelligence and risk overview across branches and sectors.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { findings, reports } = useAppStore();
  const [metric, setMetric] = useState<RiskMetric>("count");
  const [range, setRange] = useState<DateRangeKey>("this-week");
  const [branch, setBranch] = useState("all");
  const [sector, setSector] = useState("all");

  const filterOpts = { branch, sector, range };

  const filteredFindings = useMemo(
    () => filterFindings(findings, filterOpts),
    [findings, branch, sector, range],
  );
  const filteredReports = useMemo(
    () => filterReports(reports, filterOpts),
    [reports, branch, sector, range],
  );

  const kpis = useMemo(() => computeKpis(reports, findings), [reports, findings]);

  const riskTrendData = useMemo(
    () => computeFilteredRiskTrend(filteredFindings),
    [filteredFindings],
  );

  const alerts = useMemo(
    () =>
      [...filteredFindings]
        .filter(isActiveFinding)
        .sort((a, b) => b.score - a.score)
        .filter((f) => f.risk === "Critical" || f.risk === "High")
        .slice(0, 4),
    [filteredFindings],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Good morning, Audit Team"
        subtitle="Weekly audit intelligence and risk overview"
        actions={
          <>
            <Select value={range} onValueChange={(v) => setRange(v as DateRangeKey)}>
              <SelectTrigger className="w-40" aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-30">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-44" aria-label="Branch filter">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {BRANCHES.map((b) => (
                  <SelectItem key={b.code} value={b.code}>
                    {b.name} · {b.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-44" aria-label="Sector filter">
                <SelectValue placeholder="All sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} {...k} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Risk Overview"
          description="Findings by severity across the last 7 reporting weeks"
          actions={
            <Select value={metric} onValueChange={(v) => setMetric(v as RiskMetric)}>
              <SelectTrigger className="h-8 w-40 text-xs" aria-label="Chart metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Risk count</SelectItem>
                <SelectItem value="score">Risk score</SelectItem>
                <SelectItem value="branches">Branches affected</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_15rem]">
            <RiskTrendChart metric={metric} data={riskTrendData} />
            <aside className="rounded-lg border border-primary/25 bg-accent/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                AI Insight
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground">{dashboardInsight}</p>
              <Link
                to="/audit-intelligence"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Open audit intelligence
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </aside>
          </div>
        </Panel>

        <Panel
          title="Critical Alerts"
          description="Highest scoring open findings"
          bodyClassName="space-y-2 p-3"
        >
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No critical or high alerts match the current filters.
            </p>
          ) : (
            alerts.map((f) => (
              <Link
                key={f.id}
                to="/findings/$id"
                params={{ id: f.id }}
                className="block rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-raised"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{f.title}</p>
                  <RiskBadge risk={f.risk} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Branch {f.branchCode} · {f.sector}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="num">
                    Score <span className="font-semibold text-foreground">{f.score}/100</span>
                  </span>
                  <span>Detected {f.detected}</span>
                </div>
              </Link>
            ))
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Current Audit Pipeline"
          description="Multi-agent workflow status for this reporting week"
          bodyClassName="p-3"
        >
          <AuditPipeline />
        </Panel>

        <Panel
          className="xl:col-span-2"
          title="Recent AI Findings"
          description={`${filteredFindings.length} findings match the current filters`}
          actions={
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link to="/findings">View all</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          <FindingsTable findings={filteredFindings} />
        </Panel>
      </div>
    </div>
  );
}
