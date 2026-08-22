import type { BankReport, EvidenceDocument, EvidenceRef } from "@/lib/types";

function normalizeDocName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\s-]/g, "")
    .replace(/\.(pdf|xlsx|csv|docx)$/i, "");
}

export interface ReportEvidenceTarget {
  type: "report";
  reportId: string;
  page?: number | undefined;
  tab: "evidence" | "overview";
}

export interface LibraryEvidenceTarget {
  type: "evidence";
  documentId: string;
  evidenceId: string;
}

export type EvidenceViewerTarget = ReportEvidenceTarget | LibraryEvidenceTarget;

/** Resolve the best viewer target for an evidence reference. */
export function resolveEvidenceTarget(
  evidence: EvidenceRef,
  reports: BankReport[],
  documents: EvidenceDocument[],
): EvidenceViewerTarget {
  const doc = documents.find((d) => d.id === evidence.documentId);

  const byExactName = reports.find(
    (r) => normalizeDocName(r.name) === normalizeDocName(evidence.documentName),
  );
  if (byExactName) {
    return { type: "report", reportId: byExactName.id, page: evidence.page, tab: "evidence" };
  }

  const stem = normalizeDocName(evidence.documentName).slice(0, 12);
  const byPartial = reports.find(
    (r) =>
      normalizeDocName(r.name).includes(stem) ||
      stem.includes(normalizeDocName(r.name).slice(0, 12)),
  );
  if (byPartial) {
    return { type: "report", reportId: byPartial.id, page: evidence.page, tab: "evidence" };
  }

  if (doc) {
    const byBranch = reports.find(
      (r) => doc.branch.includes(r.branchCode) && r.fileType === evidence.fileType,
    );
    if (byBranch) {
      return { type: "report", reportId: byBranch.id, page: evidence.page, tab: "evidence" };
    }
  }

  const linkedReport = reports.find(
    (r) =>
      r.documentPages.some((p) => p.page === evidence.page) &&
      normalizeDocName(r.name).includes("042"),
  );
  if (linkedReport && evidence.page) {
    return { type: "report", reportId: linkedReport.id, page: evidence.page, tab: "evidence" };
  }

  return { type: "evidence", documentId: evidence.documentId, evidenceId: evidence.id };
}
