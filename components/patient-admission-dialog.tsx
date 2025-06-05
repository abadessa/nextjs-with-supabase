"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/components/lgpd-audit"
import { UserPlus, AlertTriangle } from "lucide-react"

interface PatientAdmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bedId: number
  onAdmit: (patientData: any) => void
}

export function PatientAdmissionDialog({ open, onOpenChange, bedId, onAdmit }: PatientAdmissionDialogProps) {
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    gender: "",
    diagnosis: "",
    origin: "",
    admissionDate: new Date().toISOString().split("T")[0],
    admissionTime: new Date().toTimeString().slice(0, 5),
    condition: "",
    devices: "",
    medications: "",
    allergies: "",
    notes: "",
    emergencyContact: "",
    contactPhone: "",
  })

  const [loggedUser] = useState("hpmduti@gmail.com")

  const handleAdmit = () => {
    // Validações básicas
    if (!patientData.name || !patientData.diagnosis || !patientData.condition) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha os campos obrigatórios: Nome, Diagnóstico e Condição.",
        variant: "destructive",
      })
      return
    }

    // Criar objeto do paciente
    const newPatient = {
      id: bedId,
      patient: `${patientData.name}, ${patientData.age}a`,
      diagnosis: patientData.diagnosis,
      status: "occupied",
      condition: patientData.condition,
      notes: patientData.notes,
      admissionDate: patientData.admissionDate,
      devices: patientData.devices,
      medications: patientData.medications,
      allergies: patientData.allergies,
      origin: patientData.origin,
      emergencyContact: patientData.emergencyContact,
      contactPhone: patientData.contactPhone,
    }

    // Log da auditoria
    logAuditEvent({
      action: "patient_admission",
      user: loggedUser,
      data: {
        bedId,
        patientName: patientData.name,
        diagnosis: patientData.diagnosis,
        timestamp: new Date().toISOString(),
      },
    })

    onAdmit(newPatient)

    toast({
      title: "Paciente internado",
      description: `${patientData.name} foi internado no leito ${bedId} com sucesso.`,
    })

    // Reset form
    setPatientData({
      name: "",
      age: "",
      gender: "",
      diagnosis: "",
      origin: "",
      admissionDate: new Date().toISOString().split("T")[0],
      admissionTime: new Date().toTimeString().slice(0, 5),
      condition: "",
      devices: "",
      medications: "",
      allergies: "",
      notes: "",
      emergencyContact: "",
      contactPhone: "",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Internação de Paciente - Leito {bedId}
          </DialogTitle>
          <DialogDescription>Preencha os dados do paciente para internação na UTI</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Dados Pessoais</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  placeholder="Nome completo do paciente"
                />
              </div>

              <div>
                <Label htmlFor="age">Idade *</Label>
                <Input
                  id="age"
                  type="number"
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                  placeholder="Idade"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={patientData.gender}
                  onValueChange={(value) => setPatientData({ ...patientData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="origin">Origem *</Label>
                <Input
                  id="origin"
                  value={patientData.origin}
                  onChange={(e) => setPatientData({ ...patientData, origin: e.target.value })}
                  placeholder="Ex: PS Lapa, UPA Rio Pequeno"
                />
              </div>
            </div>
          </div>

          {/* Dados Clínicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Dados Clínicos</h3>

            <div>
              <Label htmlFor="diagnosis">Diagnóstico Principal *</Label>
              <Textarea
                id="diagnosis"
                value={patientData.diagnosis}
                onChange={(e) => setPatientData({ ...patientData, diagnosis: e.target.value })}
                placeholder="Diagnóstico principal e comorbidades"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Condição Clínica *</Label>
                <Select
                  value={patientData.condition}
                  onValueChange={(value) => setPatientData({ ...patientData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Crítico 🔴</SelectItem>
                    <SelectItem value="attention">Atenção 🟡</SelectItem>
                    <SelectItem value="stable">Estável 🟢</SelectItem>
                    <SelectItem value="observation">Observação 🔵</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allergies">Alergias</Label>
                <Input
                  id="allergies"
                  value={patientData.allergies}
                  onChange={(e) => setPatientData({ ...patientData, allergies: e.target.value })}
                  placeholder="Ex: Dipirona, Nimesulida"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="devices">Dispositivos</Label>
                <Input
                  id="devices"
                  value={patientData.devices}
                  onChange={(e) => setPatientData({ ...patientData, devices: e.target.value })}
                  placeholder="Ex: PICC, SVD, TQT"
                />
              </div>

              <div>
                <Label htmlFor="medications">Medicações</Label>
                <Input
                  id="medications"
                  value={patientData.medications}
                  onChange={(e) => setPatientData({ ...patientData, medications: e.target.value })}
                  placeholder="Medicações em uso"
                />
              </div>
            </div>
          </div>

          {/* Dados de Internação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Dados de Internação</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admissionDate">Data de Internação</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={patientData.admissionDate}
                  onChange={(e) => setPatientData({ ...patientData, admissionDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="admissionTime">Hora de Internação</Label>
                <Input
                  id="admissionTime"
                  type="time"
                  value={patientData.admissionTime}
                  onChange={(e) => setPatientData({ ...patientData, admissionTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                <Input
                  id="emergencyContact"
                  value={patientData.emergencyContact}
                  onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Telefone</Label>
                <Input
                  id="contactPhone"
                  value={patientData.contactPhone}
                  onChange={(e) => setPatientData({ ...patientData, contactPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={patientData.notes}
                onChange={(e) => setPatientData({ ...patientData, notes: e.target.value })}
                placeholder="Observações importantes sobre o paciente"
                rows={3}
              />
            </div>
          </div>

          {/* Aviso LGPD */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Conformidade LGPD</p>
                <p>
                  Os dados pessoais sensíveis coletados são tratados exclusivamente para finalidades de assistência à
                  saúde, conforme Art. 11 da Lei 13.709/2018. Esta ação será registrada no sistema de auditoria.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAdmit}>
            <UserPlus className="h-4 w-4 mr-2" />
            Internar Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
