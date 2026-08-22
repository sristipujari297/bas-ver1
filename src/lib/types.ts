export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type FindingStatus =
  "New" | "Under Review" | "Confirmed" | "Remediation Pending" | "Resolved" | "Dismissed";

export type FindingType =
  | "Transaction Anomaly"
  | "Reporting Mismatch"
  | "Compliance Risk"
  | "Access Control Failure"
  | "Loan Disbursement Anomaly"
  | "Unusual Account Activity"
  | "KPI Deviation";

export type ReportStatus =
  "Uploaded" | "Parsing" | "Processing" | "Indexed" | "Analysis Complete" | "Failed";

export type RemediationStatus =
  "Not Started" | "In Progress" | "Pending Verification" | "Completed" | "Overdue" | "Dismissed";

export type ReviewStage =
  "AI Suggested" | "Pending Auditor Review" | "Auditor Confirmed" | "Remediation Approved";

export interface EvidenceRef {
  id: string;
  documentId: string;
  documentName: string;
  fileType: "PDF" | "XLSX" | "CSV" | "DOCX";
  locator: string;
  page?: number | undefined;
  snippet: string;
  findingIds: string[];
}

export interface EvidenceDocument {
  id: string;
  name: string;
  fileType: "PDF" | "XLSX" | "CSV" | "DOCX";
  branch: string;
  sector: string;
  date: string;
  pages: number;
  indexed: boolean;
  linkedFindingIds: string[];
}

export interface Finding {
  id: string;
  ref: string;
  title: string;
  branch: string;
  branchCode: string;
  sector: string;
  type: FindingType;
  risk: RiskLevel;
  score: number;
  confidence: number;
  detected: string;
  status: FindingStatus;
  reviewStage: ReviewStage;
  owner: string;
  whyFlagged: string;
  rootCause: {
    observedPattern: string;
    potentialCause: string;
    affectedControls: string[];
    riskImplication: string;
  };
  causeChain: string[];
  evidenceIds: string[];
  recommendations: string[];
  reportId?: string | undefined;
}

export interface BankReport {
  id: string;
  name: string;
  fileType: "PDF" | "XLSX" | "CSV" | "DOCX";
  branch: string;
  branchCode: string;
  sector: string;
  reportType: string;
  period: string;
  uploadedAt: string;
  uploadedBy: string;
  status: ReportStatus;
  progress: number;
  pages: number;
  records: number;
  findingIds: string[];
  extracted: {
    label: string;
    value: string;
    delta?: string | undefined;
    page: number;
    anomaly?: boolean | undefined;
  }[];
  documentPages: {
    page: number;
    heading: string;
    lines: string[];
    highlight?: boolean | undefined;
  }[];
  aiSummary: string;
  aiConfidence: number;
}

export interface RemediationAction {
  id: string;
  action: string;
  findingId: string;
  findingRef: string;
  risk: RiskLevel;
  owner: string;
  dueDate: string;
  status: RemediationStatus;
  priority: "P1" | "P2" | "P3";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  workflow: string;
  agent: string;
  action: string;
  status: "Success" | "Warning" | "Failed";
  duration: string;
  report: string;
  details: string;
}

export interface AppNotification {
  id: string;
  title: string;
  context: string;
  time: string;
  severity: RiskLevel | "Info";
  href: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  response?: AIResponse;
  createdAt: string;
}

export interface AIResponse {
  answer: string;
  summary: string;
  keyFindings: string[];
  riskLabel?: string;
  riskScore?: number;
  confidence?: number;
  findingIds?: string[];
  evidenceIds?: string[];
  recommendations?: string[];
}
