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

/** Generate realistic mock evidence and associated document object linked to a finding and report. */
export function generateEvidenceFromReport(
  report: BankReport,
  finding: Finding,
): {
  evidence: EvidenceRef;
  document: EvidenceDocument;
} {
  const ts = Date.now();
  const evId = `ev-${ts}`;
  const docId = `doc-${ts}`;
  const fileType = report.fileType;
  const sector = report.sector;
  const nameLower = report.name.toLowerCase();

  let locator: string;
  let page: number | undefined;
  let snippet: string;

  if (fileType === "PDF") {
    page =
      report.documentPages.find((p) => p.highlight)?.page ?? report.documentPages[0]?.page ?? 7;

    let section = "Section 4.2 · High-Value Outbound Transactions";
    if (sector === "Retail Banking" || nameLower.includes("retail") || nameLower.includes("kyc")) {
      section = "Section 2.1 · Customer Due Diligence Audit Sampling";
      snippet =
        "Audit sample of 100 customer account onboarding files revealed 14 accounts activated with manual KYC override without secondary PAN/Aadhaar biometric re-validation.";
    } else if (
      sector === "Treasury" ||
      nameLower.includes("treasury") ||
      nameLower.includes("fx")
    ) {
      section = "Section 3.4 · Daily FX Forward Deal Executions";
      snippet =
        "Deal ticket log records 3 USD/INR forward contracts executed at 84.12 (+18 bps above 83.94 mid-rate benchmark) without documented dealer rationale or supervisory override tag.";
    } else if (
      sector === "SME Banking" ||
      nameLower.includes("sme") ||
      nameLower.includes("credit")
    ) {
      section = "Section 5.1 · Working Capital Credit Facility Review";
      snippet =
        "Drawing power computation for 6 cash-credit facilities omitted deduction of INR 4.2 Cr in book debts overdue >90 days, resulting in unauthorized limit expansion.";
    } else {
      snippet =
        report.documentPages.find((p) => p.page === page)?.lines.join(" ") ??
        "Total outbound transaction volume for the reporting period reached INR 388.1 Cr (+162% vs prior week), concentrated across 19 counterparties with only INR 91.4 Cr in matching sanctioned loan disbursement records.";
    }
    locator = `Page ${page} · ${section}`;
  } else if (fileType === "XLSX") {
    let sheet = "Disbursement_Data";
    let rows = "Rows 142–186";
    if (sector === "Retail Banking" || nameLower.includes("retail")) {
      sheet = "KYC_Exception_Register";
      rows = "Rows 48–86";
      snippet =
        "14 onboarding records logged with status 'AML Override Active' and blank biometric timestamp verification fields.";
    } else if (sector === "Treasury" || nameLower.includes("treasury")) {
      sheet = "FX_Trade_Blotter";
      rows = "Rows 12–28";
      snippet =
        "Forward contracts FWD-2026-0881 through 0883 booked with 18 bps variance from Reuters interbank mid-rate.";
    } else if (sector === "SME Banking" || nameLower.includes("sme")) {
      sheet = "Drawing_Power_Calc";
      rows = "Rows 92–114";
      snippet =
        "Eligible debtor receivables column includes overdue invoices exceeding 90-day aging cutoff for 6 borrower accounts.";
    } else {
      sheet = "Transaction_Ledger";
      rows = "Rows 182–215";
      snippet =
        "19 transaction records totalling INR 388.1 Cr logged without matching sanction-letter IDs in the core credit approval column (Cols D–F).";
    }
    locator = `Sheet: ${sheet} · ${rows}`;
  } else if (fileType === "CSV") {
    locator = "Rows 84–128 · Exception Records";
    snippet =
      "Automated exception report flags 26 transactions exceeding daily single-originator limit of INR 10 Cr without required dual-authorization approval tags.";
  } else {
    // DOCX
    locator = "Section 3.2 · Internal Control & Compliance Observations";
    snippet =
      "Branch internal audit notes identify 3 unmitigated control deficiencies in manual batch ledger reconciliation and dual-authorization procedures.";
  }

  const evidence: EvidenceRef = {
    id: evId,
    documentId: docId,
    documentName: report.name,
    fileType: report.fileType,
    locator,
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
    pages: report.pages || 22,
    indexed: true,
    linkedFindingIds: [finding.id],
  };

  return { evidence, document };
}

/** Generate a realistic mock remediation action linked to a finding. */
export function generateRemediationFromFinding(finding: Finding): RemediationAction {
  const ts = Date.now();
  const rmId = `rm-${ts}`;

  const action =
    finding.recommendations[0] ??
    `Review and remediate ${finding.type.toLowerCase()} per internal audit guidelines`;

  const priority: "P1" | "P2" | "P3" =
    finding.risk === "Critical" ? "P1" : finding.risk === "High" ? "P2" : "P3";

  return {
    id: rmId,
    action,
    findingId: finding.id,
    findingRef: finding.ref,
    risk: finding.risk,
    owner: finding.owner && finding.owner !== "Unassigned" ? finding.owner : "Unassigned",
    dueDate: "29 Aug 2026",
    status: "Not Started",
    priority,
  };
}

/** Generate a dynamic notification from a newly created finding and report. */
export function generateNotificationFromFinding(
  report: BankReport,
  finding: Finding,
): AppNotification {
  const ts = Date.now();
  const title =
    finding.risk === "Critical"
      ? "Critical finding detected"
      : finding.risk === "High"
        ? "High risk finding detected"
        : `${finding.risk} risk finding detected`;

  const context = `Branch ${report.branchCode} · ${report.sector} · Finding ${finding.ref}`;

  return {
    id: `n-${ts}`,
    title,
    context,
    time: "Just now",
    severity: finding.risk,
    href: `/findings/${finding.id}`,
    read: false,
  };
}

/** Generate the 6 sequential audit log events for report processing. */
export function generateAuditLogsFromProcessing(
  report: BankReport,
  finding: Finding,
  remediation: RemediationAction,
): AuditLogEntry[] {
  const ts = Date.now();
  const now =
    "22 Aug · " +
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return [
    {
      id: `log-${ts}-1`,
      timestamp: now,
      workflow: "Report Ingestion",
      agent: "Ingestion Agent",
      action: "Report Uploaded",
      status: "Success",
      duration: "0.6s",
      report: report.name,
      details: `Uploaded ${report.name} (${report.fileType}) for ${report.branch} (${report.branchCode}).`,
    },
    {
      id: `log-${ts}-2`,
      timestamp: now,
      workflow: "Document Parsing",
      agent: "DocumentParser",
      action: "Report Parsed",
      status: "Success",
      duration: "1.4s",
      report: report.name,
      details: `Parsed ${report.pages} pages, 18 tables, and extracted ${report.records} financial records.`,
    },
    {
      id: `log-${ts}-3`,
      timestamp: now,
      workflow: "Evidence Extraction",
      agent: "VectorIndexer",
      action: "Evidence Extracted",
      status: "Success",
      duration: "1.1s",
      report: report.name,
      details: `Extracted evidence citations and indexed vector chunks into pgvector store.`,
    },
    {
      id: `log-${ts}-4`,
      timestamp: now,
      workflow: "Audit Analysis",
      agent: "AuditScoringAgent",
      action: "AI Analysis Completed",
      status: "Success",
      duration: "2.8s",
      report: report.name,
      details: `Evaluated audit rules across ${report.sector} with ${finding.confidence}% AI confidence. Risk score: ${finding.score}/100.`,
    },
    {
      id: `log-${ts}-5`,
      timestamp: now,
      workflow: "Finding Generation",
      agent: "AuditAnalystAgent",
      action: "Finding Created",
      status: "Success",
      duration: "0.9s",
      report: report.name,
      details: `Created finding ${finding.ref} (${finding.title}) with risk severity ${finding.risk}.`,
    },
    {
      id: `log-${ts}-6`,
      timestamp: now,
      workflow: "Remediation Planning",
      agent: "Remediation Agent",
      action: "Remediation Created",
      status: "Success",
      duration: "0.7s",
      report: report.name,
      details: `Drafted ${remediation.priority} action: "${remediation.action}" due ${remediation.dueDate}.`,
    },
  ];
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
  const finding = generateFindingFromReport(report, existingFindingCount);
  const { evidence, document } = generateEvidenceFromReport(report, finding);
  const remediation = generateRemediationFromFinding(finding);
  const notification = generateNotificationFromFinding(report, finding);
  const auditLogs = generateAuditLogsFromProcessing(report, finding, remediation);

  return {
    finding: { ...finding, evidenceIds: [evidence.id] },
    evidenceRefs: [evidence],
    document,
    remediation,
    notification,
    auditLogs,
  };
}
