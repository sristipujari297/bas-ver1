import {
  auditLogs,
  branchRisk,
  evidenceDocuments,
  evidenceRefs,
  findings,
  notifications,
  pipelineStages,
  remediationActions,
  reports,
  riskDistribution,
  riskDomains,
  riskTrend,
  sectorHeatmap,
} from "@/data/mockData";
import type {
  AppNotification,
  AuditLogEntry,
  BankReport,
  EvidenceDocument,
  EvidenceRef,
  Finding,
  RemediationAction,
} from "@/lib/types";

/**
 * Mock audit service. A real implementation would call the FastAPI layer,
 * which orchestrates n8n workflows over pgvector-backed evidence.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listFindings(): Promise<Finding[]> {
  await delay(200);
  return findings;
}

export async function getFinding(id: string): Promise<Finding | undefined> {
  await delay(160);
  return findings.find((f) => f.id === id);
}

export async function listEvidence(): Promise<EvidenceRef[]> {
  await delay(160);
  return evidenceRefs;
}

export async function listEvidenceDocuments(): Promise<EvidenceDocument[]> {
  await delay(160);
  return evidenceDocuments;
}

export async function listRemediation(): Promise<RemediationAction[]> {
  await delay(180);
  return remediationActions;
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  await delay(180);
  return auditLogs;
}

export async function listNotifications(): Promise<AppNotification[]> {
  await delay(120);
  return notifications;
}

export function getAnalytics() {
  return {
    riskTrend,
    branchRisk,
    sectorHeatmap,
    riskDistribution,
    riskDomains,
    pipelineStages,
  };
}

/** @deprecated Use computeKpis from @/lib/dashboardUtils with live store data instead. */
export const kpis = [
  {
    id: "reports",
    label: "Total Reports",
    value: String(reports.length),
    subtitle: "Derived from report register",
    icon: "FileText",
    tone: "navy" as const,
    href: "/reports",
  },
  {
    id: "findings",
    label: "Active Findings",
    value: String(
      findings.filter((f) => f.status !== "Resolved" && f.status !== "Dismissed").length,
    ),
    subtitle: "Derived from findings register",
    icon: "AlertTriangle",
    tone: "high" as const,
    href: "/findings",
  },
  {
    id: "critical",
    label: "Critical Risks",
    value: String(
      findings.filter(
        (f) => f.risk === "Critical" && f.status !== "Resolved" && f.status !== "Dismissed",
      ).length,
    ),
    subtitle: "Open critical findings",
    icon: "ShieldAlert",
    tone: "critical" as const,
    href: "/findings?risk=Critical",
  },
  {
    id: "coverage",
    label: "Audit Coverage",
    value: `${Math.round((new Set(reports.map((r) => r.branchCode)).size / 8) * 100)}%`,
    subtitle: "Branch coverage from reports",
    icon: "Target",
    tone: "teal" as const,
    href: "/audit-intelligence",
  },
];

export const dashboardInsight =
  "Overall risk increased 14% this week, primarily driven by transaction anomalies in Corporate Lending and two branch-level reporting mismatches.";
