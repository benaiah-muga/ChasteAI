"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  LayoutGrid,
  Settings,
  Search,
  Bell,
  Command,
  Menu,
  X,
} from "lucide-react"
import { IdleTimeoutProvider } from "@/components/idle-timeout-provider"
import { api } from "@/trpc/react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageCircle },
  { href: "/dashboard/channels", label: "Channels", icon: Network },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: LayoutGrid },
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
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "bg-surface-active text-text-primary"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: workspaceList } = api.workspace.list.useQuery()
  const workspaceId = workspaceList?.[0]?.workspaces?.id

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  const content = (
    <div className="bg-bg flex min-h-screen">
      <aside
        className={`border-border bg-surface fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r transition-transform duration-200 ease-in-out lg:static lg:z-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-text-primary flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <div className="bg-accent text-accent-text flex h-6 w-6 items-center justify-center rounded">
              <Command className="h-4 w-4" />
            </div>
            ChasteAI
          </Link>
          <button
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="text-text-muted hover:text-text-primary transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
          <div className="space-y-1">
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
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="border-border bg-surface flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="text-text-muted hover:text-text-primary transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="text-text-muted absolute left-2.5 top-2 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                className="border-border bg-bg text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-accent h-8 w-full rounded-md border pl-9 pr-3 text-sm focus:outline-none focus:ring-1"
              />
              <div className="absolute right-2.5 top-2 flex items-center gap-1">
                <kbd className="border-border bg-surface-elevated text-text-muted inline-flex h-4 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              aria-label="Notifications"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="bg-surface-elevated ring-border text-text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ring-1">
              U
            </div>
          </div>
        </header>
        <main className="bg-bg flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )

  if (!workspaceId) return content

  return <IdleTimeoutProvider workspaceId={workspaceId}>{content}</IdleTimeoutProvider>
}
