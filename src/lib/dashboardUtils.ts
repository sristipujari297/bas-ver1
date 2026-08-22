import { parse, subDays, isAfter, isBefore, startOfDay } from "date-fns";
import { BRANCHES, riskTrend as baseRiskTrend } from "@/data/mockData";
import type { BankReport, Finding } from "@/lib/types";

/** Reference date for the demo dataset (Aug 22, 2026). */
export const DEMO_TODAY = new Date(2026, 7, 22);

export function parseDemoDate(value: string): Date {
  if (value === "Just now" || value.startsWith("Just")) return DEMO_TODAY;
  const cleaned = value.replace(/,.*$/, "").trim();
  try {
    return parse(cleaned, "d MMM yyyy", DEMO_TODAY);
  } catch {
    return DEMO_TODAY;
  }
}

export type DateRangeKey = "this-week" | "last-week" | "last-30" | "custom";

export function isInDateRange(date: Date, range: DateRangeKey): boolean {
  const today = startOfDay(DEMO_TODAY);
  if (range === "this-week") {
    const start = subDays(today, 6);
    return !isBefore(date, start) && !isAfter(date, today);
  }
  if (range === "last-week") {
    const end = subDays(today, 7);
    const start = subDays(today, 13);
    return !isBefore(date, start) && !isAfter(date, end);
  }
  if (range === "last-30") {
    const start = subDays(today, 29);
    return !isBefore(date, start) && !isAfter(date, today);
  }
  return true;
}

export function filterFindings(
  findings: Finding[],
  opts: { branch?: string; sector?: string; range?: DateRangeKey },
): Finding[] {
  return findings.filter((f) => {
    if (opts.branch && opts.branch !== "all" && f.branchCode !== opts.branch) return false;
    if (opts.sector && opts.sector !== "all" && f.sector !== opts.sector) return false;
    if (
      opts.range &&
      opts.range !== "custom" &&
      !isInDateRange(parseDemoDate(f.detected), opts.range)
    )
      return false;
    return true;
  });
}

export function filterReports(
  reports: BankReport[],
  opts: { branch?: string; sector?: string; range?: DateRangeKey },
): BankReport[] {
  return reports.filter((r) => {
    if (opts.branch && opts.branch !== "all" && r.branchCode !== opts.branch) return false;
    if (opts.sector && opts.sector !== "all" && r.sector !== opts.sector) return false;
    if (
      opts.range &&
      opts.range !== "custom" &&
      !isInDateRange(parseDemoDate(r.uploadedAt), opts.range)
    )
      return false;
    return true;
  });
}

export function isActiveFinding(f: Finding): boolean {
  return f.status !== "Resolved" && f.status !== "Dismissed";
}

export function computeAuditCoverage(reports: BankReport[]): {
  percentage: number;
  branchesCovered: number;
} {
  const branchesCovered = new Set(reports.map((r) => r.branchCode)).size;
  const percentage = Math.round((branchesCovered / BRANCHES.length) * 100);
  return { percentage, branchesCovered };
}

export function computeKpis(reports: BankReport[], findings: Finding[]) {
  const active = findings.filter(isActiveFinding);
  const critical = active.filter((f) => f.risk === "Critical");
  const coverage = computeAuditCoverage(reports);
  const immediate = active.filter((f) => f.risk === "Critical" || f.risk === "High").length;

  return [
    {
      id: "reports",
      label: "Total Reports",
      value: String(reports.length),
      subtitle: `${coverage.branchesCovered} branches represented`,
      icon: "FileText" as const,
      tone: "navy" as const,
      href: "/reports",
    },
    {
      id: "findings",
      label: "Active Findings",
      value: String(active.length),
      subtitle: immediate > 0 ? `${immediate} require immediate attention` : "No urgent items",
      icon: "AlertTriangle" as const,
      tone: "high" as const,
      href: "/findings",
    },
    {
      id: "critical",
      label: "Critical Risks",
      value: String(critical.length),
      subtitle:
        critical.length > 0
          ? `${critical.length} open critical finding${critical.length > 1 ? "s" : ""}`
          : "None open",
      icon: "ShieldAlert" as const,
      tone: "critical" as const,
      href: "/findings?risk=Critical",
    },
    {
      id: "coverage",
      label: "Audit Coverage",
      value: `${coverage.percentage}%`,
      subtitle: `Across ${coverage.branchesCovered} of ${BRANCHES.length} branches`,
      icon: "Target" as const,
      tone: "teal" as const,
      href: "/audit-intelligence",
    },
  ];
}

export function computeFilteredRiskTrend(findings: Finding[]) {
  const active = findings.filter(isActiveFinding);
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of active) {
    const key = f.risk.toLowerCase() as keyof typeof counts;
    if (key in counts) counts[key]++;
  }
  const avgScore =
    active.length > 0 ? Math.round(active.reduce((s, f) => s + f.score, 0) / active.length) : 0;
  const branches = new Set(active.map((f) => f.branchCode)).size;
  const trend = [...baseRiskTrend];
  const last = trend[trend.length - 1]!;
  trend[trend.length - 1] = { ...last, ...counts, score: avgScore, branches };
  return trend;
}

export function computeRiskDistribution(findings: Finding[]) {
  const active = findings.filter(isActiveFinding);
  return [
    { name: "Critical", value: active.filter((f) => f.risk === "Critical").length },
    { name: "High", value: active.filter((f) => f.risk === "High").length },
    { name: "Medium", value: active.filter((f) => f.risk === "Medium").length },
    { name: "Low", value: active.filter((f) => f.risk === "Low").length },
  ];
}
