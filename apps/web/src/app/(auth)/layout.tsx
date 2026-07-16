export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6">
        {children}
      </div>
    </div>
  )
}
