import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck, FileSearch, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — AuditAI Internal Audit Intelligence" },
      {
        name: "description",
        content:
          "Sign in to AuditAI to review evidence-backed audit findings, root causes and remediation for your bank's weekly reports.",
      },
      { property: "og:title", content: "Sign in — AuditAI" },
      {
        property: "og:description",
        content: "Enterprise internal audit intelligence for banks. Demo mode available.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-navy px-6 py-10 sm:px-12">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-primary">
            <ShieldCheck className="size-5 text-primary-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide text-navy-foreground">AUDITAI</p>
            <p className="text-[11px] text-navy-muted">Internal Audit Intelligence</p>
          </div>
        </div>

        <div className="max-w-lg py-12">
          <h1 className="text-3xl font-semibold leading-tight text-navy-foreground sm:text-4xl">
            AI-Powered Internal Audit Intelligence
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-navy-muted sm:text-base">
            Turn fragmented bank reports into evidence-backed risk intelligence.
          </p>
          <dl className="mt-10 space-y-4">
            {[
              {
                Icon: Workflow,
                t: "Continuous audit pipeline",
                d: "Ingestion → retrieval → analysis → root cause → remediation.",
              },
              {
                Icon: FileSearch,
                t: "Evidence traceability",
                d: "Every finding links back to a document, page, sheet or row.",
              },
              {
                Icon: Lock,
                t: "On-premise processing",
                d: "Local LLM runtime, no external document sharing.",
              },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-white/10 text-primary-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <dt className="text-sm font-medium text-navy-foreground">{t}</dt>
                  <dd className="text-xs text-navy-muted">{d}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-[11px] text-navy-muted">
          Prototype configuration · demonstration data only · not connected to live bank systems.
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="panel w-full max-w-sm p-6">
          <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Use your bank audit department credentials.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/" });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="analyst@bank.co.in"
                defaultValue="m.shah@bank.co.in"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                defaultValue="demo-password"
              />
            </div>
            <Button type="submit" className="w-full gap-1.5">
              Sign In
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/" })}>
            Demo Mode — enter as Audit Analyst
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Authentication is mocked for this prototype.
          </p>
        </div>
      </section>
    </div>
  );
}
