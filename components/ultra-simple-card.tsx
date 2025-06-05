"use client"

import type React from "react"

interface Patient {
  id: number
  leito: string
  nome: string
  diagnostico: string
  pendencias: string
  status: string
}

interface PatientCardProps {
  paciente: Patient
  onUpdate: (id: number, data: any) => void
}

export function UltraSimpleCard({ paciente, onUpdate }: PatientCardProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onUpdate(paciente.id, { [e.target.name]: e.target.value })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Internado":
        return "bg-blue-100 border-blue-300"
      case "Alta":
        return "bg-green-100 border-green-300"
      case "Óbito":
        return "bg-red-100 border-red-300"
      case "Transferido":
        return "bg-yellow-100 border-yellow-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  return (
    <div
      className={`border-2 rounded-xl p-4 shadow-sm space-y-3 transition-all hover:shadow-md ${getStatusColor(paciente.status)}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">{paciente.leito}</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 font-medium">{paciente.status}</span>
      </div>

      <input
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        name="nome"
        placeholder="Nome do paciente"
        value={paciente.nome}
        onChange={handleChange}
      />

      <textarea
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
        name="diagnostico"
        placeholder="Diagnóstico principal"
        value={paciente.diagnostico}
        onChange={handleChange}
      />

      <textarea
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
        name="pendencias"
        placeholder="Pendências e observações"
        value={paciente.pendencias}
        onChange={handleChange}
      />

      <select
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        name="status"
        value={paciente.status}
        onChange={handleChange}
      >
        <option value="Internado">🔵 Internado</option>
        <option value="Alta">🟢 Alta</option>
        <option value="Óbito">🔴 Óbito</option>
        <option value="Transferido">🟡 Transferido</option>
      </select>
    </div>
  )
}
