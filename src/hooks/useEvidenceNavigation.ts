import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { resolveEvidenceTarget } from "@/lib/evidenceNavigation";
import { useAppStore } from "@/store/appStore";
import type { EvidenceRef } from "@/lib/types";

export function useEvidenceNavigation() {
  const navigate = useNavigate();
  const { reports, documents } = useAppStore();

  const openEvidence = useCallback(
    (evidence: EvidenceRef) => {
      const target = resolveEvidenceTarget(evidence, reports, documents);
      void navigate({
        to: "/reports/$id",
        params: { id: target.reportId },
        search: {
          tab: target.tab,
          page: target.page,
          highlight: target.highlight,
        },
      });
    },
    [navigate, reports, documents],
  );

  return { openEvidence };
}
