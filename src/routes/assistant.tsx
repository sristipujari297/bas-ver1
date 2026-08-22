import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, ExternalLink, FileText, SendHorizonal, Sparkles, User } from "lucide-react";
import { PageHeader, Panel, EmptyState, LoadingState } from "@/components/audit/SectionHeader";
import { RiskBadge } from "@/components/audit/RiskBadge";
import { ConfidenceIndicator } from "@/components/audit/ConfidenceIndicator";
import { EvidenceCard } from "@/components/audit/EvidenceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAudit, suggestedQuestions } from "@/services/aiService";
import { useEvidenceNavigation } from "@/hooks/useEvidenceNavigation";
import { useAppStore } from "@/store/appStore";
import type { AIResponse, RiskLevel } from "@/lib/types";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Audit Assistant — Evidence-Backed Answers" },
      {
        name: "description",
        content:
          "Ask audit questions in natural language and get answers backed by citations to the exact source documents, pages and rows.",
      },
      { property: "og:title", content: "AI Audit Assistant — AuditAI" },
      {
        property: "og:description",
        content: "Natural-language audit questions answered with document-level citations.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { chat, appendChat, evidence } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const last = [...chat].reverse().find((m) => m.role === "assistant")?.response;
  const panelEvidence = evidence.filter((e) => last?.evidenceIds?.includes(e.id));

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    appendChat({ id: `u-${Date.now()}`, role: "user", text: question, createdAt: "now" });
    setInput("");
    setLoading(true);
    const response = await askAudit(question);
    appendChat({ id: `a-${Date.now()}`, role: "assistant", response, createdAt: "now" });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Audit Assistant"
        subtitle="Every answer is grounded in indexed evidence, with source citations."
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Conversation"
          description="On-premise model · no data leaves the bank"
          bodyClassName="flex flex-col gap-3 p-3"
        >
          <div className="min-h-[26rem] space-y-3">
            {chat.length === 0 && !loading && (
              <EmptyState
                title="Ask an audit question"
                description="Try one of the suggested questions below to see an evidence-backed answer."
                icon={<Bot className="size-6" aria-hidden />}
              />
            )}
            {chat.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end gap-2">
                  <p className="max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {m.text}
                  </p>
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    <User className="size-3.5" aria-hidden />
                  </span>
                </div>
              ) : (
                <div key={m.id} className="flex gap-2">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Bot className="size-3.5" aria-hidden />
                  </span>
                  {m.response && <AnswerCard response={m.response} />}
                </div>
              ),
            )}
            {loading && <LoadingState label="Retrieving evidence and analysing..." />}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
            {suggestedQuestions.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => void send(q)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a branch, finding, sector or remediation..."
              aria-label="Ask the audit assistant"
              className="h-10 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="size-10 shrink-0"
              disabled={loading}
              aria-label="Send question"
            >
              <SendHorizonal className="size-4" aria-hidden />
            </Button>
          </form>
        </Panel>

        <Panel
          title="Evidence Panel"
          description="Sources cited in the latest answer"
          bodyClassName="space-y-2 p-3"
        >
          {panelEvidence.length === 0 ? (
            <EmptyState
              title="No citations yet"
              description="Ask a question to populate the evidence panel."
            />
          ) : (
            panelEvidence.map((e) => <EvidenceCard key={e.id} evidence={e} compact />)
          )}
        </Panel>
      </div>
    </div>
  );
}

function AnswerCard({ response }: { response: AIResponse }) {
  const { findings, evidence } = useAppStore();
  const { openEvidence } = useEvidenceNavigation();

  return (
    <div className="max-w-[85%] space-y-2.5 rounded-lg rounded-bl-sm border border-border bg-card p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
        <Sparkles className="size-3.5" aria-hidden />
        {response.answer}
      </p>
      <p className="text-sm leading-relaxed text-foreground">{response.summary}</p>
      <ul className="space-y-1">
        {response.keyFindings.map((k) => (
          <li
            key={k}
            className="rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-xs text-foreground"
          >
            {k}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-2.5">
        {response.riskLabel && <RiskBadge risk={response.riskLabel as RiskLevel} />}
        {typeof response.riskScore === "number" && (
          <span className="num text-xs text-muted-foreground">Score {response.riskScore}/100</span>
        )}
        {typeof response.confidence === "number" && (
          <ConfidenceIndicator value={response.confidence} compact />
        )}
      </div>

      {response.evidenceIds && response.evidenceIds.length > 0 && (
        <div className="border-t border-border pt-2.5">
          <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <FileText className="size-3 text-primary" aria-hidden />
            Cited Evidence Sources ({response.evidenceIds.length})
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {response.evidenceIds.map((id) => {
              const e = evidence.find((x) => x.id === id);
              if (!e) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => openEvidence(e)}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-accent/60 px-2 py-1 text-left text-xs font-medium text-accent-foreground transition-colors hover:border-primary hover:bg-accent"
                  title={`Open source: ${e.documentName} · ${e.locator}`}
                >
                  <span className="max-w-[150px] truncate">{e.documentName}</span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                    ({e.locator.split("·")[0]?.trim() || e.locator})
                  </span>
                  <ExternalLink
                    className="size-3 text-muted-foreground group-hover:text-foreground"
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {response.recommendations && response.recommendations.length > 0 && (
        <div className="border-t border-border pt-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Recommended next steps
          </p>
          <ul className="mt-1 space-y-1 text-xs text-foreground">
            {response.recommendations.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
      {response.findingIds && response.findingIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2.5">
          {response.findingIds.map((id) => {
            const f = findings.find((x) => x.id === id);
            if (!f) return null;
            return (
              <Link
                key={id}
                to="/findings/$id"
                params={{ id }}
                className="rounded-md border border-primary/30 bg-accent/60 px-2 py-0.5 text-[11px] font-medium text-accent-foreground hover:underline"
              >
                {f.ref} {f.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
