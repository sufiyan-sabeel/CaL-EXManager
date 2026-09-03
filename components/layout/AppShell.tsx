"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";
import { NotificationCenter } from "@/components/ui/notification-center";
import { Icon } from "@/components/ui/icons";

type NavIcon = "dashboard" | "performance" | "apps" | "alarm" | "notes" | "calendar" | "expenses" | "notifications" | "automations" | "ai" | "insights" | "privacy" | "settings";

const PRIMARY_NAV: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/performance", label: "Performance", icon: "performance" },
  { href: "/apps", label: "Apps", icon: "apps" },
  { href: "/alarms", label: "Alarms", icon: "alarm" },
  { href: "/notes", label: "Notes", icon: "notes" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/expenses", label: "CAL-EXPENSES", icon: "expenses" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/automations", label: "Automations", icon: "automations" },
  { href: "/ai", label: "AI", icon: "ai" },
  { href: "/insights", label: "Insights", icon: "insights" },
];

const SECONDARY_NAV: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/privacy", label: "Privacy", icon: "privacy" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

const MORE_SHEET_ITEMS: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/performance", label: "Performance", icon: "performance" },
  { href: "/apps", label: "Apps", icon: "apps" },
  { href: "/alarms", label: "Alarms", icon: "alarm" },
  { href: "/notes", label: "Notes", icon: "notes" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/notifications", label: "Notifications", icon: "notifications" },
  { href: "/automations", label: "Automations", icon: "automations" },
  { href: "/insights", label: "Insights", icon: "insights" },
  { href: "/privacy", label: "Privacy", icon: "privacy" },
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/profile", label: "Profile", icon: "settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isAuthPage = pathname?.startsWith("/auth") || pathname?.startsWith("/onboarding");
  if (isAuthPage) return <>{children}</>;
  if (!user) return <>{children}</>;

  // Cmd+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "G" && !searchOpen) {
        // two-key jump handled elsewhere simplified
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    setSearchOpen(false);
    if (q.includes("expense") || q.includes("cal-")) router.push("/expenses");
    else if (q.includes("calendar")) router.push("/calendar");
    else if (q.includes("note")) router.push("/notes");
    else if (q.includes("alarm")) router.push("/alarms");
    else if (q.includes("auto")) router.push("/automations");
    else if (q.includes("ai")) router.push("/ai");
    else if (q.includes("insight") || q.includes("analytic")) router.push("/insights");
    else if (q.includes("perform") || q.includes("battery") || q.includes("storage")) router.push("/performance");
    else if (q.includes("app")) router.push("/apps");
    else if (q.includes("notif")) router.push("/notifications");
    else if (q.includes("privacy")) router.push("/privacy");
    else router.push("/ai");
    setQuery("");
  };

  return (
    <div className="min-h-screen flex bg-[var(--surface-base)]">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[100] bg-[var(--accent-signal)] text-white px-3 py-2 rounded-md text-sm font-medium">
        Skip to content
      </a>

      {/* Sidebar — 264px dark premium */}
      <aside
        className={cn(
          "flex-col shrink-0 border-r bg-[var(--surface-base)] sticky top-0 h-screen overflow-hidden",
          "border-[var(--border-default)]",
          sidebarOpen ? "flex fixed inset-y-0 left-0 z-40 w-[280px]" : "hidden lg:flex w-[264px]"
        )}
        aria-label="Primary navigation"
      >
        {/* Wordmark */}
        <div className="h-[64px] flex items-center px-5 border-b border-[var(--border-subtle)] shrink-0">
          <Link href="/dashboard" aria-label="CAL-EXMANAGER home" className="flex items-center gap-2.5">
            <Logo variant="mark" size="md" />
          </Link>
          <button className="lg:hidden ml-auto p-2 rounded-md hover:bg-[var(--surface-1)] text-[var(--text-secondary)]" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Search / Cmd+K trigger */}
        <div className="px-3 pt-4 pb-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-1)] text-[var(--text-tertiary)] text-sm hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label="Open command palette"
          >
            <Icon name="search" size={14} />
            <span className="flex-1 text-left">Search</span>
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]">⌘K</span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-auto" aria-label="Modules">
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[var(--accent-signal-subtle)] text-[var(--accent-signal)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                )}
              >
                <span aria-hidden className="grid place-items-center h-5 w-5 shrink-0">
                  <Icon name={item.icon} size={16} />
                </span>
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent-signal)]" aria-hidden />}
              </Link>
            );
          })}
          <div className="h-px bg-[var(--border-subtle)] my-3" role="separator" />
          {SECONDARY_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active ? "bg-[var(--surface-1)] text-[var(--text-primary)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-secondary)]"
                )}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border-subtle)] shrink-0">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[var(--surface-1)] transition-colors">
            <div className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]">
              {(user as any)?.displayName?.[0] ?? (user as any)?.email?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">{(user as any)?.displayName ?? (user as any)?.email ?? "User"}</div>
              <div className="text-xs text-[var(--text-tertiary)]">View profile</div>
            </div>
            <Icon name="chevronRight" size={14} className="text-[var(--text-tertiary)]" />
          </Link>
          <button onClick={() => logout().then(() => router.push("/auth"))} className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            <Icon name="x" size={14} /> Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar — 56px mobile, 64px desktop, dark hairline */}
        <header className="h-[56px] lg:h-[64px] flex items-center justify-between px-4 lg:px-8 border-b border-[var(--border-subtle)] bg-[var(--surface-base)]/80 backdrop-blur-[12px] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-1)] min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-secondary)]" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle navigation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Link href="/dashboard" className="lg:hidden" aria-label="Home">
              <Logo variant="mark" size="sm" showText={false} />
            </Link>
            <div className="hidden lg:block text-sm text-[var(--text-tertiary)]">Personal Digital Command Center</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hidden lg:flex h-9 w-9 rounded-[10px] border border-[var(--border-default)] bg-[var(--surface-1)] items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]">
              <Icon name="search" size={16} />
            </button>
            <NotificationCenter />
            <Link href="/profile" className="h-9 w-9 rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)]" aria-label="Profile">
              {(user as any)?.displayName?.[0] ?? (user as any)?.email?.[0] ?? "U"}
            </Link>
          </div>
        </header>

        <main id="main-content" className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom nav — 64px, 5 slots */}
        <nav aria-label="Mobile primary" className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-base)]/90 backdrop-blur-[16px] border-t border-[var(--border-subtle)] flex items-center justify-around h-[64px] px-1 z-20 pb-[env(safe-area-inset-bottom)]">
          <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[56px] px-2 py-1 rounded-[10px]", pathname === "/dashboard" ? "text-[var(--accent-signal)] bg-[var(--accent-signal-subtle)]" : "text-[var(--text-tertiary)]")}>
            <Icon name="home" size={18} /><span className="text-[10px] font-medium leading-none">Home</span>
          </Link>
          <Link href="/expenses" aria-current={pathname === "/expenses" ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[56px] px-2 py-1 rounded-[10px]", pathname === "/expenses" ? "text-[var(--accent-signal)] bg-[var(--accent-signal-subtle)]" : "text-[var(--text-tertiary)]")}>
            <Icon name="expenses" size={18} /><span className="text-[10px] font-medium leading-none">CAL-EXPENSES</span>
          </Link>
          <button onClick={() => setShowAdd(true)} aria-label="Quick add" className="h-[56px] w-[56px] rounded-full bg-[var(--accent-signal)] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(91,110,245,0.4)] -mt-5 border-[4px] border-[var(--surface-base)] active:scale-[0.96] transition-transform">
            <Icon name="add" size={22} />
          </button>
          <Link href="/ai" aria-current={pathname === "/ai" ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[56px] px-2 py-1 rounded-[10px]", pathname === "/ai" ? "text-[var(--accent-signal)] bg-[var(--accent-signal-subtle)]" : "text-[var(--text-tertiary)]")}>
            <Icon name="ai" size={18} /><span className="text-[10px] font-medium leading-none">AI</span>
          </Link>
          <button onClick={() => setShowMore(true)} aria-label="More navigation" className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[56px] px-2 py-1 rounded-[10px] text-[var(--text-tertiary)]">
            <Icon name="more" size={18} /><span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </nav>

        {/* Quick Add sheet — center FAB */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
            <div className="absolute inset-0 bg-[var(--surface-overlay)]" onClick={() => setShowAdd(false)} aria-hidden />
            <div className="relative bg-[var(--surface-3)] w-full lg:max-w-md rounded-t-[20px] lg:rounded-[20px] p-6 border border-[var(--border-default)] shadow-[var(--elevation-3)] animate-fadeIn">
              <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border-strong)] mb-4 lg:hidden" aria-hidden />
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Quick Add</h2>
                <button onClick={() => setShowAdd(false)} aria-label="Close" className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-secondary)]"><Icon name="x" size={14} /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Expense", href: "/expenses?action=new", icon: "expenses" as const },
                  { label: "Alarm", href: "/alarms?action=new", icon: "alarm" as const },
                  { label: "Note", href: "/notes?action=new", icon: "notes" as const },
                  { label: "Event", href: "/calendar?action=new", icon: "calendar" as const },
                  { label: "Automation", href: "/automations?action=new", icon: "automations" as const },
                  { label: "Ask AI", href: "/ai", icon: "ai" as const },
                ].map((a) => (
                  <Link key={a.label} href={a.href} onClick={() => setShowAdd(false)} className="flex flex-col items-center gap-2 p-4 rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-colors">
                    <span className="h-10 w-10 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-primary)]"><Icon name={a.icon} size={18} /></span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* More sheet — 2-col grid */}
        {showMore && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            <div className="absolute inset-0 bg-[var(--surface-overlay)]" onClick={() => setShowMore(false)} aria-hidden />
            <div className="relative bg-[var(--surface-3)] w-full rounded-t-[20px] p-6 border border-[var(--border-default)] shadow-[var(--elevation-4)] max-h-[85vh] overflow-auto">
              <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border-strong)] mb-4" aria-hidden />
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">All modules</h2>
                <button onClick={() => setShowMore(false)} aria-label="Close" className="h-8 w-8 rounded-full bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-secondary)]"><Icon name="x" size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {MORE_SHEET_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setShowMore(false)} className="flex items-center gap-3 p-4 rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors">
                    <span className="h-9 w-9 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border-default)] grid place-items-center text-[var(--text-secondary)]"><Icon name={item.icon} size={16} /></span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global command bar */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4">
            <div className="absolute inset-0 bg-[var(--surface-overlay)]" onClick={() => setSearchOpen(false)} aria-hidden />
            <form onSubmit={handleSearch} className="relative bg-[var(--surface-3)] w-full max-w-lg rounded-[14px] border border-[var(--border-default)] shadow-[var(--elevation-3)] overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
                <Icon name="search" size={16} className="text-[var(--text-tertiary)]" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask or jump to… Try 'Spent ₹250 on lunch'" className="flex-1 bg-transparent outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" aria-label="Command palette" />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-xs px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[var(--text-tertiary)]">Esc</button>
              </div>
              <div className="p-3 grid gap-1.5">
                <div className="text-xs font-semibold text-[var(--text-tertiary)] px-2 py-1">Jump to</div>
                {PRIMARY_NAV.slice(0, 5).map((n) => (
                  <button key={n.href} type="button" onClick={() => { setSearchOpen(false); router.push(n.href); }} className="flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-[var(--surface-2)] text-sm text-[var(--text-secondary)] text-left"><Icon name={n.icon} size={14} />{n.label}</button>
                ))}
                <button type="submit" className="mt-2 w-full h-10 rounded-[10px] bg-[var(--accent-signal)] text-white text-sm font-semibold">Search or ask AI</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
