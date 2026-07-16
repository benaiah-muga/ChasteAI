"use client"

import { useEffect, useRef, useCallback } from "react"
import { signOut } from "next-auth/react"
import { api } from "@/trpc/react"

type TimeoutConfig = {
  sessionTimeoutEnabled?: boolean
  idleTimeoutMinutes?: number
  maxSessionHours?: number
}

function toMs(minutes: number) {
  return minutes * 60 * 1000
}

export function IdleTimeoutProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = api.workspace.getSettings.useQuery()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const config: TimeoutConfig = (settings ?? {}) as TimeoutConfig
  const enabled = config.sessionTimeoutEnabled !== false

  const resetTimer = useCallback(() => {
    if (!enabled || !config.idleTimeoutMinutes) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        signOut({ redirectTo: "/signin" })
      }
    }, toMs(config.idleTimeoutMinutes))
  }, [enabled, config.idleTimeoutMinutes])

  useEffect(() => {
    mountedRef.current = true
    if (!enabled) return

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    for (const event of events) {
      window.addEventListener(event, resetTimer)
    }

    resetTimer()

    return () => {
      mountedRef.current = false
      for (const event of events) {
        window.removeEventListener(event, resetTimer)
      }
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, resetTimer])

  return <>{children}</>
}
