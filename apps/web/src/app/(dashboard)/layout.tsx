"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/team", label: "Team" },
]

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || pathname.startsWith(href + "/")
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-[#eef2ff] font-medium text-[#4f46e5]"
          : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
      }`}
    >
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <aside className="flex w-56 flex-col border-r border-[#e2e8f0] bg-white">
        <div className="flex h-14 items-center border-b border-[#e2e8f0] px-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-[#0f172a]">
            ChasteAI
          </Link>
        </div>
        <nav className="flex flex-1 flex-col p-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
          <div className="mt-auto border-t border-[#e2e8f0] pt-3">
            <NavLink href="/dashboard/settings" label="Settings" pathname={pathname} />
          </div>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
