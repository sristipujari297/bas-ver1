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
 * Mock report service. Replace these functions with FastAPI calls
 * (POST /reports, GET /reports, GET /reports/:id) without touching the UI.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface UploadTick {
  progress: number;
  status: BankReport["status"];
  message: string;
}

/** Simulates the ingestion pipeline for a newly uploaded file. */
export async function simulateIngestion(onTick: (tick: UploadTick) => void): Promise<void> {
  const steps: UploadTick[] = [
    { progress: 18, status: "Uploaded", message: "Uploading document..." },
    { progress: 42, status: "Parsing", message: "Parsing financial tables..." },
    { progress: 68, status: "Processing", message: "Extracting KPIs and records..." },
    { progress: 86, status: "Indexed", message: "Embedding evidence chunks..." },
    { progress: 100, status: "Analysis Complete", message: "Audit analysis complete." },
  ];
  for (const step of steps) {
    await delay(750);
    onTick(step);
  }
}

export interface ReportAnalysisResult {
  finding: Finding;
  evidenceRefs: EvidenceRef[];
  document: EvidenceDocument;
  remediation: RemediationAction;
  notification: AppNotification;
  auditLogs: AuditLogEntry[];
}

function nextFindingRef(existingCount: number): string {
  return `#${String(existingCount + 1).padStart(3, "0")}`;
}

/** Generate a realistic finding, evidence, remediation, notification and audit logs from a processed report. */
export function generateAnalysisFromReport(
  report: BankReport,
  existingFindingCount: number,
): ReportAnalysisResult {
  const ts = Date.now();
  const findingId = `f-${ts}`;
  const ref = nextFindingRef(existingFindingCount);
  const evId = `ev-${ts}`;
  const docId = `doc-${ts}`;
  const rmId = `rm-${ts}`;

  const page =
    report.documentPages.find((p) => p.highlight)?.page ?? report.documentPages[0]?.page ?? 7;

  const finding: Finding = {
    id: findingId,
    ref,
    title: "Unusual Loan Disbursement Pattern",
    branch: report.branch,
    branchCode: report.branchCode,
    sector: report.sector,
    type: "Loan Disbursement Anomaly",
    risk: "Critical",
    score: 92,
    confidence: 91,
    detected: "Just now",
    status: "New",
    reviewStage: "AI Suggested",
    owner: "Unassigned",
    whyFlagged:
      "Transaction volume increased sharply while reported loan activity moved only modestly, creating a significant mismatch between observed activity and reported KPIs.",
    rootCause: {
      observedPattern:
        "Outbound transaction volume rose materially week-on-week across multiple counterparties, while the reported loan-disbursement KPI moved only +28–31%.",
      potentialCause:
        "Discrepancy between transaction activity and reported loan-disbursement KPIs, consistent with disbursements booked outside the standard sanction workflow or delayed KPI reporting.",
      affectedControls: [
        "Sanction-letter to disbursement matching",
        "Maker-checker on high-value transfers",
        "Weekly KPI reconciliation",
      ],
      riskImplication:
        "Unreconciled disbursements of this magnitude may conceal credit-limit breaches, misstated weekly KPIs, or unauthorised fund movement.",
    },
    causeChain: [
      "Risk score increase",
      "Transaction volume anomaly",
      "High-value transfers increased",
      "Mismatch with reported loan activity",
      "Possible reporting / control failure",
    ],
    evidenceIds: [evId],
    recommendations: [
      "Review high-value transactions from the reporting period.",
      "Verify supporting documentation for flagged loan disbursements.",
      "Reconcile reported KPIs with transaction-level records.",
    ],
    reportId: report.id,
  };

  const snippet =
    report.documentPages.find((p) => p.page === page)?.lines.join(" ") ??
    "Loan disbursement volume increased materially versus the prior reporting period, concentrated in high-value counterparties.";

  const evidenceRef: EvidenceRef = {
    id: evId,
    documentId: docId,
    documentName: report.name,
    fileType: report.fileType,
    locator: `Page ${page} · Transaction Summary`,
    page,
    snippet,
    findingIds: [findingId],
  };

  const document: EvidenceDocument = {
    id: docId,
    name: report.name,
    fileType: report.fileType,
    branch: `${report.branch} · ${report.branchCode}`,
    sector: report.sector,
    date: "Just now",
    pages: report.pages,
    indexed: true,
    linkedFindingIds: [findingId],
  };

  const remediation: RemediationAction = {
    id: rmId,
    action:
      "Review high-value transactions and verify sanction documentation for flagged disbursements",
    findingId,
    findingRef: ref,
    risk: "Critical",
    owner: "Unassigned",
    dueDate: "29 Aug 2026",
    status: "Not Started",
    priority: "P1",
  };

  const notification: AppNotification = {
    id: `n-${ts}`,
    title: "Critical finding detected",
    context: `Branch ${report.branchCode} · ${report.sector}`,
    time: "Just now",
    severity: "Critical",
    href: `/findings/${findingId}`,
    read: false,
  };

  const now =
    "22 Aug · " +
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const auditLogs: AuditLogEntry[] = [
    {
      id: `l-${ts}-1`,
      timestamp: now,
      workflow: "Report Ingestion",
      agent: "Ingestion Agent",
      action: "Report Uploaded",
      status: "Success",
      duration: "1.2s",
      report: report.name,
      details: `Uploaded by ${report.uploadedBy}`,
    },
    {
      id: `l-${ts}-2`,
      timestamp: now,
      workflow: "Report Ingestion",
      agent: "Parsing Agent",
      action: "Report Parsed",
      status: "Success",
      duration: "3.8s",
      report: report.name,
      details: `${report.pages} pages · ${report.records.toLocaleString()} records extracted`,
    },
    {
      id: `l-${ts}-3`,
      timestamp: now,
      workflow: "Evidence Retrieval",
      agent: "RAG Agent",
      action: "Evidence Extracted",
      status: "Success",
      duration: "2.4s",
      report: report.name,
      details: `Page ${page} indexed · pgvector upsert complete`,
    },
    {
      id: `l-${ts}-4`,
      timestamp: now,
      workflow: "Audit Analysis",
      agent: "Audit Agent",
      action: "AI Analysis Completed",
      status: "Success",
      duration: "4.6s",
      report: report.name,
      details: "Confidence 91% · transaction/KPI mismatch detected",
    },
    {
      id: `l-${ts}-5`,
      timestamp: now,
      workflow: "Audit Analysis",
      agent: "Reasoning Agent",
      action: "Finding Created",
      status: "Success",
      duration: "1.8s",
      report: report.name,
      details: `${ref} Unusual Loan Disbursement Pattern · Critical · 92/100`,
    },
    {
      id: `l-${ts}-6`,
      timestamp: now,
      workflow: "Remediation",
      agent: "Remediation Agent",
      action: "Remediation Created",
      status: "Success",
      duration: "1.1s",
      report: report.name,
      details: "P1 action drafted · pending auditor review",
    },
  ];

  return { finding, evidenceRefs: [evidenceRef], document, remediation, notification, auditLogs };
}
