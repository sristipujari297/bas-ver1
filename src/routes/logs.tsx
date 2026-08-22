import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/audit/SectionHeader";
import { StatusBadge } from "@/components/audit/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Workflow & Agent Trail" },
      {
        name: "description",
        content:
          "Immutable trail of ingestion, retrieval, analysis and review activity across every AI agent and audit workflow run.",
      },
      { property: "og:title", content: "Audit Logs — AuditAI" },
      {
        property: "og:description",
        content: "Workflow and agent activity trail for every audit run.",
      },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { logs } = useAppStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter(
      (l) =>
        (!q ||
          [l.workflow, l.agent, l.action, l.report, l.details]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (status === "all" || l.status === status),
    );
  }, [logs, query, status]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Logs"
        subtitle="Traceable record of every agent action across the audit workflow."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search logs"
                className="h-9 w-48 pl-8 text-xs"
                aria-label="Search logs"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-40 text-xs" aria-label="Status filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["all", "Success", "Warning", "Failed"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Panel
        title="Workflow Activity"
        description={`${filtered.length} of ${logs.length} entries`}
        bodyClassName="p-0"
      >
        {filtered.length === 0 ? (
          <EmptyState title="No log entries match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  {[
                    "Timestamp",
                    "Workflow",
                    "Agent",
                    "Action",
                    "Report",
                    "Duration",
                    "Status",
                    "Details",
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/60">
                    <td className="num px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {l.timestamp}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-foreground">{l.workflow}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {l.agent}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">{l.action}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {l.report}
                    </td>
                    <td className="num px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {l.duration}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
