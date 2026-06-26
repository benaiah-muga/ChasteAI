export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-neutral-950 pt-16">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
