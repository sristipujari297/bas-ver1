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

export type EvidenceViewerTarget = ReportEvidenceTarget;

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

  // 2. Exact normalized document name match
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

  // 3. Partial name stem match
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

  // 4. Document library metadata match
  const doc = documents.find((d) => d.id === evidence.documentId);
  if (doc) {
    // 4a. Check if report matches document library name
    const byDocName = reports.find((r) => normalizeDocName(r.name) === normalizeDocName(doc.name));
    if (byDocName) {
      return {
        type: "report",
        reportId: byDocName.id,
        page: evidence.page ?? byDocName.documentPages[0]?.page ?? 1,
        tab: "evidence",
        highlight: evidence.id,
      };
    }

    // 4b. Check if report matches branch code and file type
    const byBranch = reports.find(
      (r) => doc.branch.includes(r.branchCode) && r.fileType === evidence.fileType,
    );
    if (byBranch) {
      // If evidence page is not directly specified, find page in report or default to relevant sheet page
      const targetPage =
        evidence.page ??
        byBranch.documentPages.find((p) => p.highlight)?.page ??
        byBranch.documentPages[0]?.page ??
        1;
      return {
        type: "report",
        reportId: byBranch.id,
        page: targetPage,
        tab: "evidence",
        highlight: evidence.id,
      };
    }
  }

  // 5. Finding linkage match with matching file type
  if (evidence.findingIds && evidence.findingIds.length > 0) {
    const byFindingAndType = reports.find(
      (r) =>
        r.fileType === evidence.fileType &&
        r.findingIds.some((fid) => evidence.findingIds.includes(fid)),
    );
    if (byFindingAndType) {
      return {
        type: "report",
        reportId: byFindingAndType.id,
        page: evidence.page ?? byFindingAndType.documentPages[0]?.page ?? 1,
        tab: "evidence",
        highlight: evidence.id,
      };
    }

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

  // 6. Fallback to first available report
  const fallbackReport = reports[0];
  return {
    type: "report",
    reportId: fallbackReport?.id ?? "r-001",
    page: evidence.page ?? 1,
    tab: "evidence",
    highlight: evidence.id,
  };
}
