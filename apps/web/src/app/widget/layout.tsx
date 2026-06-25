export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, background: "#ffffff", height: "100vh", overflow: "hidden" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; }
      `}</style>
      {children}
    </div>
  )
}
