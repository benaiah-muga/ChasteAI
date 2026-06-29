export function PageLoader() {
  return (
    <div className="bg-bg fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div
          className="border-accent/30 absolute inset-0 rounded-full border-2"
          style={{
            animation: "loader-ring 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite",
          }}
        />
        <div
          className="border-accent/30 absolute inset-2 rounded-full border-2"
          style={{
            animation: "loader-ring 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite",
            animationDelay: "-0.6s",
          }}
        />
        <div
          className="border-accent/30 absolute inset-4 rounded-full border-2"
          style={{
            animation: "loader-ring 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite",
            animationDelay: "-1.2s",
          }}
        />
      </div>
      <style>{`
        @keyframes loader-ring {
          0% { transform: rotate(0deg) scale(1); border-color: rgba(129, 140, 248, 0.3); }
          25% { border-color: rgba(129, 140, 248, 0.8); }
          50% { transform: rotate(180deg) scale(1.15); border-color: rgba(129, 140, 248, 0.3); }
          75% { border-color: rgba(129, 140, 248, 0.8); }
          100% { transform: rotate(360deg) scale(1); border-color: rgba(129, 140, 248, 0.3); }
        }
      `}</style>
    </div>
  )
}
