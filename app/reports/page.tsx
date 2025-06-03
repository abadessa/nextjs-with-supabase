"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Heart, ArrowLeft, Download, Calendar, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  const reportData = {
    monthly: {
      period: "Novembro 2024",
      totalPatients: 45,
      discharges: 38,
      deaths: 4,
      readmissions: 7,
      infections: {
        bloodstream: 6,
        ventilator: 3,
        catheter: 4,
      },
      averageStay: 8.5,
      occupancyRate: 71.2,
      mortalityRate: 8.9,
    },
    quarterly: {
      period: "Q4 2024",
      totalPatients: 142,
      discharges: 125,
      deaths: 12,
      readmissions: 19,
      infections: {
        bloodstream: 18,
        ventilator: 9,
        catheter: 12,
      },
      averageStay: 9.1,
      occupancyRate: 73.5,
      mortalityRate: 8.5,
    },
  }

  const currentData = reportData[selectedPeriod]

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
              <h1 className="text-2xl font-bold text-slate-900">Relatórios de Qualidade</h1>
              <p className="text-slate-600">Indicadores e métricas da UTI - {currentData.period}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Período
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mb-6">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Resumo Executivo */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total de Pacientes</p>
                    <p className="text-2xl font-bold text-blue-900">{currentData.totalPatients}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Taxa de Alta</p>
                    <p className="text-2xl font-bold text-green-900">
                      {((currentData.discharges / currentData.totalPatients) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Mortalidade</p>
                    <p className="text-2xl font-bold text-red-900">{currentData.mortalityRate}%</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Ocupação</p>
                    <p className="text-2xl font-bold text-purple-900">{currentData.occupancyRate}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhamento por Categoria */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Desfechos Clínicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Altas Hospitalares</span>
                    <span className="text-sm text-slate-600">{currentData.discharges} pacientes</span>
                  </div>
                  <Progress value={(currentData.discharges / currentData.totalPatients) * 100} className="h-3" />
                  <p className="text-xs text-slate-500 mt-1">
                    {((currentData.discharges / currentData.totalPatients) * 100).toFixed(1)}% do total
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Óbitos</span>
                    <span className="text-sm text-slate-600">{currentData.deaths} casos</span>
                  </div>
                  <Progress value={currentData.mortalityRate} className="h-3" max={20} />
                  <p className="text-xs text-slate-500 mt-1">Taxa de mortalidade: {currentData.mortalityRate}%</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Readmissões</span>
                    <span className="text-sm text-slate-600">{currentData.readmissions} casos</span>
                  </div>
                  <Progress
                    value={(currentData.readmissions / currentData.totalPatients) * 100}
                    className="h-3"
                    max={20}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {((currentData.readmissions / currentData.totalPatients) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infecções Relacionadas à Assistência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">IPCS - Corrente Sanguínea</span>
                    <span className="text-sm text-slate-600">{currentData.infections.bloodstream} casos</span>
                  </div>
                  <Progress
                    value={(currentData.infections.bloodstream / currentData.totalPatients) * 100}
                    className="h-3"
                    max={25}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {((currentData.infections.bloodstream / currentData.totalPatients) * 100).toFixed(1)}% dos pacientes
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">PAVM - Pneumonia Associada</span>
                    <span className="text-sm text-slate-600">{currentData.infections.ventilator} casos</span>
                  </div>
                  <Progress
                    value={(currentData.infections.ventilator / currentData.totalPatients) * 100}
                    className="h-3"
                    max={15}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {((currentData.infections.ventilator / currentData.totalPatients) * 100).toFixed(1)}% dos pacientes
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">ITU - Cateter Associada</span>
                    <span className="text-sm text-slate-600">{currentData.infections.catheter} casos</span>
                  </div>
                  <Progress
                    value={(currentData.infections.catheter / currentData.totalPatients) * 100}
                    className="h-3"
                    max={15}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {((currentData.infections.catheter / currentData.totalPatients) * 100).toFixed(1)}% dos pacientes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparação com Metas */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Comparação com Metas Institucionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Mortalidade</p>
                  <p className="text-2xl font-bold text-slate-900">{currentData.mortalityRate}%</p>
                  <p className="text-xs text-slate-500">Meta: &lt; 10%</p>
                  <div
                    className={`mt-2 text-xs font-medium ${currentData.mortalityRate < 10 ? "text-green-600" : "text-red-600"}`}
                  >
                    {currentData.mortalityRate < 10 ? "✓ Meta atingida" : "✗ Acima da meta"}
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">IPCS</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {((currentData.infections.bloodstream / currentData.totalPatients) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">Meta: &lt; 5%</p>
                  <div
                    className={`mt-2 text-xs font-medium ${(currentData.infections.bloodstream / currentData.totalPatients) * 100 < 5 ? "text-green-600" : "text-red-600"}`}
                  >
                    {(currentData.infections.bloodstream / currentData.totalPatients) * 100 < 5
                      ? "✓ Meta atingida"
                      : "✗ Acima da meta"}
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Ocupação</p>
                  <p className="text-2xl font-bold text-slate-900">{currentData.occupancyRate}%</p>
                  <p className="text-xs text-slate-500">Meta: 70-85%</p>
                  <div
                    className={`mt-2 text-xs font-medium ${currentData.occupancyRate >= 70 && currentData.occupancyRate <= 85 ? "text-green-600" : "text-amber-600"}`}
                  >
                    {currentData.occupancyRate >= 70 && currentData.occupancyRate <= 85
                      ? "✓ Dentro da meta"
                      : "⚠ Fora da meta"}
                  </div>
                </div>

                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 mb-2">Permanência</p>
                  <p className="text-2xl font-bold text-slate-900">{currentData.averageStay}</p>
                  <p className="text-xs text-slate-500">dias médios</p>
                  <div className="mt-2 text-xs font-medium text-blue-600">Dentro do esperado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container py-4 px-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Hospital Municipal e Maternidade Prof. Mario Degni
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Heart className="h-3 w-3 text-blue-600" />
              <span>Relatório gerado em conformidade com indicadores de qualidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
