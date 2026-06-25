import type { Metadata } from "next"
import { TRPCReactProvider } from "@/trpc/react"

export const metadata: Metadata = {
  title: "ChasteAI",
  description: "Open-source AI customer support infrastructure",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
