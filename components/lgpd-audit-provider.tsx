"use client"

import type React from "react"
import { useEffect } from "react"
import { logAuditEvent } from "./lgpd-audit"

interface LGPDAuditProviderProps {
  user: string
  children: React.ReactNode
}

export function LGPDAuditProvider({ user, children }: LGPDAuditProviderProps) {
  useEffect(() => {
    // Registrar login
    logAuditEvent({
      action: "login",
      user,
      data: { timestamp: new Date().toISOString() },
    })

    // Registrar logout quando o componente for desmontado
    return () => {
      logAuditEvent({
        action: "logout",
        user,
        data: { timestamp: new Date().toISOString() },
      })
    }
  }, [user])

  return <>{children}</>
}
