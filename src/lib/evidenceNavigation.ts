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
  highlight?: string | undefined;
}

export interface LibraryEvidenceTarget {
  type: "evidence";
  documentId: string;
  evidenceId: string;
}

export type EvidenceViewerTarget = ReportEvidenceTarget | LibraryEvidenceTarget;

/** Resolve the best viewer target for an evidence reference across reports and document library. */
export function resolveEvidenceTarget(
  evidence: EvidenceRef,
  reports: BankReport[],
  documents: EvidenceDocument[],
): EvidenceViewerTarget {
  // 1. Direct report ID match
  const byId = reports.find((r) => r.id === evidence.documentId);
  if (byId) {
    return {
      type: "report",
      reportId: byId.id,
      page: evidence.page ?? byId.documentPages[0]?.page ?? 1,
      tab: "evidence",
      highlight: evidence.id,
    };
  }

  // 2. Finding linkage match
  if (evidence.findingIds && evidence.findingIds.length > 0) {
    const byFinding = reports.find((r) =>
      r.findingIds.some((fid) => evidence.findingIds.includes(fid)),
    );
    if (byFinding) {
      return {
        type: "report",
        reportId: byFinding.id,
        page: evidence.page ?? byFinding.documentPages[0]?.page ?? 1,
        tab: "evidence",
        highlight: evidence.id,
      };
    }
  }

  // 3. Exact normalized name match
  const byExactName = reports.find(
    (r) => normalizeDocName(r.name) === normalizeDocName(evidence.documentName),
  );
  if (byExactName) {
    return {
      type: "report",
      reportId: byExactName.id,
      page: evidence.page ?? byExactName.documentPages[0]?.page ?? 1,
      tab: "evidence",
      highlight: evidence.id,
    };
  }

  // 4. Partial name match
  const stem = normalizeDocName(evidence.documentName).slice(0, 12);
  const byPartial = reports.find(
    (r) =>
      normalizeDocName(r.name).includes(stem) ||
      stem.includes(normalizeDocName(r.name).slice(0, 12)),
  );
  if (byPartial) {
    return {
      type: "report",
      reportId: byPartial.id,
      page: evidence.page ?? byPartial.documentPages[0]?.page ?? 1,
      tab: "evidence",
      highlight: evidence.id,
    };
  }

  // 5. Document metadata match
  const doc = documents.find((d) => d.id === evidence.documentId);
  if (doc) {
    const byBranch = reports.find(
      (r) => doc.branch.includes(r.branchCode) && r.fileType === evidence.fileType,
    );
    if (byBranch) {
      return {
        type: "report",
        reportId: byBranch.id,
        page: evidence.page ?? byBranch.documentPages[0]?.page ?? 1,
        tab: "evidence",
        highlight: evidence.id,
      };
    }
  }

  // 6. Fallback to Evidence Repository document view
  const docId = doc?.id ?? evidence.documentId;
  return {
    type: "evidence",
    documentId: docId,
    evidenceId: evidence.id,
  };
}
