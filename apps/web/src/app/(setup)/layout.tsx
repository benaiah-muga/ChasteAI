export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg relative flex min-h-screen items-start justify-center overflow-hidden p-6 pt-16">
      {/* Subtle background effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full max-w-[600px]">{children}</div>
    </div>
  )
}
