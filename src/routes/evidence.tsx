import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, FileType2, Search, Table2 } from "lucide-react";
import { PageHeader, Panel, EmptyState } from "@/components/audit/SectionHeader";
import { EvidenceCard } from "@/components/audit/EvidenceCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { SECTORS } from "@/data/mockData";
import { cn } from "@/lib/utils";

const fileIcon = { PDF: FileText, XLSX: FileSpreadsheet, CSV: Table2, DOCX: FileType2 } as const;

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Library — Indexed Audit Documents" },
      {
        name: "description",
        content:
          "Searchable library of indexed bank documents and the exact page, row and cell references that support each audit finding.",
      },
      { property: "og:title", content: "Evidence Library — AuditAI" },
      {
        property: "og:description",
        content: "Indexed audit documents with page and row-level evidence references.",
      },
    ],
  }),
  component: EvidencePage,
});

function EvidencePage() {
  const { documents, evidence, findings } = useAppStore();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [selected, setSelected] = useState<string | null>(documents[0]?.id ?? null);

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter(
      (d) =>
        (!q || [d.name, d.branch, d.sector].join(" ").toLowerCase().includes(q)) &&
        (sector === "all" || d.sector === sector),
    );
  }, [documents, query, sector]);

  const doc = documents.find((d) => d.id === selected) ?? filteredDocs[0];
  const refs = evidence.filter((e) => doc && e.documentId === doc.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Evidence Library"
        subtitle="Indexed documents and the exact references that support each finding."
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
                placeholder="Search evidence"
                className="h-9 w-48 pl-8 text-xs"
                aria-label="Search evidence"
              />
            </div>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="h-9 w-44 text-xs" aria-label="Sector filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <Panel
          title="Indexed Documents"
          description={`${filteredDocs.length} documents`}
          bodyClassName="space-y-2 p-3"
        >
          {filteredDocs.length === 0 ? (
            <EmptyState title="No documents match your search." />
          ) : (
            filteredDocs.map((d) => {
              const Icon = fileIcon[d.fileType];
              const active = doc?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                    active
                      ? "border-primary/40 bg-accent/60"
                      : "border-border bg-card hover:bg-muted/60",
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-info-soft text-navy">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {d.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {d.branch} · {d.date}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {d.pages} pages · {d.linkedFindingIds.length} linked findings
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </Panel>

        <div className="space-y-4">
          <Panel
            title={doc ? doc.name : "Document"}
            description={
              doc
                ? `${doc.sector} · ${doc.branch} · ${doc.indexed ? "Indexed for retrieval" : "Not indexed"}`
                : ""
            }
            bodyClassName="space-y-3 p-3"
          >
            {!doc ? (
              <EmptyState
                title="Select a document"
                description="Choose a document to inspect its evidence references."
              />
            ) : refs.length === 0 ? (
              <EmptyState
                title="No evidence references"
                description="No finding cites this document yet."
              />
            ) : (
              refs.map((e) => (
                <div key={e.id} className="space-y-2">
                  <EvidenceCard evidence={e} />
                  <div className="flex flex-wrap items-center gap-1.5 pl-1">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Cited by
                    </span>
                    {e.findingIds.map((fid) => {
                      const f = findings.find((x) => x.id === fid);
                      if (!f) return null;
                      return (
                        <Link key={fid} to="/findings/$id" params={{ id: fid }}>
                          <Badge
                            variant="outline"
                            className="text-[11px] font-normal hover:bg-accent"
                          >
                            {f.ref} {f.title}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
