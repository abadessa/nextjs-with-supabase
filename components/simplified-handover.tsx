"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/components/lgpd-audit"
import { Heart, AlertTriangle, CheckCircle, Clock, UserX, FileText, Calendar, User } from "lucide-react"

// Tipos para o sistema
type BedStatus = "occupied" | "awaiting_discharge" | "cleaning" | "empty" | "blocked"
type PatientCondition = "critical" | "attention" | "stable" | "observation"

type Bed = {
  id: number
  patient: string | null
  diagnosis: string | null
  status: BedStatus
  condition: PatientCondition | null
  notes: string | null
  admissionDate?: string
  devices?: string
  medications?: string
}

type DischargeRecord = {
  patient: string
  diagnosis: string
  bedId: number
  dischargeDate: string
  dischargeTime: string
  reason: string
  registeredAt: string
}

// Dados iniciais dos leitos (simulando dados reais)
const initialBeds: Bed[] = [
  {
    id: 1,
    patient: "LUCI APARECIDA MORALES DI BERT, 66a",
    diagnosis: "Choque séptico (Foco A/E) / Hipovolêmico",
    status: "occupied",
    condition: "critical",
    notes: "SAPS3: 76 | 67,5% - Vancocinemia pendente",
    admissionDate: "20/05/2025",
    devices: "PICC, AVC, Permcath",
    medications: "Gabapentina, Amitriptilina",
  },
  {
    id: 2,
    patient: "MARIA APARECIDA DA SILVA, 71a",
    diagnosis: "DPOC exacerbado / PO TQT",
    status: "occupied",
    condition: "stable",
    notes: "Desmame lento VM conforme tolerância",
    admissionDate: "08/05/2025",
    devices: "TQT, SVD, PICC MSD",
    medications: "Quetiapina 25mg 12/12h",
  },
  {
    id: 3,
    patient: "MARIA SOCORRO MARQUES PEREIRA, 61a",
    diagnosis: "PO colectomia + ureteroplastia",
    status: "occupied",
    condition: "stable",
    notes: "NPT central iniciada - Jejum",
    admissionDate: "28/05/2025",
    devices: "SVD 3 vias + AVP + PICC",
    medications: "Procinéticos, simeticona",
  },
  {
    id: 4,
    patient: "ISABEL CRISTINA MARTINS DA SILVA, 42a",
    diagnosis: "PO drenagem abscesso / LRA KDIGO III",
    status: "occupied",
    condition: "attention",
    notes: "Não deambular - risco evisceração",
    admissionDate: "16/05/2025",
    devices: "SVD + PICC MSD",
    medications: "Ketamina, Metadona, Gabapentina",
  },
  {
    id: 5,
    patient: "JOÃO PITA MARINHO, 83a",
    diagnosis: "DRC Agudizado / ICC Perfil B",
    status: "occupied",
    condition: "stable",
    notes: "Acompanhamento nefrologia",
    admissionDate: "28/05/2025",
    devices: "AVP",
    medications: "Hidralazina, Furosemida",
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: i + 6,
    patient: null,
    diagnosis: null,
    status: "empty" as BedStatus,
    condition: null,
    notes: null,
  })),
]

export function SimplifiedHandover() {
  const [beds, setBeds] = useState<Bed[]>(initialBeds)
  const [showDischargeModal, setShowDischargeModal] = useState(false)
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
  const [dischargeDetails, setDischargeDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    reason: "",
  })
  const [dischargeHistory, setDischargeHistory] = useState<DischargeRecord[]>([])
  const [loggedUser] = useState("hpmduti@gmail.com")

  // Função para obter o ícone da condição
  const getConditionIcon = (condition: PatientCondition | null) => {
    switch (condition) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "attention":
        return <Clock className="h-4 w-4 text-amber-600" />
      case "stable":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "observation":
        return <Heart className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  // Função para obter a cor do badge de status
  const getStatusBadge = (status: BedStatus) => {
    switch (status) {
      case "occupied":
        return <Badge className="bg-blue-100 text-blue-800">Ocupado</Badge>
      case "awaiting_discharge":
        return <Badge className="bg-amber-100 text-amber-800">Aguardando Alta</Badge>
      case "cleaning":
        return <Badge className="bg-purple-100 text-purple-800">Em Higienização</Badge>
      case "empty":
        return <Badge className="bg-slate-100 text-slate-600">Vago</Badge>
      case "blocked":
        return <Badge className="bg-red-100 text-red-800">Bloqueado</Badge>
      default:
        return <Badge>Indefinido</Badge>
    }
  }

  // Função para alterar status do leito
  const handleStatusChange = (bedId: number, newStatus: BedStatus) => {
    setBeds(beds.map((bed) => (bed.id === bedId ? { ...bed, status: newStatus } : bed)))

    // Log da auditoria
    logAuditEvent({
      action: "change_bed_status",
      user: loggedUser,
      data: { bedId, newStatus, timestamp: new Date().toISOString() },
    })

    toast({
      title: "Status atualizado",
      description: `Leito ${bedId} alterado para ${newStatus}`,
    })
  }

  // Função para alterar condição do paciente
  const handleConditionChange = (bedId: number, newCondition: PatientCondition) => {
    setBeds(beds.map((bed) => (bed.id === bedId ? { ...bed, condition: newCondition } : bed)))

    // Log da auditoria
    logAuditEvent({
      action: "change_patient_condition",
      user: loggedUser,
      data: { bedId, newCondition, timestamp: new Date().toISOString() },
    })
  }

  // Função para iniciar processo de alta
  const handleDischargeRequest = (bed: Bed) => {
    setSelectedBed(bed)
    setShowDischargeModal(true)
  }

  // Função para confirmar alta
  const handleConfirmDischarge = () => {
    if (!selectedBed || !dischargeDetails.reason) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Criar registro de alta
    const dischargeRecord: DischargeRecord = {
      patient: selectedBed.patient!,
      diagnosis: selectedBed.diagnosis!,
      bedId: selectedBed.id,
      dischargeDate: dischargeDetails.date,
      dischargeTime: dischargeDetails.time,
      reason: dischargeDetails.reason,
      registeredAt: new Date().toLocaleString("pt-BR"),
    }

    // Adicionar ao histórico
    setDischargeHistory([...dischargeHistory, dischargeRecord])

    // Limpar o leito
    setBeds(
      beds.map((bed) =>
        bed.id === selectedBed.id
          ? {
              ...bed,
              patient: null,
              diagnosis: null,
              status: "cleaning" as BedStatus,
              condition: null,
              notes: null,
              admissionDate: undefined,
              devices: undefined,
              medications: undefined,
            }
          : bed,
      ),
    )

    // Log da auditoria
    logAuditEvent({
      action: "patient_discharge",
      user: loggedUser,
      data: {
        bedId: selectedBed.id,
        patient: selectedBed.patient,
        reason: dischargeDetails.reason,
        timestamp: new Date().toISOString(),
      },
    })

    // Resetar modal
    setShowDischargeModal(false)
    setSelectedBed(null)
    setDischargeDetails({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      reason: "",
    })

    toast({
      title: "Alta registrada",
      description: `${dischargeRecord.patient} recebeu alta com sucesso.`,
    })
  }

  // Função para cancelar alta
  const handleCancelDischarge = () => {
    setShowDischargeModal(false)
    setSelectedBed(null)
    setDischargeDetails({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      reason: "",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Passagem de Plantão UTI</h1>
        <p className="text-slate-600">Gestão Simplificada de 10 Leitos</p>
      </div>

      {/* Grid de Leitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {beds.map((bed) => (
          <Card key={bed.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Leito {bed.id}</CardTitle>
                {getStatusBadge(bed.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {bed.patient ? (
                <>
                  {/* Informações do Paciente */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">{bed.patient}</span>
                    </div>

                    <div className="text-sm text-slate-600">
                      <strong>Diagnóstico:</strong> {bed.diagnosis}
                    </div>

                    {bed.admissionDate && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Internação: {bed.admissionDate}
                      </div>
                    )}

                    {bed.devices && (
                      <div className="text-xs text-slate-600">
                        <strong>Dispositivos:</strong> {bed.devices}
                      </div>
                    )}

                    {bed.notes && <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">{bed.notes}</div>}
                  </div>

                  {/* Controles */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Status:</span>
                      <Select
                        value={bed.status}
                        onValueChange={(value: BedStatus) => handleStatusChange(bed.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="occupied">Ocupado</SelectItem>
                          <SelectItem value="awaiting_discharge">Aguardando Alta</SelectItem>
                          <SelectItem value="cleaning">Em Higienização</SelectItem>
                          <SelectItem value="empty">Vago</SelectItem>
                          <SelectItem value="blocked">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Condição:</span>
                      <Select
                        value={bed.condition || ""}
                        onValueChange={(value: PatientCondition) => handleConditionChange(bed.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Crítico 🔴</SelectItem>
                          <SelectItem value="attention">Atenção 🟡</SelectItem>
                          <SelectItem value="stable">Estável 🟢</SelectItem>
                          <SelectItem value="observation">Observação 🔵</SelectItem>
                        </SelectContent>
                      </Select>
                      {bed.condition && <div className="ml-1">{getConditionIcon(bed.condition)}</div>}
                    </div>
                  </div>

                  {/* Botão de Alta */}
                  {bed.status !== "empty" && (
                    <Button
                      onClick={() => handleDischargeRequest(bed)}
                      variant="destructive"
                      size="sm"
                      className="w-full mt-3"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Dar Alta
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Leito Disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Alta */}
      <Dialog open={showDischargeModal} onOpenChange={setShowDischargeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Alta do Paciente</DialogTitle>
            <DialogDescription>
              Leito {selectedBed?.id} - {selectedBed?.patient}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data da Alta</label>
                <Input
                  type="date"
                  value={dischargeDetails.date}
                  onChange={(e) =>
                    setDischargeDetails({
                      ...dischargeDetails,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hora da Alta</label>
                <Input
                  type="time"
                  value={dischargeDetails.time}
                  onChange={(e) =>
                    setDischargeDetails({
                      ...dischargeDetails,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da Alta *</label>
              <Select
                value={dischargeDetails.reason}
                onValueChange={(value) =>
                  setDischargeDetails({
                    ...dischargeDetails,
                    reason: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="melhora_clinica">Melhora Clínica</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="obito">Óbito</SelectItem>
                  <SelectItem value="evasao">Evasão</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Conformidade LGPD</p>
                  <p>Esta ação será registrada no sistema de auditoria.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDischarge}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDischarge}>Confirmar Alta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico de Altas */}
      {dischargeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Altas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dischargeHistory
                .slice(-5)
                .reverse()
                .map((record, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-lg border-l-4 border-green-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>Paciente:</strong> {record.patient}
                      </div>
                      <div>
                        <strong>Leito:</strong> {record.bedId}
                      </div>
                      <div>
                        <strong>Alta:</strong> {record.dischargeDate} às {record.dischargeTime}
                      </div>
                      <div>
                        <strong>Motivo:</strong> {record.reason}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Registrado em: {record.registeredAt}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
