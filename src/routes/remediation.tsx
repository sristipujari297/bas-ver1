import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState } from "@/components/audit/SectionHeader";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { StatusBadge } from "@/components/audit/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import type { RemediationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUSES: RemediationStatus[] = [
  "Not Started",
  "In Progress",
  "Pending Verification",
  "Completed",
  "Overdue",
  "Dismissed",
];

export const Route = createFileRoute("/remediation")({
  head: () => ({
    meta: [
      { title: "Remediation Tracker — Evidence-Linked Actions" },
      {
        name: "description",
        content:
          "Track evidence-linked remediation actions with owners, due dates, priority and verification status for every confirmed audit finding.",
      },
      { property: "og:title", content: "Remediation Tracker — AuditAI" },
      {
        property: "og:description",
        content: "Owners, due dates and verification status for every remediation action.",
      },
    ],
  }),
  component: RemediationPage,
});

function RemediationPage() {
  const { remediation, updateRemediationStatus } = useAppStore();
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [view, setView] = useState<"table" | "board">("table");

  const filtered = useMemo(
    () =>
      remediation.filter(
        (a) =>
          (status === "all" || a.status === status) &&
          (priority === "all" || a.priority === priority),
      ),
    [remediation, status, priority],
  );

  const counts = STATUSES.map((s) => ({
    status: s,
    items: remediation.filter((a) => a.status === s),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Remediation"
        subtitle="Evidence-linked corrective actions with owners and due dates."
        actions={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-44 text-xs" aria-label="Status filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-9 w-36 text-xs" aria-label="Priority filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {["P1", "P2", "P3"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === "table" ? "board" : "table")}
            >
              {view === "table" ? "Board view" : "Table view"}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {counts.map((c) => (
          <article key={c.status} className="panel p-3">
            <p className="text-xs text-muted-foreground">{c.status}</p>
            <p className="num mt-1 text-2xl font-semibold text-foreground">{c.items.length}</p>
          </article>
        ))}
      </div>

      {view === "table" ? (
        <Panel
          title="Action Tracker"
          description={`${filtered.length} actions`}
          bodyClassName="p-0"
        >
          {filtered.length === 0 ? (
            <EmptyState title="No remediation actions match your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    {["Action", "Finding", "Risk", "Owner", "Due Date", "Priority", "Status"].map(
                      (h) => (
                        <th key={h} className="px-3 py-2 font-medium">
                          {h}
                        </th>
                      ),
                    )}
                    <th className="px-3 py-2 text-right font-medium">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/60">
                      <td className="px-3 py-2.5 text-foreground">{a.action}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Link
                          to="/findings/$id"
                          params={{ id: a.findingId }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {a.findingRef}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <RiskBadge risk={a.risk} />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                        {a.owner}
                      </td>
                      <td
                        className={cn(
                          "num px-3 py-2.5 whitespace-nowrap",
                          a.status === "Overdue" ? "text-critical" : "text-muted-foreground",
                        )}
                      >
                        {a.dueDate}
                      </td>
                      <td className="num px-3 py-2.5 font-medium">{a.priority}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Select
                          value={a.status}
                          onValueChange={(v) => {
                            updateRemediationStatus(a.id, v as RemediationStatus);
                            toast.success(`Action updated to "${v}".`);
                          }}
                        >
                          <SelectTrigger
                            className="h-8 w-40 text-xs"
                            aria-label={`Update status for ${a.action}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {counts.map((col) => (
            <Panel
              key={col.status}
              title={col.status}
              description={`${col.items.length} actions`}
              bodyClassName="space-y-2 p-2.5"
            >
              {col.items.length === 0 ? (
                <p className="px-1 py-4 text-center text-xs text-muted-foreground">Nothing here</p>
              ) : (
                col.items.map((a) => (
                  <article key={a.id} className="rounded-md border border-border bg-card p-2.5">
                    <p className="text-xs font-medium text-foreground">{a.action}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <RiskBadge risk={a.risk} />
                      <span className="num text-[11px] text-muted-foreground">{a.priority}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {a.owner} · {a.dueDate}
                    </p>
                  </article>
                ))
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
