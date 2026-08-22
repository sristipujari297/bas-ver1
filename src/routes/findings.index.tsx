import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader, Panel } from "@/components/audit/SectionHeader";
import { FindingsTable } from "@/components/audit/FindingsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { BRANCHES, FINDING_TYPES, SECTORS } from "@/data/mockData";
import type { RiskLevel } from "@/lib/types";

const RISKS: RiskLevel[] = ["Critical", "High", "Medium", "Low"];
const STATUSES = [
  "New",
  "Under Review",
  "Confirmed",
  "Remediation Pending",
  "Resolved",
  "Dismissed",
];

export const Route = createFileRoute("/findings/")({
  head: () => ({
    meta: [
      { title: "Findings Register — AuditAI" },
      {
        name: "description",
        content:
          "Every AI-detected audit finding with risk score, confidence, evidence count and review status across branches and sectors.",
      },
      { property: "og:title", content: "Findings Register — AuditAI" },
      {
        property: "og:description",
        content: "AI-detected audit findings with risk scores, evidence and review status.",
      },
    ],
  }),
  component: FindingsPage,
});

function FindingsPage() {
  const { findings } = useAppStore();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("all");
  const [branch, setBranch] = useState("all");
  const [sector, setSector] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("score");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = findings.filter(
      (f) =>
        (!q ||
          [f.ref, f.title, f.branch, f.branchCode, f.sector, f.type]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (risk === "all" || f.risk === risk) &&
        (branch === "all" || f.branchCode === branch) &&
        (sector === "all" || f.sector === sector) &&
        (type === "all" || f.type === type) &&
        (status === "all" || f.status === status),
    );
    return [...rows].sort((a, b) =>
      sort === "score"
        ? b.score - a.score
        : sort === "confidence"
          ? b.confidence - a.confidence
          : a.ref.localeCompare(b.ref),
    );
  }, [findings, query, risk, branch, sector, type, status, sort]);

  const reset = () => {
    setQuery("");
    setRisk("all");
    setBranch("all");
    setSector("all");
    setType("all");
    setStatus("all");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Findings"
        subtitle="Every AI-detected finding with severity, confidence and evidence trail."
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            Clear filters
          </Button>
        }
      />

      <Panel
        title="Findings Register"
        description={`${filtered.length} of ${findings.length} findings`}
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search findings"
              className="h-9 w-48 pl-8 text-xs"
              aria-label="Search findings"
            />
          </div>
          <FilterSelect
            label="Risk"
            value={risk}
            onChange={setRisk}
            options={RISKS}
            allLabel="All risk levels"
          />
          <FilterSelect
            label="Branch"
            value={branch}
            onChange={setBranch}
            options={BRANCHES.map((b) => b.code)}
            allLabel="All branches"
          />
          <FilterSelect
            label="Sector"
            value={sector}
            onChange={setSector}
            options={SECTORS}
            allLabel="All sectors"
          />
          <FilterSelect
            label="Type"
            value={type}
            onChange={setType}
            options={FINDING_TYPES}
            allLabel="All types"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUSES}
            allLabel="All statuses"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-40 text-xs" aria-label="Sort findings">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Sort: risk score</SelectItem>
              <SelectItem value="confidence">Sort: AI confidence</SelectItem>
              <SelectItem value="ref">Sort: reference</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FindingsTable
          findings={filtered}
          columns={[
            "finding",
            "branch",
            "sector",
            "risk",
            "score",
            "confidence",
            "evidence",
            "detected",
            "status",
            "owner",
          ]}
        />
      </Panel>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  allLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-40 text-xs" aria-label={`${label} filter`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
