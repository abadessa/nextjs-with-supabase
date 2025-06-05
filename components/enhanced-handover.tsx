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
import { PatientAdmissionDialog } from "@/components/patient-admission-dialog"
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserX,
  FileText,
  Calendar,
  User,
  UserPlus,
  ArrowRightLeft,
  Download,
  RefreshCw,
} from "lucide-react"

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
  allergies?: string
  origin?: string
  emergencyContact?: string
  contactPhone?: string
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

type TransferRecord = {
  patient: string
  fromBed: number
  toBed: number
  reason: string
  transferDate: string
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
    allergies: "Nimesulida",
    origin: "UPA III LAPA",
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
    origin: "UPA Rio Pequeno",
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
    origin: "Centro Cirúrgico",
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    id: i + 4,
    patient: null,
    diagnosis: null,
    status: "empty" as BedStatus,
    condition: null,
    notes: null,
  })),
]

export function EnhancedHandover() {
  const [beds, setBeds] = useState<Bed[]>(initialBeds)
  const [showDischargeModal, setShowDischargeModal] = useState(false)
  const [showAdmissionModal, setShowAdmissionModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
  const [selectedBedForAdmission, setSelectedBedForAdmission] = useState<number | null>(null)
  const [dischargeDetails, setDischargeDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    reason: "",
  })
  const [transferDetails, setTransferDetails] = useState({
    toBed: "",
    reason: "",
  })
  const [dischargeHistory, setDischargeHistory] = useState<DischargeRecord[]>([])
  const [transferHistory, setTransferHistory] = useState<TransferRecord[]>([])
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

  // Função para iniciar processo de internação
  const handleAdmissionRequest = (bedId: number) => {
    setSelectedBedForAdmission(bedId)
    setShowAdmissionModal(true)
  }

  // Função para iniciar transferência
  const handleTransferRequest = (bed: Bed) => {
    setSelectedBed(bed)
    setShowTransferModal(true)
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

    const dischargeRecord: DischargeRecord = {
      patient: selectedBed.patient!,
      diagnosis: selectedBed.diagnosis!,
      bedId: selectedBed.id,
      dischargeDate: dischargeDetails.date,
      dischargeTime: dischargeDetails.time,
      reason: dischargeDetails.reason,
      registeredAt: new Date().toLocaleString("pt-BR"),
    }

    setDischargeHistory([...dischargeHistory, dischargeRecord])

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
              allergies: undefined,
              origin: undefined,
              emergencyContact: undefined,
              contactPhone: undefined,
            }
          : bed,
      ),
    )

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

  // Função para confirmar transferência
  const handleConfirmTransfer = () => {
    if (!selectedBed || !transferDetails.toBed || !transferDetails.reason) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const toBedId = Number.parseInt(transferDetails.toBed)
    const toBed = beds.find((bed) => bed.id === toBedId)

    if (!toBed || toBed.status !== "empty") {
      toast({
        title: "Leito indisponível",
        description: "O leito de destino não está disponível.",
        variant: "destructive",
      })
      return
    }

    const transferRecord: TransferRecord = {
      patient: selectedBed.patient!,
      fromBed: selectedBed.id,
      toBed: toBedId,
      reason: transferDetails.reason,
      transferDate: new Date().toLocaleString("pt-BR"),
      registeredAt: new Date().toLocaleString("pt-BR"),
    }

    setTransferHistory([...transferHistory, transferRecord])

    // Mover paciente para o novo leito
    setBeds(
      beds.map((bed) => {
        if (bed.id === selectedBed.id) {
          // Limpar leito de origem
          return {
            ...bed,
            patient: null,
            diagnosis: null,
            status: "cleaning" as BedStatus,
            condition: null,
            notes: null,
            admissionDate: undefined,
            devices: undefined,
            medications: undefined,
            allergies: undefined,
            origin: undefined,
            emergencyContact: undefined,
            contactPhone: undefined,
          }
        } else if (bed.id === toBedId) {
          // Transferir para novo leito
          return {
            ...bed,
            patient: selectedBed.patient,
            diagnosis: selectedBed.diagnosis,
            status: "occupied" as BedStatus,
            condition: selectedBed.condition,
            notes: selectedBed.notes,
            admissionDate: selectedBed.admissionDate,
            devices: selectedBed.devices,
            medications: selectedBed.medications,
            allergies: selectedBed.allergies,
            origin: selectedBed.origin,
            emergencyContact: selectedBed.emergencyContact,
            contactPhone: selectedBed.contactPhone,
          }
        }
        return bed
      }),
    )

    logAuditEvent({
      action: "patient_transfer",
      user: loggedUser,
      data: {
        patient: selectedBed.patient,
        fromBed: selectedBed.id,
        toBed: toBedId,
        reason: transferDetails.reason,
        timestamp: new Date().toISOString(),
      },
    })

    setShowTransferModal(false)
    setSelectedBed(null)
    setTransferDetails({ toBed: "", reason: "" })

    toast({
      title: "Transferência realizada",
      description: `${selectedBed.patient} foi transferido do leito ${selectedBed.id} para o leito ${toBedId}.`,
    })
  }

  // Função para processar internação
  const handlePatientAdmission = (patientData: any) => {
    setBeds(beds.map((bed) => (bed.id === selectedBedForAdmission ? patientData : bed)))
    setShowAdmissionModal(false)
    setSelectedBedForAdmission(null)
  }

  // Função para gerar relatório
  const handleGenerateReport = () => {
    const occupiedBeds = beds.filter((bed) => bed.status === "occupied")
    const reportData = {
      date: new Date().toLocaleString("pt-BR"),
      totalBeds: beds.length,
      occupiedBeds: occupiedBeds.length,
      emptyBeds: beds.filter((bed) => bed.status === "empty").length,
      criticalPatients: occupiedBeds.filter((bed) => bed.condition === "critical").length,
      patients: occupiedBeds.map((bed) => ({
        bed: bed.id,
        patient: bed.patient,
        diagnosis: bed.diagnosis,
        condition: bed.condition,
        admissionDate: bed.admissionDate,
      })),
    }

    logAuditEvent({
      action: "generate_handover_report",
      user: loggedUser,
      data: { reportData, timestamp: new Date().toISOString() },
    })

    toast({
      title: "Relatório gerado",
      description: "Relatório de passagem de plantão foi gerado com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Passagem de Plantão UTI</h1>
          <p className="text-slate-600">Gestão Completa de 10 Leitos</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {beds.filter((bed) => bed.status === "occupied").length}
            </div>
            <div className="text-sm text-slate-600">Ocupados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {beds.filter((bed) => bed.status === "empty").length}
            </div>
            <div className="text-sm text-slate-600">Vagos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {beds.filter((bed) => bed.condition === "critical").length}
            </div>
            <div className="text-sm text-slate-600">Críticos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {beds.filter((bed) => bed.status === "cleaning").length}
            </div>
            <div className="text-sm text-slate-600">Limpeza</div>
          </CardContent>
        </Card>
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

                    {bed.origin && (
                      <div className="text-xs text-slate-600">
                        <strong>Origem:</strong> {bed.origin}
                      </div>
                    )}

                    {bed.devices && (
                      <div className="text-xs text-slate-600">
                        <strong>Dispositivos:</strong> {bed.devices}
                      </div>
                    )}

                    {bed.allergies && (
                      <div className="text-xs text-red-600">
                        <strong>Alergias:</strong> {bed.allergies}
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

                  {/* Botões de Ação */}
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => handleTransferRequest(bed)} variant="outline" size="sm" className="flex-1">
                      <ArrowRightLeft className="h-4 w-4 mr-1" />
                      Transferir
                    </Button>
                    <Button
                      onClick={() => handleDischargeRequest(bed)}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Alta
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-50 text-slate-400" />
                  <p className="text-sm text-slate-400 mb-4">Leito Disponível</p>
                  <Button onClick={() => handleAdmissionRequest(bed.id)} variant="outline" size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Internar Paciente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modais */}
      <PatientAdmissionDialog
        open={showAdmissionModal}
        onOpenChange={setShowAdmissionModal}
        bedId={selectedBedForAdmission || 0}
        onAdmit={handlePatientAdmission}
      />

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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDischargeModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmDischarge}>Confirmar Alta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Transferência */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transferir Paciente</DialogTitle>
            <DialogDescription>
              {selectedBed?.patient} - Leito {selectedBed?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Leito de Destino *</label>
              <Select
                value={transferDetails.toBed}
                onValueChange={(value) =>
                  setTransferDetails({
                    ...transferDetails,
                    toBed: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o leito" />
                </SelectTrigger>
                <SelectContent>
                  {beds
                    .filter((bed) => bed.status === "empty" && bed.id !== selectedBed?.id)
                    .map((bed) => (
                      <SelectItem key={bed.id} value={bed.id.toString()}>
                        Leito {bed.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da Transferência *</label>
              <Select
                value={transferDetails.reason}
                onValueChange={(value) =>
                  setTransferDetails({
                    ...transferDetails,
                    reason: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="isolamento">Necessidade de Isolamento</SelectItem>
                  <SelectItem value="equipamento">Equipamento Específico</SelectItem>
                  <SelectItem value="manutencao">Manutenção do Leito</SelectItem>
                  <SelectItem value="organizacao">Organização da UTI</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmTransfer}>Confirmar Transferência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Históricos */}
      {(dischargeHistory.length > 0 || transferHistory.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Histórico de Altas */}
          {dischargeHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Altas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dischargeHistory
                    .slice(-3)
                    .reverse()
                    .map((record, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-lg border-l-4 border-green-500">
                        <div className="text-sm">
                          <div>
                            <strong>Paciente:</strong> {record.patient}
                          </div>
                          <div>
                            <strong>Leito:</strong> {record.bedId}
                          </div>
                          <div>
                            <strong>Motivo:</strong> {record.reason}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{record.registeredAt}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Transferências */}
          {transferHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Transferências Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transferHistory
                    .slice(-3)
                    .reverse()
                    .map((record, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <div className="text-sm">
                          <div>
                            <strong>Paciente:</strong> {record.patient}
                          </div>
                          <div>
                            <strong>De:</strong> Leito {record.fromBed} <strong>Para:</strong> Leito {record.toBed}
                          </div>
                          <div>
                            <strong>Motivo:</strong> {record.reason}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{record.registeredAt}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
