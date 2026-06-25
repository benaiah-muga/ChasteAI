import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <nav className="flex w-56 flex-col border-r bg-gray-50 p-4">
        <Link href="/dashboard" className="mb-6 text-lg font-semibold">
          ChasteAI
        </Link>
        <div className="space-y-1 text-sm">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/agents"
            className="block rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Agents
          </Link>
          <Link
            href="/dashboard/workspaces"
            className="block rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Workspaces
          </Link>
        </div>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
