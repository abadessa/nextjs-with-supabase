"use client"

import { useState } from "react"
import { PatientCard } from "./patient-card"
import { StatsPanel } from "./stats-panel"
import { UploadPDF } from "./upload-pdf"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, Settings } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/components/lgpd-audit"

const initialPatients = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  leito: `Leito ${i + 1}`,
  nome: "",
  diagnostico: "",
  pendencias: "",
  status: "Vago",
  atualizadoEm: new Date().toISOString(),
}))

export function SimpleDashboard() {
  const [pacientes, setPacientes] = useState(initialPatients)
  const [loggedUser] = useState("hpmduti@gmail.com")

  const atualizarPaciente = (id: number, novosDados: any) => {
    setPacientes((prev) => prev.map((p) => (p.id === id ? { ...p, ...novosDados } : p)))
  }

  const handleRefresh = () => {
    // Simular atualização de dados
    setPacientes((prev) =>
      prev.map((p) => ({
        ...p,
        atualizadoEm: new Date().toISOString(),
      })),
    )

    logAuditEvent({
      action: "refresh_dashboard",
      user: loggedUser,
      data: { timestamp: new Date().toISOString() },
    })

    toast({
      title: "Dashboard atualizado",
      description: "Dados foram sincronizados com sucesso.",
    })
  }

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalPatients: pacientes.filter((p) => p.nome).length,
      patients: pacientes
        .filter((p) => p.nome)
        .map((p) => ({
          leito: p.leito,
          nome: p.nome,
          diagnostico: p.diagnostico,
          pendencias: p.pendencias,
          status: p.status,
        })),
    }

    logAuditEvent({
      action: "export_dashboard_report",
      user: loggedUser,
      data: reportData,
    })

    toast({
      title: "Relatório exportado",
      description: "Relatório da passagem de plantão foi gerado.",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard UTI</h1>
              <p className="text-slate-600">Passagem de Plantão - 10 Leitos</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 space-y-6">
        {/* Painel de Estatísticas */}
        <StatsPanel pacientes={pacientes} />

        {/* Upload de PDF */}
        <UploadPDF atualizarPacientes={setPacientes} />

        {/* Grid de Pacientes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Leitos da UTI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pacientes.map((p) => (
              <PatientCard key={p.id} paciente={p} onUpdate={atualizarPaciente} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="container mx-auto py-4 px-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Hospital Municipal e Maternidade Prof. Mario Degni
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Sistema em conformidade com a LGPD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
