import {
  BRANCHES,
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

export interface DashboardKpiSummary {
  totalReports: number;
  activeFindings: number;
  criticalRisks: number;
  auditCoverage: {
    percentage: number;
    branchesCovered: number;
    totalBranches: number;
  };
}

export function computeAuditCoverage(reportsData: BankReport[]): {
  percentage: number;
  branchesCovered: number;
  totalBranches: number;
} {
  const branchesCovered = new Set(reportsData.map((r) => r.branchCode)).size;
  const totalBranches = BRANCHES.length;
  const percentage = totalBranches > 0 ? Math.round((branchesCovered / totalBranches) * 100) : 0;
  return { percentage, branchesCovered, totalBranches };
}

export function computeDashboardKpis(
  reportsData: BankReport[] = reports,
  findingsData: Finding[] = findings,
): DashboardKpiSummary {
  const totalReports = reportsData.length;
  const activeFindings = findingsData.filter(
    (f) => f.status !== "Resolved" && f.status !== "Dismissed",
  ).length;
  const criticalRisks = findingsData.filter(
    (f) => f.risk === "Critical" && f.status !== "Resolved" && f.status !== "Dismissed",
  ).length;
  const auditCoverage = computeAuditCoverage(reportsData);

  return {
    totalReports,
    activeFindings,
    criticalRisks,
    auditCoverage,
  };
}

export const dashboardInsight =
  "Overall risk increased 14% this week, primarily driven by transaction anomalies in Corporate Lending and two branch-level reporting mismatches.";
