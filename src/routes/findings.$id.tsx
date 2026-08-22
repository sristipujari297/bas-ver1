import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ClipboardList, Sparkles, UserPlus, XCircle } from "lucide-react";
import { PageHeader, Panel, EmptyState, MetaItem } from "@/components/audit/SectionHeader";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { StatusBadge } from "@/components/audit/StatusBadge";
import { ConfidenceIndicator } from "@/components/audit/ConfidenceIndicator";
import { RootCauseChain } from "@/components/audit/RootCauseChain";
import { EvidenceCard } from "@/components/audit/EvidenceCard";
import { HumanInLoopTrack } from "@/components/audit/AuditPipeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

export const Route = createFileRoute("/findings/$id")({
  head: () => ({
    meta: [
      { title: "Finding Detail — AuditAI" },
      {
        name: "description",
        content:
          "Why a finding was flagged, its root-cause chain, linked source evidence, recommended remediation and the auditor review trail.",
      },
      { property: "og:title", content: "Finding Detail — AuditAI" },
      {
        property: "og:description",
        content: "Root cause, evidence trail and remediation for a single audit finding.",
      },
    ],
  }),
  component: FindingDetail,
});

function FindingDetail() {
  const { id } = useParams({ from: "/findings/$id" });
  const { findings, evidence, remediation, updateFindingStatus, assignFindingOwner } =
    useAppStore();
  const finding = findings.find((f) => f.id === id);
  const [note, setNote] = useState("");

  if (!finding) {
    return (
      <Panel>
        <EmptyState
          title="Finding not found"
          description="This finding is not part of the current dataset."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/findings">Back to findings</Link>
            </Button>
          }
        />
      </Panel>
    );
  }

  const linkedEvidence = evidence.filter((e) => finding.evidenceIds.includes(e.id));
  const actions = remediation.filter((a) => a.findingId === finding.id);

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
        <Link to="/findings">
          <ArrowLeft className="size-4" aria-hidden />
          All findings
        </Link>
      </Button>

      <PageHeader
        title={`${finding.ref} ${finding.title}`}
        subtitle={`${finding.type} · ${finding.branch} · ${finding.branchCode} · ${finding.sector}`}
        actions={
          <>
            <RiskBadge risk={finding.risk} className="px-2.5 py-1 text-xs" />
            <StatusBadge status={finding.status} className="px-2.5 py-1 text-xs" />
          </>
        }
      />

      <Panel bodyClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetaItem
          label="Risk score"
          value={<span className="num font-semibold">{finding.score}/100</span>}
        />
        <MetaItem
          label="AI confidence"
          value={<ConfidenceIndicator value={finding.confidence} />}
        />
        <MetaItem label="Detected" value={finding.detected} />
        <MetaItem label="Owner" value={finding.owner} />
      </Panel>

      <Panel
        title="Human-in-the-Loop Status"
        description="AI findings are advisory until an auditor confirms them"
      >
        <HumanInLoopTrack stage={finding.reviewStage} />
      </Panel>

      <Tabs defaultValue="why">
        <TabsList className="flex-wrap">
          <TabsTrigger value="why">Why Flagged</TabsTrigger>
          <TabsTrigger value="root">Root Cause</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="remediation">Remediation</TabsTrigger>
          <TabsTrigger value="review">Auditor Review</TabsTrigger>
        </TabsList>

        <TabsContent value="why" className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Why This Was Flagged">
            <div className="rounded-lg border border-primary/25 bg-accent/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                AI explanation
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground">
                {finding.whyFlagged}
              </p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Every statement above is traceable to a source document in the Evidence tab.
            </p>
          </Panel>
          <Panel
            title="Linked Evidence"
            description={`${linkedEvidence.length} source references`}
            bodyClassName="space-y-2 p-3"
          >
            {linkedEvidence.slice(0, 2).map((e) => (
              <EvidenceCard key={e.id} evidence={e} compact />
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="root" className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel title="Root-Cause Analysis" bodyClassName="space-y-4">
            <MetaItem label="Observed pattern" value={finding.rootCause.observedPattern} />
            <MetaItem label="Potential cause" value={finding.rootCause.potentialCause} />
            <MetaItem
              label="Affected controls"
              value={
                <ul className="mt-1 space-y-1">
                  {finding.rootCause.affectedControls.map((c) => (
                    <li
                      key={c}
                      className="rounded-md border border-border bg-muted px-2 py-1 text-xs"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              }
            />
            <MetaItem label="Risk implication" value={finding.rootCause.riskImplication} />
          </Panel>
          <Panel title="Cause Chain" description="How the anomaly propagated">
            <RootCauseChain steps={finding.causeChain} />
          </Panel>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <Panel
            title="Evidence Trail"
            description="Source documents supporting this finding"
            bodyClassName="grid gap-3 lg:grid-cols-2"
          >
            {linkedEvidence.length === 0 ? (
              <EmptyState
                title="No evidence linked"
                description="This finding was raised without a source reference."
              />
            ) : (
              linkedEvidence.map((e) => <EvidenceCard key={e.id} evidence={e} />)
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="remediation" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Recommended Actions" bodyClassName="space-y-2">
            {finding.recommendations.map((r) => (
              <div
                key={r}
                className="flex items-start gap-2 rounded-md border border-border bg-card p-2.5 text-sm"
              >
                <ClipboardList className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{r}</span>
              </div>
            ))}
          </Panel>
          <Panel
            title="Tracked Remediation"
            description={`${actions.length} actions in the tracker`}
            bodyClassName="space-y-2"
          >
            {actions.length === 0 ? (
              <EmptyState
                title="No remediation actions yet"
                description="Confirm the finding to generate actions."
              />
            ) : (
              actions.map((a) => (
                <div key={a.id} className="rounded-md border border-border bg-card p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground">{a.action}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.owner} · due {a.dueDate} · {a.priority}
                  </p>
                </div>
              ))
            )}
            {actions.length > 0 &&
              finding.reviewStage !== "Remediation Approved" &&
              finding.status !== "Dismissed" && (
                <Button
                  size="sm"
                  variant="default"
                  className="w-full gap-1.5"
                  onClick={() => {
                    updateFindingStatus(finding.id, "Remediation Pending", "Remediation Approved");
                    toast.success(`Remediation for ${finding.ref} approved and action activated.`);
                  }}
                >
                  <CheckCircle2 className="size-4" aria-hidden />
                  Approve remediation plan
                </Button>
              )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/remediation">Open remediation tracker</Link>
            </Button>
          </Panel>
        </TabsContent>

        <TabsContent value="review" className="mt-4">
          <Panel title="Auditor Review" description="Confirm, dismiss or assign this finding">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a review note for the audit trail..."
              className="min-h-24 text-sm"
              aria-label="Review note"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                className="gap-1.5"
                onClick={() => {
                  updateFindingStatus(finding.id, "Confirmed", "Auditor Confirmed");
                  toast.success(`${finding.ref} confirmed and logged to the audit trail.`);
                }}
              >
                <CheckCircle2 className="size-4" aria-hidden />
                Confirm finding
              </Button>
              <Button
                className="gap-1.5"
                variant="secondary"
                onClick={() => {
                  updateFindingStatus(finding.id, "Remediation Pending", "Remediation Approved");
                  toast.success(`Remediation for ${finding.ref} approved and action activated.`);
                }}
              >
                <ClipboardList className="size-4" aria-hidden />
                Approve remediation
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  updateFindingStatus(finding.id, "Dismissed", "Pending Auditor Review");
                  toast.info(`${finding.ref} dismissed as a false positive.`);
                }}
              >
                <XCircle className="size-4" aria-hidden />
                Mark false positive
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  assignFindingOwner(finding.id, "R. Iyer (Senior Auditor)");
                  updateFindingStatus(finding.id, "Under Review", "Pending Auditor Review");
                  toast.success("Assigned to R. Iyer (Senior Auditor).");
                }}
              >
                <UserPlus className="size-4" aria-hidden />
                Assign auditor
              </Button>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
