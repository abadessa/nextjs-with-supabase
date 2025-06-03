"use client"

import React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { BedStatus } from "@/components/bed-status"
import { ArrowLeft, Shield, Save, Clock, FileText, Calendar, User, Pill } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { logAuditEvent } from "@/components/lgpd-audit"

// Tipo para antibióticos com dias de uso
type Antibiotic = {
  name: string
  startDate: string
  daysInUse: number
  dose?: string
  frequency?: string
  pendingLabs?: string[]
}

export default function PatientDetail() {
  const params = useParams()
  const router = useRouter()
  const patientId = Number(params.id)

  // Buscar dados do paciente baseado no ID real
  const findPatientData = (id: string) => {
    const patients = {
      "5001": {
        id: "5001",
        name: "Luci Aparecida Morales Di Bert",
        age: 66,
        gender: "Feminino",
        diagnosis: "Choque séptico (Foco A/E) / Hipovolêmico, Hematoma extenso em raiz de coxa, FAARV, DRC Dialítica",
        admittedFrom: "UPA III LAPA",
        admissionDate: "2025-05-21",
        pendingIssues: [
          "Reinserida na CROSS para hematologia por alterações em hemograma",
          "Aguarda ecocardiograma",
          "Checo eletroforese e imunofixação de proteínas",
          "Checo vancocinemia do dia 31/05 de 27",
          "Nova vancocinemia em 24h",
        ],
        exams: [
          "US de abdome total 29/05: pâncreas heterogêneo/esteatose hepática grau1",
          "Hematoma de grande volume em início de coxa E em 23/05",
          "Alteração TGO/TGP-> USG abd: esteatose hepatica e pancreas heterogeneo",
        ],
        goals: [
          "Reposição de K EV",
          "Iniciado amiodarona VO",
          "Desmame de DVA conforme tolerância",
          "HD conforme demanda da Nefrologia - Última 29/05 nova HD 4h com UF 1400ml",
          "Mantido sem HNF devido hematoma com repercussão hematimetrica",
        ],
        status: "critical",
        vitalSigns: {
          temperature: "36.8°C",
          heartRate: "88 bpm",
          bloodPressure: "120/75 mmHg",
          respiratoryRate: "18 irpm",
          saturation: "96% (AA)",
        },
        medications: [
          "SEM DVA - NORADRENALINA DESLIGADA 12 HORAS 29/05",
          "AMIODARONA DESLIGADA 9 HORAS 29/05",
          "Amiodarona VO",
        ],
        devices: "PICC MSD, PERMICATH VSCD, SVD, SNE",
        antibiotics: [
          {
            name: "MEROPENEM",
            startDate: "2025-05-24",
            daysInUse: 7,
            dose: "1g",
            frequency: "8/8h",
          },
          {
            name: "VANCOMICINA",
            startDate: "2025-05-21",
            daysInUse: 10,
            dose: "1g",
            frequency: "12/12h",
            pendingLabs: ["Vancocinemia 31/05", "Nova vancocinemia em 24h"],
          },
          {
            name: "FLUCONAZOL",
            startDate: "2025-05-27",
            daysInUse: 4,
            dose: "400mg",
            frequency: "24/24h",
          },
        ],
        notes:
          "Paciente com bicitopenia de Hb e plaquetas, além de leucocitose mesmo PCR em queda. Médico sobrinho da familia (Dr Fabio) não concorda com proporcionalidade de cuidado, filhas mostram-se angustiadas sobre não IOT e em nova conversa definido por manter medidas invasivas que forem necessárias, inclusive IOT, caso necessite.",
      },
      "5002": {
        id: "5002",
        name: "Maria Aparecida da Silva",
        age: 71,
        gender: "Feminino",
        diagnosis: "DPOC exacerbado, Insuficiência respiratória + RNC, PO TQT D:21/05",
        admittedFrom: "UPA Rio Pequeno",
        admissionDate: "2025-05-08",
        pendingIssues: [
          "Suspendo clonazepam, avaliar sonolência",
          "Avaliar hieróxia em gaso como causador adjacente",
          "Aguarda CST D:29/05",
        ],
        exams: [
          "TC DE CRANIO(NDN) + TORÁX (BRONCOPATIA INFLAMATORIA) 12/05",
          "ANISOCORIA E>D-->TC DE CRANIO DE URGENCIA -->NDN + MELHORA DA ANISOCORIA",
        ],
        goals: [
          "Cuidados com TQT D:21/05",
          "BD com espaçador",
          "Se Broncoespasmo, aumentar Beclometasona 2 jt 8/8h",
          "Desmame de VM conforme tolerancia",
        ],
        status: "stable",
        vitalSigns: {
          temperature: "36.5°C",
          heartRate: "92 bpm",
          bloodPressure: "130/80 mmHg",
          respiratoryRate: "20 irpm",
          saturation: "95% (VM)",
        },
        medications: ["Precedex 3ml/h"],
        devices: "TRAQUEOSTOMIA -TOT 21/05, SVD 18/05, PICC EM MSD 15/05, SNE repassada 26/05",
        antibiotics: [
          {
            name: "PIPERACILINA/TAZOBACTAM",
            startDate: "2025-05-28",
            daysInUse: 3,
            dose: "4.5g",
            frequency: "6/6h",
            pendingLabs: [],
          },
        ],
        notes: "Tabagista. IOT 12/05 COM EOT 17/05 AS 15:30, reintubação 18/05 21:30. PO TQT D:21/05.",
      },
      "5003": {
        id: "5003",
        name: "M.S.M.P., 61a",
        diagnosis: "PO colectomia + ureteroplastia",
        admittedFrom: "Centro Cirúrgico",
        admissionDate: "2025-05-29",
        pendingIssues: ["Seguimento CG", "Vigilância hematúria", "NPT"],
        exams: ["Hb 10→7, transfusão 2CH + 4plasma"],
        goals: ["Jejum + NPT", "Hidratação", "ATB vigente"],
        status: "stable",
        vitalSigns: {
          temperature: "36.5°C",
          heartRate: "88 bpm",
          bloodPressure: "110/70 mmHg",
          respiratoryRate: "16 irpm",
          saturation: "98% (AA)",
        },
        medications: [],
        devices: "SVD 3 vias + AVP",
        antibiotics: [
          {
            name: "CEFTRIAXONA",
            startDate: "2025-05-29",
            daysInUse: 2,
            dose: "2g",
            frequency: "24/24h",
          },
          {
            name: "METRONIDAZOL",
            startDate: "2025-05-29",
            daysInUse: 2,
            dose: "500mg",
            frequency: "8/8h",
          },
        ],
        notes: "Paciente em PO de colectomia + ureteroplastia, estável hemodinamicamente.",
      },
      "5004": {
        id: "5004",
        name: "I.C.M.S., 42a",
        diagnosis: "PO drenagem abscesso + histerectomia",
        admittedFrom: "CCGO",
        admissionDate: "2025-05-26",
        pendingIssues: ["Cultura secreção 29/05", "Controle febril", "Vancocinemia 31/05"],
        exams: ["USG parede: coleção 17ml"],
        goals: ["Analgesia otimizada", "Vigilância infecciosa", "Não sacar SVD"],
        status: "critical",
        vitalSigns: {
          temperature: "37.8°C",
          heartRate: "102 bpm",
          bloodPressure: "125/85 mmHg",
          respiratoryRate: "20 irpm",
          saturation: "96% (AA)",
        },
        medications: ["Ketamina 4mL/h"],
        devices: "SVD + AVP",
        antibiotics: [
          {
            name: "MEROPENEM",
            startDate: "2025-05-26",
            daysInUse: 5,
            dose: "1g",
            frequency: "8/8h",
          },
          {
            name: "VANCOMICINA",
            startDate: "2025-05-26",
            daysInUse: 5,
            dose: "1g",
            frequency: "12/12h",
            pendingLabs: ["Vancocinemia 31/05"],
          },
        ],
        notes: "Paciente em PO de drenagem de abscesso + histerectomia, mantendo picos febris.",
      },
      // Adicionar outros pacientes conforme necessário
    }

    return (
      patients[id] || {
        id: id,
        name: "Paciente não encontrado",
        age: 0,
        gender: "Não informado",
        diagnosis: "Não informado",
        admittedFrom: "Não informado",
        admissionDate: new Date().toISOString().split("T")[0],
        pendingIssues: [],
        exams: [],
        goals: [],
        status: "stable",
        vitalSigns: {
          temperature: "36.5°C",
          heartRate: "80 bpm",
          bloodPressure: "120/80 mmHg",
          respiratoryRate: "16 irpm",
          saturation: "98% (AA)",
        },
        medications: [],
        devices: "",
        antibiotics: [],
        notes: "Dados não disponíveis",
      }
    )
  }

  const patient = findPatientData(patientId.toString())

  const [patientData, setPatientData] = useState(patient)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Aqui seria implementada a lógica para salvar os dados
    setIsEditing(false)

    // Registrar auditoria
    logAuditEvent({
      action: "update_patient",
      user: "hpmduti@gmail.com",
      data: { patientId: patientData.id },
    })

    // Simulação de salvamento bem-sucedido
    alert("Dados do paciente atualizados com sucesso!")
  }

  // Calcular a data atual para exibir os dias de uso dos antibióticos
  const calculateDaysInUse = (startDate: string) => {
    const start = new Date(startDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Registrar visualização do paciente para auditoria LGPD
  React.useEffect(() => {
    logAuditEvent({
      action: "view_patient",
      user: "hpmduti@gmail.com",
      data: { patientId: patientData.id },
    })
  }, [patientData.id])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-green-600" />
            <span>UTI Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="container py-6 px-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                Leito {patientData.id} - {patientData.name}
              </h1>
              <BedStatus status={patientData.status} />
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Editar Informações</Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Informações do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Nome:</p>
                      {isEditing ? (
                        <Input
                          value={patientData.name}
                          onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">{patientData.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Idade / Gênero:</p>
                      <p className="text-sm text-gray-500">
                        {patientData.age} anos / {patientData.gender}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Diagnóstico:</p>
                      {isEditing ? (
                        <Input
                          value={patientData.diagnosis}
                          onChange={(e) => setPatientData({ ...patientData, diagnosis: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">{patientData.diagnosis}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Admitido de:</p>
                      {isEditing ? (
                        <Input
                          value={patientData.admittedFrom}
                          onChange={(e) => setPatientData({ ...patientData, admittedFrom: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">{patientData.admittedFrom}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Data de Admissão:</p>
                      <p className="text-sm text-gray-500">
                        {new Date(patientData.admissionDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sinais Vitais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs font-medium text-gray-500">Temperatura</p>
                    <p className="text-lg font-semibold">{patientData.vitalSigns.temperature}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs font-medium text-gray-500">FC</p>
                    <p className="text-lg font-semibold">{patientData.vitalSigns.heartRate}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs font-medium text-gray-500">PA</p>
                    <p className="text-lg font-semibold">{patientData.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs font-medium text-gray-500">FR</p>
                    <p className="text-lg font-semibold">{patientData.vitalSigns.respiratoryRate}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-3 text-center">
                    <p className="text-xs font-medium text-gray-500">SpO2</p>
                    <p className="text-lg font-semibold">{patientData.vitalSigns.saturation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nova seção de Antibióticos */}
          <div className="mt-6">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  Antibióticos e Antimicrobianos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {patientData.antibiotics && patientData.antibiotics.length > 0 ? (
                  <div className="space-y-4">
                    {patientData.antibiotics.map((antibiotic, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Nome do Antibiótico
                                </label>
                                <Input
                                  value={antibiotic.name}
                                  onChange={(e) => {
                                    const newAntibiotics = [...patientData.antibiotics]
                                    newAntibiotics[index] = { ...newAntibiotics[index], name: e.target.value }
                                    setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                  }}
                                  className="mt-1"
                                  placeholder="Ex: MEROPENEM"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Data de Início
                                </label>
                                <Input
                                  type="date"
                                  value={antibiotic.startDate}
                                  onChange={(e) => {
                                    const newAntibiotics = [...patientData.antibiotics]
                                    newAntibiotics[index] = { ...newAntibiotics[index], startDate: e.target.value }
                                    setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Dose
                                </label>
                                <Input
                                  value={antibiotic.dose || ""}
                                  onChange={(e) => {
                                    const newAntibiotics = [...patientData.antibiotics]
                                    newAntibiotics[index] = { ...newAntibiotics[index], dose: e.target.value }
                                    setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                  }}
                                  className="mt-1"
                                  placeholder="Ex: 1g"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Frequência
                                </label>
                                <Input
                                  value={antibiotic.frequency || ""}
                                  onChange={(e) => {
                                    const newAntibiotics = [...patientData.antibiotics]
                                    newAntibiotics[index] = { ...newAntibiotics[index], frequency: e.target.value }
                                    setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                  }}
                                  className="mt-1"
                                  placeholder="Ex: 8/8h"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  Dias de Uso
                                </label>
                                <Input
                                  type="number"
                                  value={antibiotic.daysInUse}
                                  onChange={(e) => {
                                    const newAntibiotics = [...patientData.antibiotics]
                                    newAntibiotics[index] = {
                                      ...newAntibiotics[index],
                                      daysInUse: Number.parseInt(e.target.value) || 0,
                                    }
                                    setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                  }}
                                  className="mt-1"
                                  min="0"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                Exames Pendentes (separados por vírgula)
                              </label>
                              <Input
                                value={antibiotic.pendingLabs?.join(", ") || ""}
                                onChange={(e) => {
                                  const newAntibiotics = [...patientData.antibiotics]
                                  const labs = e.target.value
                                    .split(",")
                                    .map((lab) => lab.trim())
                                    .filter((lab) => lab.length > 0)
                                  newAntibiotics[index] = { ...newAntibiotics[index], pendingLabs: labs }
                                  setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                }}
                                className="mt-1"
                                placeholder="Ex: Vancocinemia 31/05, Nova vancocinemia em 24h"
                              />
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newAntibiotics = patientData.antibiotics.filter((_, i) => i !== index)
                                  setPatientData({ ...patientData, antibiotics: newAntibiotics })
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Remover Antibiótico
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-600">{antibiotic.name}</Badge>
                                <span className="text-sm font-medium">
                                  D{antibiotic.daysInUse} ({new Date(antibiotic.startDate).toLocaleDateString("pt-BR")})
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {antibiotic.dose} {antibiotic.frequency}
                              </div>
                            </div>

                            {antibiotic.pendingLabs && antibiotic.pendingLabs.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-amber-700 mb-1">Pendências:</p>
                                <div className="flex flex-wrap gap-1">
                                  {antibiotic.pendingLabs.map((lab, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs border-amber-200 text-amber-700 bg-amber-50"
                                    >
                                      {lab}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newAntibiotic = {
                            name: "",
                            startDate: new Date().toISOString().split("T")[0],
                            daysInUse: 1,
                            dose: "",
                            frequency: "",
                            pendingLabs: [],
                          }
                          setPatientData({
                            ...patientData,
                            antibiotics: [...patientData.antibiotics, newAntibiotic],
                          })
                        }}
                        className="w-full"
                      >
                        <Pill className="mr-2 h-4 w-4" />
                        Adicionar Antibiótico
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 italic mb-4">Sem antibióticos prescritos</p>
                    {isEditing && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newAntibiotic = {
                            name: "",
                            startDate: new Date().toISOString().split("T")[0],
                            daysInUse: 1,
                            dose: "",
                            frequency: "",
                            pendingLabs: [],
                          }
                          setPatientData({
                            ...patientData,
                            antibiotics: [newAntibiotic],
                          })
                        }}
                      >
                        <Pill className="mr-2 h-4 w-4" />
                        Adicionar Primeiro Antibiótico
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pendências</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {patientData.pendingIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={issue}
                          onChange={(e) => {
                            const newIssues = [...patientData.pendingIssues]
                            newIssues[index] = e.target.value
                            setPatientData({ ...patientData, pendingIssues: newIssues })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newIssues = patientData.pendingIssues.filter((_, i) => i !== index)
                            setPatientData({ ...patientData, pendingIssues: newIssues })
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPatientData({
                          ...patientData,
                          pendingIssues: [...patientData.pendingIssues, ""],
                        })
                      }}
                    >
                      Adicionar Pendência
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {patientData.pendingIssues.map((issue, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exames</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {patientData.exams.map((exam, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={exam}
                          onChange={(e) => {
                            const newExams = [...patientData.exams]
                            newExams[index] = e.target.value
                            setPatientData({ ...patientData, exams: newExams })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExams = patientData.exams.filter((_, i) => i !== index)
                            setPatientData({ ...patientData, exams: newExams })
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPatientData({
                          ...patientData,
                          exams: [...patientData.exams, ""],
                        })
                      }}
                    >
                      Adicionar Exame
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {patientData.exams.map((exam, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>{exam}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metas Terapêuticas em 24h</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {patientData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...patientData.goals]
                            newGoals[index] = e.target.value
                            setPatientData({ ...patientData, goals: newGoals })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newGoals = patientData.goals.filter((_, i) => i !== index)
                            setPatientData({ ...patientData, goals: newGoals })
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPatientData({
                          ...patientData,
                          goals: [...patientData.goals, ""],
                        })
                      }}
                    >
                      Adicionar Meta
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {patientData.goals.map((goal, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medicações</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {patientData.medications.map((med, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={med}
                          onChange={(e) => {
                            const newMeds = [...patientData.medications]
                            newMeds[index] = e.target.value
                            setPatientData({ ...patientData, medications: newMeds })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newMeds = patientData.medications.filter((_, i) => i !== index)
                            setPatientData({ ...patientData, medications: newMeds })
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPatientData({
                          ...patientData,
                          medications: [...patientData.medications, ""],
                        })
                      }}
                    >
                      Adicionar Medicação
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {patientData.medications.map((med, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span>{med}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={patientData.notes}
                    onChange={(e) => setPatientData({ ...patientData, notes: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm">{patientData.notes}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-2 py-4 px-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} UTI Manager. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-500">Em conformidade com a Lei Geral de Proteção de Dados (LGPD)</p>
        </div>
      </footer>
    </div>
  )
}
