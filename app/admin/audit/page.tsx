"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Shield, User, Activity } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  useEffect(() => {
    // Em produção, isso buscaria de uma API segura
    const logs = JSON.parse(localStorage.getItem("lgpdAuditLogs") || "[]")
    setAuditLogs(logs)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">UTI Digital</h1>
              <p className="text-xs text-slate-500">Hospital Mario Degni</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6 px-4">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Logs de Auditoria LGPD</h1>
              <p className="text-slate-600">Registro de acessos e ações no sistema</p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="h-5 w-5 text-blue-600" />
                Registros de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.action === "login" && <User className="h-4 w-4 text-green-500" />}
                            {log.action === "logout" && <ArrowLeft className="h-4 w-4 text-amber-500" />}
                            {log.action === "manual_logout" && <ArrowLeft className="h-4 w-4 text-red-500" />}
                            {log.action === "view_patient" && <Activity className="h-4 w-4 text-blue-500" />}
                            <span className="capitalize">{log.action.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {log.data ? JSON.stringify(log.data) : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum registro de auditoria encontrado. Os logs aparecerão após o login.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 mt-0.5">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Conformidade LGPD</h3>
                <p className="text-sm text-blue-800 mb-2">
                  De acordo com a Lei 13.709/2018 (LGPD), todos os acessos a dados pessoais sensíveis são registrados e
                  auditados. Estes registros são mantidos por 6 meses e podem ser solicitados pelo DPO ou autoridades
                  competentes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container py-4 px-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Hospital Municipal e Maternidade Prof. Mario Degni. Sistema UTI Digital
              v2.0
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-3 w-3 text-blue-600" />
              <span>Dados protegidos pela LGPD - Lei nº 13.709/2018</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
