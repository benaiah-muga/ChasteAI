"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "delete",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("")
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
      setTyped("")
    } else {
      dialog.close()
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel()
    },
    [onCancel, loading],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-ink/50 m-auto border-0 bg-transparent p-0 backdrop:backdrop-blur-sm"
      onCancel={(e) => {
        e.preventDefault()
        if (!loading) onCancel()
      }}
    >
      <div className="border-border bg-surface w-full max-w-md rounded-xl border shadow-lg">
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="bg-danger-subtle text-danger-text flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-text-primary text-base font-semibold">{title}</h2>
            <p className="text-text-secondary mt-1 text-sm">{description}</p>
          </div>
        </div>

        <div className="px-6 pb-4">
          <label className="text-text-primary mb-1.5 block text-xs font-medium">
            Type <span className="font-mono font-bold">{confirmText}</span> to confirm:
          </label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Type "${confirmText}" here...`}
            autoFocus
            disabled={loading}
          />
        </div>

        <div className="border-border flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={typed !== confirmText || loading}
            onClick={onConfirm}
            loading={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
