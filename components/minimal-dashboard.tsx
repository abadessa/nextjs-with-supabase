"use client"

import { useState } from "react"
import { PatientCard } from "./simple-patient-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, AlertTriangle, RefreshCw, Download } from "lucide-react"

const initialPatients = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  leito: `Leito ${i + 1}`,
  nome: "",
  diagnostico: "",
  pendencias: "",
  status: "Internado",
  atualizadoEm: new Date().toISOString(),
}))

export function MinimalDashboard() {
  const [pacientes, setPacientes] = useState(initialPatients)

  const atualizarPaciente = (id: number, novosDados: any) => {
    setPacientes((prev) => prev.map((p) => (p.id === id ? { ...p, ...novosDados } : p)))
  }

  // Estatísticas simples
  const totalLeitos = pacientes.length
  const leitosOcupados = pacientes.filter((p) => p.nome.trim() !== "").length
  const leitosVagos = totalLeitos - leitosOcupados
  const pacientesComPendencias = pacientes.filter((p) => p.pendencias.trim() !== "").length

  const handleRefresh = () => {
    setPacientes((prev) =>
      prev.map((p) => ({
        ...p,
        atualizadoEm: new Date().toISOString(),
      })),
    )
  }

  const handleExport = () => {
    const data = pacientes.filter((p) => p.nome.trim() !== "")
    console.log("Exportando dados:", data)
    alert(`Exportando dados de ${data.length} pacientes`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Passagem de Plantão UTI</h1>
              <p className="text-gray-600">Gestão de 10 Leitos</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalLeitos}</div>
              <div className="text-sm text-gray-600">Total Leitos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{leitosOcupados}</div>
              <div className="text-sm text-gray-600">Ocupados</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <UserX className="h-8 w-8 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{leitosVagos}</div>
              <div className="text-sm text-gray-600">Vagos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{pacientesComPendencias}</div>
              <div className="text-sm text-gray-600">Pendências</div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Internado", "Alta", "Óbito", "Transferido"].map((status) => {
                const count = pacientes.filter((p) => p.status === status && p.nome.trim() !== "").length
                return (
                  <Badge key={status} variant="outline" className="px-3 py-1">
                    {status}: {count}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Grid de Pacientes */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leitos da UTI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pacientes.map((paciente) => (
              <PatientCard key={paciente.id} paciente={paciente} onUpdate={atualizarPaciente} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Hospital Municipal e Maternidade Prof. Mario Degni - Sistema UTI Digital
          </div>
        </div>
      </footer>
    </div>
  )
}
