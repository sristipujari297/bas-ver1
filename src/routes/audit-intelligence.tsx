import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/audit/SectionHeader";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { RootCauseChain } from "@/components/audit/RootCauseChain";
import {
  BranchRiskChart,
  FindingTrendChart,
  RiskDistributionChart,
} from "@/components/audit/charts";
import { getAnalytics } from "@/services/auditService";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit-intelligence")({
  head: () => ({
    meta: [
      { title: "Audit Intelligence — Risk Analytics & Root Cause" },
      {
        name: "description",
        content:
          "Risk analytics across branches and sectors: severity distribution, branch comparison, branch risk heatmap and root-cause chains for recurring anomalies.",
      },
      { property: "og:title", content: "Audit Intelligence — AuditAI" },
      {
        property: "og:description",
        content: "Branch and sector risk analytics with AI root-cause analysis.",
      },
    ],
  }),
  component: AuditIntelligence,
});

const heatColor = (v: number) =>
  v >= 80
    ? "bg-critical text-white"
    : v >= 60
      ? "bg-high text-white"
      : v >= 40
        ? "bg-medium/80 text-navy"
        : "bg-low-soft text-low";

function AuditIntelligence() {
  const { riskDomains, sectorHeatmap } = getAnalytics();
  const { findings } = useAppStore();
  const top = [...findings].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Intelligence"
        subtitle="Risk analytics, branch comparison and AI root-cause analysis."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {riskDomains.map((d) => {
          const up = d.direction === "up";
          return (
            <article key={d.label} className="panel p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {d.label}
              </p>
              <p className="num mt-2 text-3xl font-semibold text-foreground">{d.score}</p>
              <p
                className={cn(
                  "mt-3 flex items-center gap-1 border-t border-border pt-2.5 text-xs",
                  up ? "text-critical" : "text-low",
                )}
              >
                {up ? (
                  <ArrowUpRight className="size-3.5" aria-hidden />
                ) : (
                  <ArrowDownRight className="size-3.5" aria-hidden />
                )}
                {d.trend}% vs last week
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Risk Distribution" description="Open findings by severity">
          <RiskDistributionChart />
        </Panel>
        <Panel title="Branch Risk Comparison" description="Composite risk score by branch">
          <BranchRiskChart />
        </Panel>
      </div>

      <Panel
        title="Findings Trend"
        description="Detected vs resolved findings over the last 7 weeks"
      >
        <FindingTrendChart />
      </Panel>

      <Panel
        title="Branch Risk Heatmap"
        description="Risk intensity by branch and risk domain"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Branch</th>
                <th className="px-3 py-2 font-medium">Fraud</th>
                <th className="px-3 py-2 font-medium">Compliance</th>
                <th className="px-3 py-2 font-medium">Operations</th>
                <th className="px-3 py-2 font-medium">Reporting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sectorHeatmap.map((row) => (
                <tr key={row.branch}>
                  <td className="px-3 py-2 font-medium text-foreground">{row.branch}</td>
                  {([row.fraud, row.compliance, row.operations, row.reporting] as number[]).map(
                    (v, i) => (
                      <td key={i} className="px-3 py-2">
                        <span
                          className={cn(
                            "num inline-block w-12 rounded-md px-2 py-1 text-center text-xs font-semibold",
                            heatColor(v),
                          )}
                        >
                          {v}
                        </span>
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {top && (
        <Panel
          title="Root-Cause Spotlight"
          description={`${top.ref} ${top.title} — highest scoring open finding`}
          bodyClassName="grid gap-4 lg:grid-cols-[1fr_1fr]"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RiskBadge risk={top.risk} />
              <span className="num text-xs text-muted-foreground">Score {top.score}/100</span>
            </div>
            <div className="rounded-lg border border-primary/25 bg-accent/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                Analysis
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground">
                {top.rootCause.potentialCause}
              </p>
            </div>
            <Link
              to="/findings/$id"
              params={{ id: top.id }}
              className="inline-flex text-xs font-medium text-primary hover:underline"
            >
              Open full root-cause analysis
            </Link>
          </div>
          <RootCauseChain steps={top.causeChain} />
        </Panel>
      )}
    </div>
  );
}
