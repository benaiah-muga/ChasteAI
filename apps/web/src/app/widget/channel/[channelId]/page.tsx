import type { Metadata } from "next"
import { WidgetChat } from "./widget-chat"

export const metadata: Metadata = {
  title: "Chat",
}

export default function WidgetPage() {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        `}</style>
      </head>
      <body style={{ margin: 0, background: "#ffffff", height: "100vh", overflow: "hidden" }}>
        <WidgetChat />
      </body>
    </html>
  )
}
