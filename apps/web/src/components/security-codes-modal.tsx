"use client"

import { useState, useCallback } from "react"
import { Download, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type SecurityCodesModalProps = {
  codes: string[]
  open: boolean
  onClose: () => void
}

export function SecurityCodesModal({ codes, open, onClose }: SecurityCodesModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [codes])

  const handleDownload = useCallback(() => {
    const content = [
      "ChasteAI Security Codes",
      "=======================",
      "",
      "Keep these codes safe. Each code can only be used once.",
      "If you lose access to your account, you can use these codes to sign in.",
      "",
      ...codes.map((code, i) => `${i + 1}. ${code}`),
      "",
      `Generated: ${new Date().toLocaleDateString()}`,
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chasteai-security-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }, [codes])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div className="bg-surface border-border relative z-10 mx-4 w-full max-w-lg rounded-xl border shadow-lg">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-text-primary text-lg font-semibold">Security Codes</h2>
            <p className="text-text-secondary mt-1 text-sm">
              Save these codes. They won&apos;t be shown again.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="bg-bg border-border rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-2">
              {codes.map((code, i) => (
                <div key={i} className="text-text-primary font-mono text-sm tracking-wider">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border flex items-center justify-between border-t p-6">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="h-3.5 w-3.5" />
                  Copy all
                </span>
              )}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download
              </span>
            </Button>
          </div>
          <Button size="sm" onClick={onClose}>
            I&apos;ve saved my codes
          </Button>
        </div>
      </div>
    </div>
  )
}
