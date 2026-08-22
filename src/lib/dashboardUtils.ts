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
    return true;
  });
}

export function isActiveFinding(f: Finding): boolean {
  return f.status !== "Resolved" && f.status !== "Dismissed";
}

export function computeAuditCoverage(
  reports: BankReport[],
  branch = "all",
  sector = "all",
): {
  percentage: number;
  branchesCovered: number;
  totalBranches: number;
  subtitle: string;
} {
  const totalBranches = BRANCHES.length;
  if (branch !== "all") {
    const hasReport = reports.some((r) => r.branchCode === branch);
    return {
      percentage: hasReport ? 100 : 0,
      branchesCovered: hasReport ? 1 : 0,
      totalBranches: 1,
      subtitle: hasReport ? `Branch ${branch} covered` : `No reports filed for ${branch}`,
    };
  }

  const branchesCovered = new Set(reports.map((r) => r.branchCode)).size;
  const percentage = totalBranches > 0 ? Math.round((branchesCovered / totalBranches) * 100) : 0;
  const subtitle =
    sector !== "all"
      ? `Across ${branchesCovered} of ${totalBranches} branches (${sector})`
      : `Across ${branchesCovered} of ${totalBranches} branches`;

  return { percentage, branchesCovered, totalBranches, subtitle };
}

export function computeKpis(
  reports: BankReport[],
  findings: Finding[],
  branch = "all",
  sector = "all",
) {
  const active = findings.filter(isActiveFinding);
  const critical = findings.filter((f) => f.risk === "Critical");
  const coverage = computeAuditCoverage(reports, branch, sector);
  const immediate = active.filter((f) => f.risk === "Critical" || f.risk === "High").length;

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
            : `${coverage.branchesCovered} branches represented`,
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
      subtitle: coverage.subtitle,
      icon: "Target" as const,
      tone: "teal" as const,
      href: "/audit-intelligence",
    },
  ];
}

export function generateDashboardInsight(
  branch: string,
  sector: string,
  findings: Finding[],
  reports: BankReport[],
): string {
  const active = findings.filter(isActiveFinding);
  const critical = active.filter((f) => f.risk === "Critical");
  const high = active.filter((f) => f.risk === "High");

  if (branch === "all" && sector === "all") {
    return "Overall risk increased 14% this week, primarily driven by transaction anomalies in Corporate Lending and two branch-level reporting mismatches.";
  }

  const branchLabel = branch !== "all" ? `Branch ${branch}` : null;
  const sectorLabel = sector !== "all" ? sector : null;
  const context = [branchLabel, sectorLabel].filter(Boolean).join(" · ");

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
