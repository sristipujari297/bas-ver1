import { Link } from "@tanstack/react-router";
import { ChevronRight, Paperclip } from "lucide-react";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { StatusBadge } from "@/components/audit/StatusBadge";
import { ConfidenceIndicator } from "@/components/audit/ConfidenceIndicator";
import { EmptyState } from "@/components/audit/SectionHeader";
import type { Finding } from "@/lib/types";

type Column =
  | "finding"
  | "branch"
  | "sector"
  | "risk"
  | "score"
  | "confidence"
  | "evidence"
  | "detected"
  | "status"
  | "owner";

export function FindingsTable({
  findings,
  columns = ["finding", "branch", "sector", "risk", "score", "detected", "status"],
}: {
  findings: Finding[];
  columns?: Column[];
}) {
  if (findings.length === 0) {
    return (
      <EmptyState
        title="No findings match your filters."
        description="Adjust the risk level, branch or status filters to see results."
      />
    );
  }

  const has = (c: Column) => columns.includes(c);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            {has("finding") && <th className="px-3 py-2 font-medium">Finding</th>}
            {has("branch") && <th className="px-3 py-2 font-medium">Branch</th>}
            {has("sector") && <th className="px-3 py-2 font-medium">Sector</th>}
            {has("risk") && <th className="px-3 py-2 font-medium">Risk</th>}
            {has("score") && <th className="px-3 py-2 font-medium">Score</th>}
            {has("confidence") && <th className="px-3 py-2 font-medium">AI Confidence</th>}
            {has("evidence") && <th className="px-3 py-2 font-medium">Evidence</th>}
            {has("detected") && <th className="px-3 py-2 font-medium">Detected</th>}
            {has("status") && <th className="px-3 py-2 font-medium">Status</th>}
            {has("owner") && <th className="px-3 py-2 font-medium">Owner</th>}
            <th className="px-3 py-2 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {findings.map((f) => (
            <tr key={f.id} className="transition-colors hover:bg-muted/60">
              {has("finding") && (
                <td className="px-3 py-2.5">
                  <Link to="/findings/$id" params={{ id: f.id }} className="block">
                    <span className="block font-medium text-foreground hover:text-primary">
                      {f.ref} {f.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">{f.type}</span>
                  </Link>
                </td>
              )}
              {has("branch") && (
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                  {f.branch} · {f.branchCode}
                </td>
              )}
              {has("sector") && (
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{f.sector}</td>
              )}
              {has("risk") && (
                <td className="px-3 py-2.5">
                  <RiskBadge risk={f.risk} />
                </td>
              )}
              {has("score") && <td className="num px-3 py-2.5 font-medium">{f.score}</td>}
              {has("confidence") && (
                <td className="px-3 py-2.5">
                  <ConfidenceIndicator value={f.confidence} compact />
                </td>
              )}
              {has("evidence") && (
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="size-3.5" aria-hidden />
                    {f.evidenceIds.length}
                  </span>
                </td>
              )}
              {has("detected") && (
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                  {f.detected}
                </td>
              )}
              {has("status") && (
                <td className="px-3 py-2.5">
                  <StatusBadge status={f.status} />
                </td>
              )}
              {has("owner") && (
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{f.owner}</td>
              )}
              <td className="px-3 py-2.5 text-right">
                <Link
                  to="/findings/$id"
                  params={{ id: f.id }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
