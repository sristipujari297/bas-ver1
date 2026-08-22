import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  ListChecks,
  Lock,
  Settings,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Overview", Icon: LayoutDashboard },
  { to: "/assistant", label: "AI Assistant", Icon: Bot },
  { to: "/reports", label: "Reports", Icon: FileText },
  { to: "/audit-intelligence", label: "Audit Intelligence", Icon: BarChart3 },
  { to: "/findings", label: "Findings", Icon: ShieldAlert },
  { to: "/remediation", label: "Remediation", Icon: ListChecks },
];

const secondary = [
  { to: "/logs", label: "Audit Logs", Icon: Activity },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const item = (to: string, label: string, Icon: typeof FileText) => {
    const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
    return (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
          active
            ? "bg-primary/20 font-medium text-navy-foreground ring-1 ring-primary/40"
            : "text-navy-muted hover:bg-navy-soft hover:text-navy-foreground",
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary">
          <ShieldCheck className="size-5 text-primary-foreground" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide text-navy-foreground">AUDITAI</p>
          <p className="text-[11px] text-navy-muted">Internal Audit Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3" aria-label="Main navigation">
        {nav.map((n) => item(n.to, n.label, n.Icon))}
        <div className="my-3 h-px bg-white/10" />
        {secondary.map((n) => item(n.to, n.label, n.Icon))}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-3">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md border border-white/10 px-2.5 py-2 text-left text-[11px] text-navy-muted transition-colors hover:bg-navy-soft">
              <span className="size-2 shrink-0 rounded-full bg-low pulse-dot" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium text-navy-foreground">On-Premise AI</span>
                Data processing: Local
              </span>
              <Lock className="size-3.5" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top" className="w-72">
            <p className="text-sm font-semibold text-foreground">Prototype Configuration</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li>• Local AI processing (Ollama runtime)</li>
              <li>• No external document sharing</li>
              <li>• Evidence traceability on every finding</li>
              <li>• Controlled access by audit role</li>
            </ul>
            <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
              Displayed configuration is mock data for demonstration purposes.
            </p>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            MS
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-navy-foreground">M. Shah</p>
            <p className="text-[11px] text-navy-muted">Audit Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-navy/60" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 w-64 shadow-panel">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute -right-11 top-3 text-primary-foreground hover:bg-white/10"
        >
          <X className="size-5" aria-hidden />
        </Button>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  );
}
