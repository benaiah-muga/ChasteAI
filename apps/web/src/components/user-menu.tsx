"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { api } from "@/trpc/react"

export function UserMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { data } = api.auth.session.useQuery()

  const user = data?.user
  const initial = user?.name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open, close])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        aria-expanded={open}
        className="bg-surface-elevated text-text-primary hover:bg-surface-high focus-visible:ring-accent flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
      >
        {user?.image ? (
          <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="border-border bg-surface-elevated absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border shadow-lg"
        >
          {user && (
            <div className="border-border border-b px-4 py-3">
              {user.name && (
                <p className="text-text-primary truncate text-sm font-medium">{user.name}</p>
              )}
              {user.email && <p className="text-text-muted truncate text-xs">{user.email}</p>}
            </div>
          )}
          <div className="p-1">
            <button
              onClick={() => signOut({ redirectTo: "/signin" })}
              className="text-text-secondary hover:bg-surface-hover hover:text-text-primary flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
