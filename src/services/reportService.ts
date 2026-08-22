import type {
  AppNotification,
  AuditLogEntry,
  BankReport,
  EvidenceDocument,
  EvidenceRef,
  Finding,
  FindingType,
  RemediationAction,
  RiskLevel,
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
    { progress: 16, status: "Uploaded", message: "Uploading document..." },
    { progress: 35, status: "Parsing", message: "Parsing financial tables..." },
    { progress: 55, status: "Processing", message: "Extracting KPIs and records..." },
    { progress: 75, status: "Indexed", message: "Extracting evidence chunks..." },
    { progress: 90, status: "Processing", message: "Running AI analysis..." },
    {
      progress: 100,
      status: "Analysis Complete",
      message: "Analysis complete — new finding created.",
    },
  ];
  for (const step of steps) {
    await delay(650);
    onTick(step);
  }
}

export function nextFindingRef(existingCount: number): string {
  return `#${String(existingCount + 1).padStart(3, "0")}`;
}

/** Generate a realistic, deterministic finding associated with an uploaded report. */
export function generateFindingFromReport(
  report: BankReport,
  existingFindingCount: number,
): Finding {
  const ts = Date.now();
  const findingId = `f-${ts}`;
  const ref = nextFindingRef(existingFindingCount);

  const nameLower = report.name.toLowerCase();
  const sector = report.sector;

  let template: {
    title: string;
    type: FindingType;
    risk: RiskLevel;
    score: number;
    confidence: number;
    whyFlagged: string;
    observedPattern: string;
    potentialCause: string;
    affectedControls: string[];
    riskImplication: string;
    causeChain: string[];
    recommendations: string[];
  };

  if (
    sector === "Corporate Lending" ||
    nameLower.includes("loan") ||
    nameLower.includes("lending")
  ) {
    template = {
      title: "Unusual Loan Disbursement Pattern",
      type: "Loan Disbursement Anomaly",
      risk: "Critical",
      score: 92,
      confidence: 91,
      whyFlagged:
        "Outbound corporate transaction activity rose 162% week-on-week while reported loan disbursements moved only 28%, creating an unexplained variance in reported credit KPIs.",
      observedPattern:
        "Outbound transaction volume reached INR 388.1 Cr across 19 counterparties, but sanctioned loan schedule records showed only INR 91.4 Cr.",
      potentialCause:
        "Disbursements executed outside the sanctioned credit line or delayed entry into the central loan management ledger.",
      affectedControls: [
        "Sanction-letter to disbursement matching",
        "Maker-checker on high-value corporate transfers",
        "Weekly loan ledger reconciliation",
      ],
      riskImplication:
        "Unmonitored credit exposure exceeding sanction limits, potential credit-line breach, and financial reporting misstatement.",
      causeChain: [
        "Elevated corporate transaction volume",
        "Mismatch with sanctioned disbursement ledger",
        "Variance exceeded 25% anomaly threshold",
        "Potential control bypass during credit release",
      ],
      recommendations: [
        "Conduct immediate review of high-value disbursements for the reporting period.",
        "Obtain sanction notes and committee approvals for the 19 flagged counterparties.",
        "Reconcile central credit registry records with core transaction feeds.",
      ],
    };
  } else if (
    sector === "Retail Banking" ||
    nameLower.includes("retail") ||
    nameLower.includes("kyc")
  ) {
    template = {
      title: "High-Risk Customer Onboarding Verification Gap",
      type: "Compliance Risk",
      risk: "High",
      score: 81,
      confidence: 88,
      whyFlagged:
        "Audit sampling identified 14 retail accounts opened without mandatory secondary biometric/PAN re-validation, exceeding the 2% regulatory tolerance threshold.",
      observedPattern:
        "14 out of 100 audited customer onboarding records lacked timestamped AML/KYC clearance before initial credit transaction.",
      potentialCause:
        "Branch onboarding staff used manual override during end-of-cycle customer acquisition drive.",
      affectedControls: [
        "Automated KYC document verification gateway",
        "Branch manager sign-off on manual AML overrides",
        "Pre-activation verification lock",
      ],
      riskImplication:
        "Non-compliance with RBI Customer Due Diligence master directions, exposing the bank to AML penalties and synthetic identity fraud.",
      causeChain: [
        "Surge in retail account activations",
        "Manual override applied on KYC verification queue",
        "Absence of secondary document audit trail",
        "Regulatory compliance threshold exceeded",
      ],
      recommendations: [
        "Temporarily restrict debit privileges on the 14 flagged customer accounts.",
        "Initiate 100% re-KYC and automated biometric verification for affected accounts.",
        "Audit branch override logs for the past 30 days.",
      ],
    };
  } else if (sector === "Treasury" || nameLower.includes("treasury") || nameLower.includes("fx")) {
    template = {
      title: "Off-Market FX Forward Rate Execution",
      type: "Transaction Anomaly",
      risk: "High",
      score: 78,
      confidence: 94,
      whyFlagged:
        "Three USD/INR forward contracts executed at exchange rates deviating by more than 18 bps from the interbank mid-rate at time of booking without documented dealer justification.",
      observedPattern:
        "Trade timestamps show execution rates at 84.12 vs interbank benchmark of 83.94 without logged market color or customer spread agreement.",
      potentialCause:
        "Manual deal slip booking without automated rate sanity checks in the legacy front-office system.",
      affectedControls: [
        "Real-time treasury rate feed sanity checks",
        "Supervisory sign-off on rate variances >10 bps",
        "End-of-day deal reconciliation",
      ],
      riskImplication:
        "Unwarranted trading P&L drag and potential market conduct breach under treasury risk guidelines.",
      causeChain: [
        "Execution rate divergence from interbank benchmark",
        "Missing supervisory approval tag in deal ticket",
        "End-of-day rate tolerance check triggered",
      ],
      recommendations: [
        "Request formal trade rationale and time-stamped market quotes from the dealer desk.",
        "Recalculate MTM P&L impact on the 3 flagged forward contracts.",
        "Enable mandatory deal capture validation blocking off-market trades without supervisor approval.",
      ],
    };
  } else if (
    sector === "SME Banking" ||
    nameLower.includes("sme") ||
    nameLower.includes("credit")
  ) {
    template = {
      title: "Drawing Power Calculation Discrepancy",
      type: "KPI Deviation",
      risk: "Medium",
      score: 68,
      confidence: 87,
      whyFlagged:
        "Working capital drawing power for 6 SME cash-credit accounts was computed without deducting aged book debts (>90 days), resulting in INR 4.2 Cr unauthorized limit expansion.",
      observedPattern:
        "Quarterly debtor age analysis submitted by borrowers was not updated in the drawing power calculation sheet.",
      potentialCause:
        "Credit officer calculated drawing power using gross receivables rather than eligible net receivables.",
      affectedControls: [
        "Automated drawing power computation engine",
        "Quarterly stock & debtor audit verification",
        "Credit monitoring limit control",
      ],
      riskImplication:
        "Uncollateralized credit exposure exceeding sanctioned drawing power, increasing non-performing asset risk.",
      causeChain: [
        "Aged debtors >90 days included in drawing power",
        "Limit available exceeded eligible collateral value",
        "Collateral coverage deficit triggered in quarterly review",
      ],
      recommendations: [
        "Immediately recalculate drawing power for the 6 SME accounts deducting aged debts.",
        "Notify borrowers to deposit margin shortfall within 7 business days.",
        "Conduct portfolio-wide review of drawing power calculations across the SME branch book.",
      ],
    };
  } else {
    template = {
      title: "Transaction Volume & Fee Accounting Mismatch",
      type: "Reporting Mismatch",
      risk: "High",
      score: 84,
      confidence: 89,
      whyFlagged:
        "Outbound payment transaction velocity rose 148% during the period while corresponding fee income ledgers remained flat, indicating a breakdown in automated fee accruals.",
      observedPattern:
        "Payment gateway settlement logs show 3,980 processed transactions with only 1,220 fee debit postings in the general ledger.",
      potentialCause:
        "Middleware fee calculation service timed out during peak transaction processing hours.",
      affectedControls: [
        "Gateway-to-general-ledger automated fee reconciliation",
        "Middleware service timeout error logging",
        "Daily unposted fee exception report",
      ],
      riskImplication: "Uncollected bank fee revenue and misstated operational financial records.",
      causeChain: [
        "Transaction volume surge in reporting window",
        "Fee computation service dropout during peak batch",
        "General ledger posting omitted without automated alert",
      ],
      recommendations: [
        "Re-run batch fee calculation for all unposted transactions in the period.",
        "Reconcile fee debit ledger against gateway transaction totals.",
        "Deploy automated alert on fee posting latency exceeding 5 minutes.",
      ],
    };
  }

  const finding: Finding = {
    id: findingId,
    ref,
    title: template.title,
    branch: report.branch,
    branchCode: report.branchCode,
    sector: report.sector,
    type: template.type,
    risk: template.risk,
    score: template.score,
    confidence: template.confidence,
    detected: "Just now",
    status: "New",
    reviewStage: "AI Suggested",
    owner: "Unassigned",
    whyFlagged: template.whyFlagged,
    rootCause: {
      observedPattern: template.observedPattern,
      potentialCause: template.potentialCause,
      affectedControls: template.affectedControls,
      riskImplication: template.riskImplication,
    },
    causeChain: template.causeChain,
    evidenceIds: [],
    recommendations: template.recommendations,
    reportId: report.id,
  };

  return finding;
}

export interface ReportAnalysisResult {
  finding: Finding;
  evidenceRefs: EvidenceRef[];
  document: EvidenceDocument;
  remediation: RemediationAction;
  notification: AppNotification;
  auditLogs: AuditLogEntry[];
}

/** Complete analysis generator for downstream multi-entity creation workflows. */
export function generateAnalysisFromReport(
  report: BankReport,
  existingFindingCount: number,
): ReportAnalysisResult {
  const ts = Date.now();
  const finding = generateFindingFromReport(report, existingFindingCount);
  const docId = `doc-${ts}`;
  const evId = `ev-${ts}`;
  const rmId = `rm-${ts}`;

  const page =
    report.documentPages.find((p) => p.highlight)?.page ?? report.documentPages[0]?.page ?? 7;

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
    findingIds: [finding.id],
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
    linkedFindingIds: [finding.id],
  };

  const remediation: RemediationAction = {
    id: rmId,
    action: finding.recommendations[0] ?? "Review flagged transactions and verify documentation",
    findingId: finding.id,
    findingRef: finding.ref,
    risk: finding.risk,
    owner: "Unassigned",
    dueDate: "29 Aug 2026",
    status: "Not Started",
    priority: finding.risk === "Critical" ? "P1" : finding.risk === "High" ? "P2" : "P3",
  };

  const notification: AppNotification = {
    id: `n-${ts}`,
    title: `${finding.risk} finding detected`,
    context: `Branch ${report.branchCode} · ${report.sector}`,
    time: "Just now",
    severity: finding.risk,
    href: `/findings/${finding.id}`,
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
      id: `log-${ts}-1`,
      timestamp: now,
      workflow: "Report Ingestion",
      agent: "DocumentParser",
      action: "Extracted tables, metadata and text chunks",
      status: "Success",
      duration: "1.2s",
      report: report.name,
      details: `Parsed ${report.pages} pages, ${report.records} records across ${report.branch}.`,
    },
    {
      id: `log-${ts}-2`,
      timestamp: now,
      workflow: "Evidence Indexing",
      agent: "VectorIndexer",
      action: "Generated chunk embeddings & linked evidence citations",
      status: "Success",
      duration: "0.8s",
      report: report.name,
      details: `Generated evidence locator Page ${page}.`,
    },
    {
      id: `log-${ts}-3`,
      timestamp: now,
      workflow: "Risk Scoring",
      agent: "AuditScoringAgent",
      action: `Generated finding ${finding.ref}: ${finding.title}`,
      status: "Success",
      duration: "1.6s",
      report: report.name,
      details: `Risk score: ${finding.score}/100, AI confidence: ${finding.confidence}%.`,
    },
  ];

  return {
    finding: { ...finding, evidenceIds: [evId] },
    evidenceRefs: [evidenceRef],
    document,
    remediation,
    notification,
    auditLogs,
  };
}
