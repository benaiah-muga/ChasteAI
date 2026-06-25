"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/agents", label: "Agents" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/documents", label: "Documents" },
]

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
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#eef2ff] font-medium text-[#4f46e5]"
                    : "text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
