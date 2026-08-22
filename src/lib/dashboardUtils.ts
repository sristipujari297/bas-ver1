import { parse, subDays, isAfter, isBefore, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { BRANCHES, riskTrend as baseRiskTrend } from "@/data/mockData";
import type { BankReport, Finding } from "@/lib/types";

/** Reference date for the demo dataset (Aug 22, 2026). */
export const DEMO_TODAY = new Date(2026, 7, 22);

export function parseDemoDate(value: string): Date {
  if (value === "Just now" || value.startsWith("Just")) return DEMO_TODAY;
  const cleaned = value.replace(/,.*$/, "").trim();
  try {
    const d = parse(cleaned, "d MMM yyyy", DEMO_TODAY);
    return isNaN(d.getTime()) ? DEMO_TODAY : d;
  } catch {
    return DEMO_TODAY;
  }
}

export type DateRangeKey = "this-week" | "last-week" | "last-30" | "custom";

export type CustomDateRange = DateRange;

export function isInDateRange(
  date: Date,
  range: DateRangeKey,
  customRange?: CustomDateRange | undefined,
): boolean {
  const target = startOfDay(date);
  const today = startOfDay(DEMO_TODAY);

  if (range === "this-week") {
    const start = subDays(today, 5); // Aug 17, 2026
    return !isBefore(target, start) && !isAfter(target, today);
  }

  if (range === "last-week") {
    const start = subDays(today, 12); // Aug 10, 2026
    const end = subDays(today, 6); // Aug 16, 2026
    return !isBefore(target, start) && !isAfter(target, end);
  }

  if (range === "last-30") {
    const start = subDays(today, 29);
    return !isBefore(target, start) && !isAfter(target, today);
  }

  if (range === "custom") {
    if (!customRange || (!customRange.from && !customRange.to)) return true;
    if (customRange.from && isBefore(target, startOfDay(customRange.from))) return false;
    if (customRange.to && isAfter(target, startOfDay(customRange.to))) return false;
    return true;
  }

  return true;
}

export interface DashboardFilterOptions {
  branch?: string | undefined;
  sector?: string | undefined;
  range?: DateRangeKey | undefined;
  customRange?: CustomDateRange | undefined;
}

export function filterFindings(findings: Finding[], opts: DashboardFilterOptions): Finding[] {
  return findings.filter((f) => {
    if (opts.branch && opts.branch !== "all" && f.branchCode !== opts.branch) return false;
    if (opts.sector && opts.sector !== "all" && f.sector !== opts.sector) return false;
    if (opts.range && !isInDateRange(parseDemoDate(f.detected), opts.range, opts.customRange)) {
      return false;
    }
    return true;
  });
}

export function filterReports(reports: BankReport[], opts: DashboardFilterOptions): BankReport[] {
  return reports.filter((r) => {
    if (opts.branch && opts.branch !== "all" && r.branchCode !== opts.branch) return false;
    if (opts.sector && opts.sector !== "all" && r.sector !== opts.sector) return false;
    if (opts.range && !isInDateRange(parseDemoDate(r.uploadedAt), opts.range, opts.customRange)) {
      return false;
    }
    return true;
  });
}

export function isActiveFinding(f: Finding): boolean {
  return f.status !== "Resolved" && f.status !== "Dismissed";
}

export function computeKpis(
  reports: BankReport[],
  findings: Finding[],
  branch = "all",
  sector = "all",
) {
  const active = findings.filter(isActiveFinding);
  const critical = findings.filter((f) => f.risk === "Critical");
  const immediate = active.filter((f) => f.risk === "Critical" || f.risk === "High").length;
  const branchesCovered = new Set(reports.map((r) => r.branchCode)).size;

  return [
    {
      id: "reports",
      label: "Total Reports",
      value: String(reports.length),
      subtitle:
        branch !== "all"
          ? `Filtered to branch ${branch}`
          : sector !== "all"
            ? `${reports.length} report${reports.length === 1 ? "" : "s"} in ${sector}`
            : `${branchesCovered} branches represented`,
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
  ];
}

export function generateDashboardInsight(
  branch: string,
  sector: string,
  range: DateRangeKey,
  findings: Finding[],
  reports: BankReport[],
): string {
  const active = findings.filter(isActiveFinding);
  const critical = active.filter((f) => f.risk === "Critical");
  const high = active.filter((f) => f.risk === "High");

  const branchLabel = branch !== "all" ? `Branch ${branch}` : null;
  const sectorLabel = sector !== "all" ? sector : null;
  const rangeLabel =
    range === "last-week"
      ? "Prior week"
      : range === "last-30"
        ? "Last 30 days"
        : range === "custom"
          ? "Custom period"
          : null;

  if (branch === "all" && sector === "all" && range === "this-week") {
    return "Overall risk increased 14% this week, primarily driven by transaction anomalies in Corporate Lending and two branch-level reporting mismatches.";
  }

  const context =
    [rangeLabel, branchLabel, sectorLabel].filter(Boolean).join(" · ") || "Selected filters";

  if (active.length === 0) {
    return `No active findings detected for ${context}. Audit telemetry indicates nominal compliance across all evaluated checkpoints.`;
  }

  if (critical.length > 0) {
    const topFinding = critical[0]!;
    return `${context}: ${critical.length} critical finding${critical.length > 1 ? "s" : ""} requiring auditor review. Primary concern: "${topFinding.title}" (Risk Score ${topFinding.score}/100).`;
  }

  if (high.length > 0) {
    const topFinding = high[0]!;
    return `${context}: ${high.length} high-priority finding${high.length > 1 ? "s" : ""} open. Key area: "${topFinding.title}" with remediation underway.`;
  }

  return `${context}: ${active.length} active finding${active.length > 1 ? "s" : ""} identified with moderate risk profile. ${reports.length} report${reports.length === 1 ? "" : "s"} indexed.`;
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

  const totalOriginal = baseRiskTrend[baseRiskTrend.length - 1];
  const scale =
    totalOriginal &&
    totalOriginal.critical + totalOriginal.high + totalOriginal.medium + totalOriginal.low > 0
      ? Math.max(
          0.1,
          (counts.critical + counts.high + counts.medium + counts.low) /
            (totalOriginal.critical +
              totalOriginal.high +
              totalOriginal.medium +
              totalOriginal.low),
        )
      : 1;

  const trend = baseRiskTrend.map((t, idx) => {
    if (idx === baseRiskTrend.length - 1) {
      return { ...t, ...counts, score: avgScore, branches };
    }
    return {
      week: t.week,
      critical: Math.round(t.critical * scale),
      high: Math.round(t.high * scale),
      medium: Math.round(t.medium * scale),
      low: Math.round(t.low * scale),
      score: Math.min(100, Math.round(t.score * (avgScore > 0 ? avgScore / 74 : 1))),
      branches: Math.min(branches || 1, t.branches),
    };
  });

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
