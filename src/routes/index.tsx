import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { PageHeader, Panel } from "@/components/audit/SectionHeader";
import { KpiCard } from "@/components/audit/KpiCard";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { FindingsTable } from "@/components/audit/FindingsTable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRANCHES, SECTORS } from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import {
  computeKpis,
  filterFindings,
  filterReports,
  isActiveFinding,
  DEMO_TODAY,
  type CustomDateRange,
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
  const [range, setRange] = useState<DateRangeKey>("this-week");
  const [customRange, setCustomRange] = useState<CustomDateRange | undefined>({
    from: subDays(DEMO_TODAY, 14),
    to: DEMO_TODAY,
  });
  const [customOpen, setCustomOpen] = useState(false);
  const [branch, setBranch] = useState("all");
  const [sector, setSector] = useState("all");

  const filterOpts = useMemo(
    () => ({ branch, sector, range, customRange }),
    [branch, sector, range, customRange],
  );

  const filteredFindings = useMemo(
    () => filterFindings(findings, filterOpts),
    [findings, filterOpts],
  );
  const filteredReports = useMemo(() => filterReports(reports, filterOpts), [reports, filterOpts]);

  const kpis = useMemo(
    () => computeKpis(filteredReports, filteredFindings, branch, sector),
    [filteredReports, filteredFindings, branch, sector],
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
            <Select
              value={range}
              onValueChange={(v) => {
                const nextRange = v as DateRangeKey;
                setRange(nextRange);
                if (nextRange === "custom") {
                  setCustomOpen(true);
                }
              }}
            >
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

            {range === "custom" && (
              <Popover open={customOpen} onOpenChange={setCustomOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 justify-start text-left font-normal text-xs",
                      !customRange?.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-1.5 size-3.5" />
                    {customRange?.from ? (
                      customRange.to ? (
                        <>
                          {format(customRange.from, "d MMM")} –{" "}
                          {format(customRange.to, "d MMM yyyy")}
                        </>
                      ) : (
                        format(customRange.from, "d MMM yyyy")
                      )
                    ) : (
                      <span>Pick dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customRange?.from ?? DEMO_TODAY}
                    selected={customRange}
                    onSelect={(r) => setCustomRange(r)}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            )}

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

      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.id} {...k} />
        ))}
      </div>

      <Panel
        title="Critical Alerts"
        description="Highest scoring open findings"
        bodyClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-3"
      >
        {alerts.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">
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

      <Panel
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
  );
}
