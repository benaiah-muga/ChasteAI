import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TRPCReactProvider } from "@/trpc/react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

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
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="bg-white text-[#0f172a] antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
