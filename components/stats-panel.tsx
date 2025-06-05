"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, UserCheck, UserX, AlertTriangle, Clock, Activity, TrendingUp, TrendingDown } from "lucide-react"

interface Patient {
  id: number
  leito: string
  nome: string
  diagnostico: string
  pendencias: string
  status: string
  atualizadoEm: string
  condicao?: "critico" | "atencao" | "estavel" | "observacao"
}

interface StatsPanelProps {
  pacientes: Patient[]
}

export function StatsPanel({ pacientes }: StatsPanelProps) {
  // Calcular estatísticas
  const totalLeitos = pacientes.length
  const leitosOcupados = pacientes.filter((p) => p.nome && p.status === "Internado").length
  const leitosVagos = totalLeitos - leitosOcupados
  const taxaOcupacao = totalLeitos > 0 ? (leitosOcupados / totalLeitos) * 100 : 0

  const pacientesCriticos = pacientes.filter((p) => p.condicao === "critico").length
  const pacientesAtencao = pacientes.filter((p) => p.condicao === "atencao").length
  const pacientesEstaveis = pacientes.filter((p) => p.condicao === "estavel").length

  const pacientesComPendencias = pacientes.filter((p) => p.pendencias && p.pendencias.trim() !== "").length

  const altas = pacientes.filter((p) => p.status === "Alta").length
  const transferencias = pacientes.filter((p) => p.status === "Transferencia").length
  const obitos = pacientes.filter((p) => p.status === "Obito").length

  const stats = [
    {
      title: "Total de Leitos",
      value: totalLeitos,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Leitos Ocupados",
      value: leitosOcupados,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: `${taxaOcupacao.toFixed(1)}% ocupação`,
    },
    {
      title: "Leitos Vagos",
      value: leitosVagos,
      icon: UserX,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    {
      title: "Pacientes Críticos",
      value: pacientesCriticos,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  const conditionStats = [
    { label: "Críticos", value: pacientesCriticos, color: "bg-red-500" },
    { label: "Atenção", value: pacientesAtencao, color: "bg-yellow-500" },
    { label: "Estáveis", value: pacientesEstaveis, color: "bg-green-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.subtitle && <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Painel Detalhado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Taxa de Ocupação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Taxa de Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Ocupação Atual</span>
                <span className="font-medium">{taxaOcupacao.toFixed(1)}%</span>
              </div>
              <Progress value={taxaOcupacao} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ocupados:</span>
                  <span className="font-medium ml-1">{leitosOcupados}</span>
                </div>
                <div>
                  <span className="text-gray-600">Vagos:</span>
                  <span className="font-medium ml-1">{leitosVagos}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Condição */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Condições Clínicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conditionStats.map((condition, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${condition.color}`} />
                    <span className="text-sm text-gray-600">{condition.label}</span>
                  </div>
                  <span className="text-sm font-medium">{condition.value}</span>
                </div>
              ))}

              {leitosOcupados === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum paciente internado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pendências e Atividades */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Resumo de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendências</span>
                <span className="text-sm font-medium text-orange-600">{pacientesComPendencias}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Altas</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm font-medium text-green-600">{altas}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transferências</span>
                <span className="text-sm font-medium text-blue-600">{transferencias}</span>
              </div>

              {obitos > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Óbitos</span>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span className="text-sm font-medium text-red-600">{obitos}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Última atualização: {new Date().toLocaleTimeString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
