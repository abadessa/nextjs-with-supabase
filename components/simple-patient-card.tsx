"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Stethoscope, AlertTriangle, Clock } from "lucide-react"

interface Patient {
  id: number
  leito: string
  nome: string
  diagnostico: string
  pendencias: string
  status: string
  atualizadoEm?: string
}

interface PatientCardProps {
  paciente: Patient
  onUpdate: (id: number, data: Partial<Patient>) => void
}

export function PatientCard({ paciente, onUpdate }: PatientCardProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(paciente.id, {
      [e.target.name]: e.target.value,
      atualizadoEm: new Date().toISOString(),
    })
  }

  const handleStatusChange = (value: string) => {
    onUpdate(paciente.id, {
      status: value,
      atualizadoEm: new Date().toISOString(),
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "internado":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "alta":
        return "bg-green-100 text-green-800 border-green-200"
      case "óbito":
        return "bg-red-100 text-red-800 border-red-200"
      case "transferido":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isEmpty = !paciente.nome && !paciente.diagnostico && !paciente.pendencias

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${isEmpty ? "border-dashed border-gray-300 bg-gray-50/50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {paciente.id}
            </div>
            {paciente.leito}
          </CardTitle>
          <Badge className={getStatusColor(paciente.status)}>{paciente.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEmpty ? (
          <div className="text-center py-6 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Leito Vago</p>
            <p className="text-xs text-gray-400 mt-1">Clique nos campos para adicionar paciente</p>
          </div>
        ) : null}

        {/* Nome do Paciente */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Paciente</label>
          </div>
          <Input
            name="nome"
            placeholder="Nome completo do paciente"
            value={paciente.nome}
            onChange={handleChange}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Diagnóstico */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Diagnóstico</label>
          </div>
          <Textarea
            name="diagnostico"
            placeholder="Diagnóstico principal e comorbidades"
            value={paciente.diagnostico}
            onChange={handleChange}
            className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Pendências */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <label className="text-sm font-medium text-gray-700">Pendências</label>
          </div>
          <Textarea
            name="pendencias"
            placeholder="Exames, procedimentos, avaliações pendentes"
            value={paciente.pendencias}
            onChange={handleChange}
            className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Status</label>
          </div>
          <Select value={paciente.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Internado">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Internado
                </div>
              </SelectItem>
              <SelectItem value="Alta">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Alta
                </div>
              </SelectItem>
              <SelectItem value="Óbito">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Óbito
                </div>
              </SelectItem>
              <SelectItem value="Transferido">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Transferido
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timestamp */}
        {paciente.atualizadoEm && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Atualizado: {new Date(paciente.atualizadoEm).toLocaleString("pt-BR")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
