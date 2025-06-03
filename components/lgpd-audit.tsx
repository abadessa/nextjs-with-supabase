"use client"

import type React from "react"

import { useEffect } from "react"

type AuditLogProps = {
  action: string
  user: string
  data?: Record<string, any>
}

export function logAuditEvent({ action, user, data }: AuditLogProps) {
  // Em um ambiente de produção, isso enviaria para um servidor seguro
  // Aqui apenas simulamos o registro de auditoria
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    action,
    user,
    ipAddress: "Registrado no servidor",
    data,
  }

  console.log("LGPD Audit Log:", logEntry)

  // Em produção: enviar para API segura
  // fetch('/api/audit-log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(logEntry)
  // })

  // Armazenar localmente para demonstração
  const auditLogs = JSON.parse(localStorage.getItem("lgpdAuditLogs") || "[]")
  auditLogs.push(logEntry)
  localStorage.setItem("lgpdAuditLogs", JSON.stringify(auditLogs))
}

export function LGPDAuditProvider({
  user,
  children,
}: {
  user: string
  children: React.ReactNode
}) {
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
