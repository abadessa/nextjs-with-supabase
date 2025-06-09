"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, FileText, User, AlertTriangle, Stethoscope, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { logAuditEvent } from "@/components/lgpd-audit"
import { PrintPatientCard } from "@/components/print-patient-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Cookies from "js-cookie"

// Dados simulados dos pacientes (normalmente viriam de uma API/banco de dados)
const patientsData = [
  {
    id: "5001",
    name: "LUCI APARECIDA MORALES DI BERT, 66a",
    diagnosis:
      "Novo Choque Séptico D:08/06 / Choque Misto Revertido / DRC Dialítica / FAARV / Mieloma Múltiplo descartado",
    admittedFrom: "UPA III LAPA (D:20/05) / DIH:21/05",
    saps3: "SAPS3: 76 | 67,5%",
    pendingIssues: [
      "Aguarda culturas HMC D:09/06",
      "Vigilância hematoma coxa E (500ml)",
      "HD conforme demanda Nefro",
      "Avaliação Hematologia HC",
    ],
    exams: [
      "US partes moles 06/06: hematoma 500ml (↓ de 750ml)",
      "Hemotransfusão 1CH D:09/06 (HB 6,8)",
      "HMC 09/06: aguardando resultado",
      "Staphylococcus capitis 28/05 (contaminação)",
    ],
    goals: [
      "Vigilância infecciosa - Mero + Teico D:09/06",
      "Dieta mista pastosa + enteral 20ml/h",
      "Desmame O2 conforme tolerância",
      "HD conforme programação",
      "Mantido sem HNF devido hematoma",
    ],
    status: "critical",
    devices: "PICC, AVC, Permcath, VM 24%",
    medications: "Noradrenalina 4ml/h, Gabapentina 300mg 12/12h, Amitriptilina 25mg/dia, Duloxetina 30mg/dia",
    allergies: "Nimesulida",
    antibiotics: [
      {
        name: "MEROPENEM + TEICOPLANINA",
        startDate: "2025-06-09",
        daysInUse: 1,
        indication: "Novo choque séptico",
      },
    ],
  },
  // Outros pacientes...
]

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loggedUser, setLoggedUser] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Verificar autenticação
    const authToken = Cookies.get("auth_token")
    const userEmail = Cookies.get("user_email")

    if (!authToken) {
      router.push("/login")
      return
    }

    if (userEmail) {
      setLoggedUser(userEmail)
    }

    // Buscar dados do paciente (simulado)
    const foundPatient = patientsData.find((p) => p.id === params.id)

    if (foundPatient) {
      setPatient(foundPatient)

      // Log de auditoria
      logAuditEvent({
        action: "view_patient_details",
        user: userEmail || "unknown",
        data: {
          patientId: params.id,
          timestamp: new Date().toISOString(),
        },
      })
    }

    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p>Carregando dados do paciente...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Paciente não encontrado</h2>
              <p className="text-gray-500">Não foi possível encontrar os dados do paciente com ID {params.id}.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "stable":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Crítico"
      case "stable":
        return "Estável"
      default:
        return "Internado"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          {/* Botão de Impressão */}
          <PrintPatientCard patient={patient} loggedUser={loggedUser} />
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(patient.status)}>{getStatusText(patient.status)}</Badge>
          <span className="text-sm text-gray-500">Última atualização: {new Date().toLocaleString("pt-BR")}</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {patient.id}
                </div>
                <CardTitle className="text-xl">Leito {patient.id}</CardTitle>
              </div>
              <p className="text-lg font-semibold mt-1">{patient.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="exams">Exames</TabsTrigger>
              <TabsTrigger value="medications">Medicações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <Stethoscope className="h-4 w-4" /> Diagnóstico
                    </h3>
                    <p className="text-sm">{patient.diagnosis}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" /> Origem
                    </h3>
                    <p className="text-sm">{patient.admittedFrom}</p>
                  </div>

                  {patient.saps3 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4" /> SAPS 3
                      </h3>
                      <p className="text-sm">{patient.saps3}</p>
                    </div>
                  )}

                  {patient.devices && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">Dispositivos</h3>
                      <p className="text-sm">{patient.devices}</p>
                    </div>
                  )}

                  {patient.allergies && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">Alergias</h3>
                      <p className="text-sm font-medium text-red-600">{patient.allergies}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4" /> Pendências
                    </h3>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {patient.pendingIssues.map((issue: string, i: number) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" /> Metas
                    </h3>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {patient.goals.map((goal: string, i: number) => (
                        <li key={i}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exams">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Resultados de Exames</h3>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {patient.exams.map((exam: string, i: number) => (
                    <li key={i}>{exam}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="medications">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Medicações</h3>
                  <p className="text-sm">{patient.medications}</p>
                </div>

                {patient.antibiotics && patient.antibiotics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Antibióticos</h3>
                    <ul className="text-sm space-y-2">
                      {patient.antibiotics.map((atb: any, i: number) => (
                        <li key={i} className="border-l-2 border-blue-500 pl-3 py-1">
                          <div className="font-medium">{atb.name}</div>
                          <div className="text-xs text-gray-600">
                            Início: {new Date(atb.startDate).toLocaleDateString("pt-BR")} • Dias: {atb.daysInUse}
                            {atb.indication && <span> • Indicação: {atb.indication}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500">Histórico do Paciente</h3>
                <div className="text-sm text-gray-500">
                  <p>Histórico detalhado não disponível.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 flex items-center gap-1 mt-8">
        <Clock className="h-3 w-3" />
        <span>
          Visualizado por {loggedUser} em {new Date().toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  )
}
