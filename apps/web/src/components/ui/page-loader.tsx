export function PageLoader() {
  return (
    <div className="bg-bg fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div
          className="border-accent absolute inset-0 rounded-full border-2 border-t-transparent"
          style={{
            animation: "page-loader-spin 0.8s linear infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes page-loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
