"use client"

import { useState } from "react"

export function ExpandableError({ message, details }: { message: string; details: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-danger bg-danger-subtle rounded-lg border p-4">
      <p className="text-danger-text text-sm">{message}</p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-danger-text/70 hover:text-danger-text mt-1 text-xs underline"
      >
        {expanded ? "Hide technical details" : "Show technical details"}
      </button>
      {expanded && (
        <div className="relative mt-2">
          <pre className="bg-surface border-border text-text-secondary overflow-x-auto rounded-lg border p-3 text-xs">
            {details}
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(details)}
            className="bg-surface-elevated hover:bg-surface-hover text-text-secondary absolute right-2 top-2 rounded-md px-2 py-1 text-xs transition-colors"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  )
}
