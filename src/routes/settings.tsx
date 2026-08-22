import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, MetaItem } from "@/components/audit/SectionHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AuditAI Platform Configuration" },
      {
        name: "description",
        content:
          "Platform configuration for the audit workspace: deployment mode, notification preferences and demo data controls.",
      },
      { property: "og:title", content: "Settings — AuditAI" },
      {
        property: "og:description",
        content: "Deployment mode, notifications and demo data controls.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { resetDemo } = useAppStore();

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Workspace configuration and demo controls." />

      <Panel title="Deployment" bodyClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetaItem label="Model hosting" value="On-premise (air-gapped)" />
        <MetaItem label="Retrieval index" value="pgvector · 4 collections" />
        <MetaItem label="Orchestration" value="Workflow agents · 5 stages" />
        <MetaItem label="Data residency" value="Bank data centre — Mumbai" />
      </Panel>

      <Panel title="Notifications" bodyClassName="space-y-4">
        {[
          {
            id: "critical",
            label: "Critical finding alerts",
            desc: "Notify immediately when a critical risk is detected.",
          },
          {
            id: "weekly",
            label: "Weekly audit digest",
            desc: "Summary of new findings and remediation progress.",
          },
          {
            id: "overdue",
            label: "Overdue remediation reminders",
            desc: "Alert owners when actions pass their due date.",
          },
        ].map((n, i) => (
          <div key={n.id} className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor={n.id} className="text-sm font-medium text-foreground">
                {n.label}
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.desc}</p>
            </div>
            <Switch id={n.id} defaultChecked={i < 2} />
          </div>
        ))}
      </Panel>

      <Panel
        title="Demo Data"
        description="Reset findings, reports and remediation to their seeded state"
      >
        <Button
          variant="outline"
          onClick={() => {
            resetDemo();
            toast.success("Demo data restored.");
          }}
        >
          Reset demo data
        </Button>
      </Panel>
    </div>
  );
}
