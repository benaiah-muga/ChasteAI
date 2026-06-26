"use client"

import { useState } from "react"

export function ExpandableError({
  message,
  details,
}: {
  message: string
  details: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-red-800 bg-red-950/50 p-4">
      <p className="text-sm text-red-300">{message}</p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 text-xs text-red-400 underline hover:text-red-300"
      >
        {expanded ? "Hide technical details" : "Show technical details"}
      </button>
      {expanded && (
        <div className="relative mt-2">
          <pre className="overflow-x-auto rounded border border-neutral-700 bg-neutral-900 p-3 text-xs text-neutral-300">
            {details}
          </pre>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(details)}
            className="absolute right-2 top-2 rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  )
}
