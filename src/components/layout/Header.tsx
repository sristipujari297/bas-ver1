import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Menu, RotateCcw, Search, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const titles: Record<string, string> = {
  "/": "Executive Overview",
  "/reports": "Bank Reports",
  "/audit-intelligence": "Audit Intelligence",
  "/findings": "Audit Findings",
  "/remediation": "Remediation Center",
  "/assistant": "Audit Intelligence Assistant",
  "/logs": "Audit Logs",
  "/settings": "Settings",
};

function useCrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const base = "/" + (pathname.split("/")[1] ?? "");
  const title = titles[pathname] ?? titles[base] ?? "AuditAI";
  const isDetail = pathname.split("/").filter(Boolean).length > 1;
  return { title, base, baseTitle: titles[base] ?? "AuditAI", isDetail, pathname };
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const { title, base, baseTitle, isDetail } = useCrumbs();
  const [searchOpen, setSearchOpen] = useState(false);
  const { notifications, markNotificationsRead, resetDemo } = useAppStore();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div className="min-w-0 flex-1">
        <nav
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-foreground">
            AuditAI
          </Link>
          <span aria-hidden>/</span>
          {isDetail ? (
            <>
              <Link to={base} className="hover:text-foreground">
                {baseTitle}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground">Detail</span>
            </>
          ) : (
            <span className="text-foreground">{baseTitle}</span>
          )}
        </nav>
        <h1 className="truncate text-sm font-semibold text-foreground">
          {isDetail ? baseTitle : title}
        </h1>
      </div>

      <span className="hidden items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground sm:inline-flex">
        Demo Mode
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="size-4.5" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search reports, findings, evidence</TooltipContent>
      </Tooltip>

      <Popover onOpenChange={(o) => o && markNotificationsRead()}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Notifications (${unread} unread)`}
          >
            <Bell className="size-4.5" aria-hidden />
            {unread > 0 && (
              <span className="num absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-critical text-[10px] font-semibold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <p className="border-b border-border px-3 py-2 text-sm font-semibold">Notifications</p>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => navigate({ to: n.href })}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.severity === "Critical"
                        ? "bg-critical"
                        : n.severity === "High"
                          ? "bg-high"
                          : "bg-primary",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">{n.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {n.context} · {n.time}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      <span className="hidden items-center gap-1.5 rounded-md border border-primary/25 bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground md:inline-flex">
        <span className="size-2 rounded-full bg-low pulse-dot" aria-hidden />
        AI System Online
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted">
          <span className="grid size-8 place-items-center rounded-full bg-navy text-xs font-semibold text-navy-foreground">
            MS
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-medium text-foreground">M. Shah</span>
            <span className="block text-[11px] text-muted-foreground">Audit Analyst</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Signed in as Audit Analyst (demo)
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <UserCog className="size-4" aria-hidden /> Profile &amp; roles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              resetDemo();
              toast.success("Demo data reset to its original state.");
            }}
          >
            <RotateCcw className="size-4" aria-hidden /> Reset demo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>
            <LogOut className="size-4" aria-hidden /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
