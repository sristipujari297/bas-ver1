import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileSearch, FileText, Search, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/audit/SectionHeader";
import { useAppStore } from "@/store/appStore";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [query, setQuery] = useState("Branch 042");
  const navigate = useNavigate();
  const { reports, findings, documents } = useAppStore();

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    const match = (...fields: string[]) => fields.join(" ").toLowerCase().includes(q);
    if (!q) return { reports: [], findings: [], evidence: [] };
    return {
      reports: reports.filter((r) => match(r.name, r.branch, r.branchCode, r.sector)).slice(0, 4),
      findings: findings
        .filter((f) => match(f.title, f.ref, f.branch, f.branchCode, f.sector, f.type))
        .slice(0, 4),
      evidence: documents.filter((d) => match(d.name, d.branch, d.sector)).slice(0, 4),
    };
  }, [q, reports, findings, documents]);

  const total = results.reports.length + results.findings.length + results.evidence.length;

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-sm">Global search</DialogTitle>
        </DialogHeader>
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports, findings, evidence, branches, sectors..."
              className="pl-8"
              aria-label="Search across audit data"
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {total === 0 ? (
            <EmptyState title="No results" description={`Nothing matched "${query}".`} />
          ) : (
            <div className="space-y-3">
              <Group title="Reports" icon={<FileText className="size-3.5" />}>
                {results.reports.map((r) => (
                  <Row
                    key={r.id}
                    onClick={() => go(`/reports/${r.id}`)}
                    title={r.name}
                    meta={`${r.branch} · ${r.sector}`}
                  />
                ))}
              </Group>
              <Group title="Findings" icon={<ShieldAlert className="size-3.5" />}>
                {results.findings.map((f) => (
                  <Row
                    key={f.id}
                    onClick={() => go(`/findings/${f.id}`)}
                    title={`${f.ref} ${f.title}`}
                    meta={`${f.branch} · ${f.risk} · ${f.score}/100`}
                  />
                ))}
              </Group>
              <Group title="Evidence" icon={<FileSearch className="size-3.5" />}>
                {results.evidence.map((d) => {
                  const matchReport = reports.find(
                    (r) => r.name === d.name || r.id === d.id || r.branch === d.branch,
                  );
                  return (
                    <Row
                      key={d.id}
                      onClick={() =>
                        go(matchReport ? `/reports/${matchReport.id}?tab=evidence` : "/reports")
                      }
                      title={d.name}
                      meta={`${d.branch} · ${d.date}`}
                    />
                  );
                })}
              </Group>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Group({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode[];
}) {
  if (!children.filter(Boolean).length) return null;
  return (
    <div>
      <p className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
    >
      <span className="block truncate text-sm text-foreground">{title}</span>
      <span className="block text-xs text-muted-foreground">{meta}</span>
    </button>
  );
}
