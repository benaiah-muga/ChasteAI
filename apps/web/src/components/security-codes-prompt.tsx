"use client"

import { useState } from "react"
import { ShieldAlert } from "lucide-react"
import { api } from "@/trpc/react"
import { SecurityCodesModal } from "./security-codes-modal"

export function SecurityCodesPrompt() {
  const [dismissed, setDismissed] = useState(false)
  const [showCodes, setShowCodes] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])

  const { data: codesData, isLoading } = api.securityCodes.list.useQuery()
  const generateMutation = api.securityCodes.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedCodes(data.codes)
      setShowCodes(true)
    },
  })

  const needsPrompt = !isLoading && codesData && codesData.unused === 0 && !dismissed

  function handleGenerate() {
    generateMutation.mutate()
  }

  function handleCodesSaved() {
    setShowCodes(false)
    setDismissed(true)
  }

  if (!needsPrompt) return null

  return (
    <>
      <div className="bg-bg/90 fixed inset-0 z-50 backdrop-blur-sm" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface border-border w-full max-w-md rounded-xl border shadow-2xl">
          <div className="p-8 text-center">
            <div className="bg-warning-subtle mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <ShieldAlert className="text-warning-text h-7 w-7" />
            </div>
            <h2 className="text-text-primary text-lg font-semibold">Security codes required</h2>
            <p className="text-text-secondary mt-2 text-sm">
              You must generate and save security codes before you can use the dashboard. These
              codes allow you to recover your account if you forget your password.
            </p>
          </div>

          <div className="border-border flex justify-end border-t p-6">
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="bg-accent text-accent-text hover:bg-accent-strong rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {generateMutation.isPending ? "Generating..." : "Generate security codes"}
            </button>
          </div>
        </div>
      </div>

      {showCodes && generatedCodes.length > 0 && (
        <SecurityCodesModal codes={generatedCodes} open={true} onClose={handleCodesSaved} />
      )}
    </>
  )
}
