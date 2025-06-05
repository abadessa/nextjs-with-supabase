"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/components/lgpd-audit"
import { Edit3, Save, X, User, Stethoscope, AlertTriangle, Clock, Calendar, FileText } from "lucide-react"

interface Patient {
  id: number
  leito: string
  nome: string
  diagnostico: string
  pendencias: string
  status: string
  atualizadoEm: string
  idade?: string
  origem?: string
  dispositivos?: string
  medicacoes?: string
  condicao?: "critico" | "atencao" | "estavel" | "observacao"
}

interface PatientCardProps {
  paciente: Patient
  onUpdate: (id: number, novosDados: any) => void
}

export function PatientCard({ paciente, onUpdate }: PatientCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(paciente)
  const [loggedUser] = useState("hpmduti@gmail.com")

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "internado":
        return "bg-blue-100 text-blue-800"
      case "alta":
        return "bg-green-100 text-green-800"
      case "transferencia":
        return "bg-yellow-100 text-yellow-800"
      case "obito":
        return "bg-red-100 text-red-800"
      case "vago":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCondicaoIcon = (condicao?: string) => {
    switch (condicao) {
      case "critico":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "atencao":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "estavel":
        return <User className="h-4 w-4 text-green-600" />
      case "observacao":
        return <FileText className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const handleSave = () => {
    // Validações básicas
    if (editData.nome && !editData.diagnostico) {
      toast({
        title: "Dados incompletos",
        description: "Paciente com nome deve ter diagnóstico preenchido.",
        variant: "destructive",
      })
      return
    }

    const updatedData = {
      ...editData,
      atualizadoEm: new Date().toISOString(),
    }

    onUpdate(paciente.id, updatedData)

    // Log de auditoria
    logAuditEvent({
      action: "update_patient_card",
      user: loggedUser,
      data: {
        patientId: paciente.id,
        leito: paciente.leito,
        changes: Object.keys(editData).filter((key) => editData[key] !== paciente[key]),
        timestamp: new Date().toISOString(),
      },
    })

    setIsEditing(false)

    toast({
      title: "Paciente atualizado",
      description: `Dados do ${paciente.leito} foram salvos com sucesso.`,
    })
  }

  const handleCancel = () => {
    setEditData(paciente)
    setIsEditing(false)
  }

  const isEmpty = !paciente.nome && !paciente.diagnostico && !paciente.pendencias

  return (
    <Card
      className={`transition-all duration-200 ${isEmpty ? "border-dashed border-gray-300" : "border-solid"} ${isEditing ? "ring-2 ring-blue-500" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {paciente.id}
            </div>
            {paciente.leito}
          </CardTitle>

          <div className="flex items-center gap-2">
            {paciente.condicao && getCondicaoIcon(paciente.condicao)}
            <Badge className={getStatusColor(paciente.status)}>{paciente.status}</Badge>

            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
                <Edit3 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEmpty && !isEditing ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Leito Vago</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>
              Adicionar Paciente
            </Button>
          </div>
        ) : (
          <>
            {/* Nome do Paciente */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Paciente</label>
              </div>
              {isEditing ? (
                <Input
                  value={editData.nome}
                  onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                  placeholder="Nome do paciente"
                  className="text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 ml-6">{paciente.nome || "Não informado"}</p>
              )}
            </div>

            {/* Diagnóstico */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Diagnóstico</label>
              </div>
              {isEditing ? (
                <Textarea
                  value={editData.diagnostico}
                  onChange={(e) => setEditData({ ...editData, diagnostico: e.target.value })}
                  placeholder="Diagnóstico principal e comorbidades"
                  className="text-sm min-h-[60px]"
                />
              ) : (
                <p className="text-sm text-gray-900 ml-6">{paciente.diagnostico || "Não informado"}</p>
              )}
            </div>

            {/* Pendências */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <label className="text-sm font-medium text-gray-700">Pendências</label>
              </div>
              {isEditing ? (
                <Textarea
                  value={editData.pendencias}
                  onChange={(e) => setEditData({ ...editData, pendencias: e.target.value })}
                  placeholder="Exames, procedimentos, avaliações pendentes"
                  className="text-sm min-h-[60px]"
                />
              ) : (
                <p className="text-sm text-gray-900 ml-6">{paciente.pendencias || "Nenhuma pendência"}</p>
              )}
            </div>

            {/* Campos adicionais quando editando */}
            {isEditing && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select
                      value={editData.status}
                      onValueChange={(value) => setEditData({ ...editData, status: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internado">Internado</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Transferencia">Transferência</SelectItem>
                        <SelectItem value="Obito">Óbito</SelectItem>
                        <SelectItem value="Vago">Vago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Condição</label>
                    <Select
                      value={editData.condicao || ""}
                      onValueChange={(value) => setEditData({ ...editData, condicao: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critico">Crítico 🔴</SelectItem>
                        <SelectItem value="atencao">Atenção 🟡</SelectItem>
                        <SelectItem value="estavel">Estável 🟢</SelectItem>
                        <SelectItem value="observacao">Observação 🔵</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dispositivos</label>
                  <Input
                    value={editData.dispositivos || ""}
                    onChange={(e) => setEditData({ ...editData, dispositivos: e.target.value })}
                    placeholder="Ex: PICC, SVD, TQT"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Medicações</label>
                  <Input
                    value={editData.medicacoes || ""}
                    onChange={(e) => setEditData({ ...editData, medicacoes: e.target.value })}
                    placeholder="Medicações em uso"
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {/* Informações adicionais quando não editando */}
            {!isEditing && (paciente.dispositivos || paciente.medicacoes) && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {paciente.dispositivos && (
                  <div className="text-xs text-gray-600">
                    <strong>Dispositivos:</strong> {paciente.dispositivos}
                  </div>
                )}
                {paciente.medicacoes && (
                  <div className="text-xs text-gray-600">
                    <strong>Medicações:</strong> {paciente.medicacoes}
                  </div>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <Calendar className="h-3 w-3" />
              <span>Atualizado em: {new Date(paciente.atualizadoEm).toLocaleString("pt-BR")}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
