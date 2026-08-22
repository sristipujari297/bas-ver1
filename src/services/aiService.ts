import { findings } from "@/data/mockData";
import type { AIResponse } from "@/lib/types";

/**
 * Mock AI service.
 *
 * Replace `askAudit` with a call to the real API:
 *   POST /api/assistant/query  ->  n8n orchestration -> RAG (pgvector) -> local LLM.
 * The response shape (AIResponse) is intentionally the contract the UI relies on,
 * so no component changes are required when the backend lands.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const suggestedQuestions = [
  "Why did Branch 042's risk score increase?",
  "Show me all critical findings from this week.",
  "Which branches have unusual transaction activity?",
  "What are the main compliance risks this month?",
  "Compare Branch 042 and Branch 017.",
  "What evidence supports Finding #004?",
  "Which findings require immediate remediation?",
];

const library: { match: RegExp; build: () => AIResponse }[] = [
  {
    match: /(042|andheri).*(risk|score|increase|why)|why.*(042|andheri)/i,
    build: () => ({
      summary:
        "Branch 042's risk score rose from 68 to 92 because transaction activity materially outpaced reported loan-disbursement KPIs.",
      answer: "Root-cause analysis for Branch 042 (Corporate Lending), week 15–21 Aug 2026.",
      keyFindings: [
        "Outbound transaction volume increased 184% while reported loan activity increased only 31%.",
        "High-value transfers above INR 5 Cr rose from 7 to 41, with 9 executed outside cut-off hours.",
        "15 disbursement records totalling INR 68.4 Cr lack matching sanction-letter references.",
      ],
      riskLabel: "Critical",
      riskScore: 92,
      confidence: 91,
      findingIds: ["f-004"],
      evidenceIds: ["ev-001", "ev-002", "ev-003"],
      recommendations: [
        "Reconcile reported KPIs with transaction-level records for the period.",
        "Verify supporting documentation for the 15 flagged disbursements.",
      ],
    }),
  },
  {
    match: /critical findings|critical risks/i,
    build: () => ({
      summary:
        "4 critical-tier risks are open this week; 1 finding is at critical severity and unassigned.",
      answer: "Critical findings for the current reporting week.",
      keyFindings: [
        "#004 Unusual Loan Disbursement Pattern — Andheri East · 92/100 · unassigned.",
        "#002 Repeated Transaction Mismatch — Bandra · 81/100 · under review.",
        "#003 Privileged Access Retained After Role Change — Powai · 76/100 · confirmed.",
      ],
      riskLabel: "Critical",
      riskScore: 92,
      confidence: 88,
      findingIds: ["f-004", "f-002", "f-003"],
      evidenceIds: ["ev-001", "ev-004", "ev-005"],
      recommendations: ["Assign an owner to Finding #004 and escalate to compliance."],
    }),
  },
  {
    match: /unusual transaction|transaction activity|anomal/i,
    build: () => ({
      summary:
        "Two branches show statistically unusual transaction activity this week: Andheri East (042) and Bandra (017).",
      answer: "Branch-level transaction anomaly scan for week 35.",
      keyFindings: [
        "Andheri East · 042 — volume +184%, counterparty concentration 62.4% (prior 28.1%).",
        "Bandra · 017 — 1,284 transactions stuck in reconciliation exceptions for 6 days.",
        "Fort · 003 — 3 intraday counterparty limit breaches cleared before end-of-day.",
      ],
      riskLabel: "High",
      riskScore: 84,
      confidence: 86,
      findingIds: ["f-004", "f-002", "f-006"],
      evidenceIds: ["ev-003", "ev-004", "ev-007"],
      recommendations: ["Prioritise transaction-level sampling at Branch 042 and Branch 017."],
    }),
  },
  {
    match: /complian|kyc|regulator/i,
    build: () => ({
      summary:
        "Compliance risk is 64/100 and trending up 4%, driven by KYC ageing and access recertification gaps.",
      answer: "Compliance risk posture for August 2026.",
      keyFindings: [
        "37 SME accounts remain past the 30-day KYC verification window (Lower Parel · 024).",
        "4 privileged accounts hold entitlements beyond role scope (Powai · 008).",
        "Reconciliation SLA breaches weaken reporting reliability at Bandra · 017.",
      ],
      riskLabel: "Medium",
      riskScore: 64,
      confidence: 79,
      findingIds: ["f-005", "f-003"],
      evidenceIds: ["ev-006", "ev-005"],
      recommendations: [
        "Freeze outbound limits on accounts past the KYC window.",
        "Run an out-of-cycle access recertification for Digital Banking operations.",
      ],
    }),
  },
  {
    match: /compare.*(042|017)|(042|017).*(vs|versus|compare)/i,
    build: () => ({
      summary:
        "Branch 042 carries a higher and faster-rising risk score (92, +24) than Branch 017 (81, +6); the drivers differ.",
      answer: "Comparison — Andheri East (042) vs Bandra (017).",
      keyFindings: [
        "042: transaction/KPI mismatch in Corporate Lending — probable control failure.",
        "017: process breakdown in retail reconciliation — recurring across 3 weeks.",
        "042 has unmatched documentation; 017 has no documentation gaps.",
      ],
      riskLabel: "High",
      riskScore: 87,
      confidence: 83,
      findingIds: ["f-004", "f-002"],
      evidenceIds: ["ev-001", "ev-004"],
      recommendations: ["Treat 042 as a control investigation and 017 as a process remediation."],
    }),
  },
  {
    match: /evidence.*(004|#4)|support.*finding/i,
    build: () => ({
      summary:
        "Finding #004 is supported by three indexed evidence references across two branches' documents.",
      answer: "Evidence trace for Finding #004.",
      keyFindings: [
        "Branch_042_Weekly_Report.pdf · Page 7 — transaction volume +184%.",
        "Loan_Disbursement_Aug.xlsx · Rows 182–196 — 15 records without sanction references.",
        "Transaction_Report_W34.pdf · Page 12 — high-value transfers rose from 7 to 41.",
      ],
      riskLabel: "Critical",
      riskScore: 92,
      confidence: 91,
      findingIds: ["f-004"],
      evidenceIds: ["ev-001", "ev-002", "ev-003"],
      recommendations: ["Open each source reference before confirming the finding."],
    }),
  },
  {
    match: /remediation|immediate|overdue|action/i,
    build: () => ({
      summary:
        "Three remediation actions need attention now: one overdue and two P1 actions not started.",
      answer: "Remediation priorities as of today.",
      keyFindings: [
        "Overdue: revoke override entitlements for 4 privileged accounts (Finding #003).",
        "P1 not started: review high-value transactions for 15–21 Aug (Finding #004).",
        "P1 not started: verify sanction documentation for 15 disbursements (Finding #004).",
      ],
      riskLabel: "High",
      riskScore: 86,
      confidence: 82,
      findingIds: ["f-003", "f-004"],
      evidenceIds: ["ev-005", "ev-002"],
      recommendations: ["Approve remediation for Finding #004 and assign owners today."],
    }),
  },
];

function fallback(question: string): AIResponse {
  const top = findings[0]!;
  return {
    summary: `No pre-indexed answer matched "${question.slice(0, 80)}". The highest-severity open item this week is ${top.ref} ${top.title}.`,
    answer: "Closest available audit intelligence.",
    keyFindings: [
      `${top.ref} ${top.title} — ${top.branch} · ${top.score}/100.`,
      "Try asking about a branch code, risk category, finding number, or remediation status.",
    ],
    riskLabel: top.risk,
    riskScore: top.score,
    confidence: 61,
    findingIds: [top.id],
    evidenceIds: top.evidenceIds,
    recommendations: ["Refine the question with a branch, sector, or finding reference."],
  };
}

export async function askAudit(question: string): Promise<AIResponse> {
  await delay(1400);
  const hit = library.find((entry) => entry.match.test(question));
  return hit ? hit.build() : fallback(question);
}
