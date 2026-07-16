"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BarChart3,
  Bot,
  MessageCircle,
  Network,
  Key,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react"
import { IdleTimeoutProvider } from "@/components/idle-timeout-provider"
import { UserMenu } from "@/components/user-menu"
import { SecurityCodesPrompt } from "@/components/security-codes-prompt"
import { ChangePasswordModal } from "@/components/change-password-modal"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/knowledge-base", label: "Knowledge Base", icon: FileText },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageCircle },
  { href: "/dashboard/channels", label: "Channels", icon: Network },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/team", label: "Team", icon: Users },
]

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onClick,
}: {
  href: string
  label: string
  icon: LucideIcon
  pathname: string
  onClick?: () => void
}) {
  const active = pathname === href || (pathname.startsWith(href + "/") && href !== "/dashboard")
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "bg-surface-active text-text-primary"
          : "text-text-tertiary hover:bg-surface-hover hover:text-text-primary"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(
    searchParams.get("recovery") === "1",
  )
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  useEffect(() => {
    if (searchParams.get("recovery") === "1") {
      setShowRecoveryPassword(true)
      window.history.replaceState({}, "", pathname)
    }
  }, [searchParams, pathname])

  const content = (
    <div className="bg-bg flex h-screen overflow-hidden">
      <aside
        className={`border-border bg-surface fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-text-primary flex items-center gap-2.5 text-sm font-semibold"
          >
            <div className="bg-accent flex h-6 w-6 items-center justify-center rounded-md">
              <span className="text-text-inverse text-xs font-bold">C</span>
            </div>
            <span className="tracking-tight">ChasteAI</span>
          </Link>
          <button
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="text-text-muted hover:text-text-primary transition-colors lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3 pt-1">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} onClick={closeSidebar} />
            ))}
          </div>
          <div className="border-border mt-auto border-t pt-3">
            <NavLink
              href="/dashboard/settings"
              label="Settings"
              icon={Settings}
              pathname={pathname}
              onClick={closeSidebar}
            />
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="bg-surface/80 border-border flex h-14 items-center justify-between border-b px-4 backdrop-blur-md lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="text-text-muted hover:text-text-primary transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search"
                className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent/20 h-8 w-full rounded-lg border pl-9 pr-3 text-sm transition-colors focus:outline-none focus:ring-1"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <kbd className="border-border bg-surface-elevated text-text-muted inline-flex h-4 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px]">
                  <span className="text-[11px]">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button>
            <UserMenu />
          </div>
        </header>
        <main className="bg-bg flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )

  return (
    <IdleTimeoutProvider>
      {content}
      <SecurityCodesPrompt />
      <ChangePasswordModal
        open={showRecoveryPassword}
        onComplete={() => setShowRecoveryPassword(false)}
      />
    </IdleTimeoutProvider>
  )
}
