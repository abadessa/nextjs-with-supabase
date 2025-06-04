"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, LogOut, User, Bell, Search, RefreshCw, Pill, BarChart2, FileUp, Key, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { BedStatus } from "@/components/bed-status"
import { logAuditEvent } from "@/components/lgpd-audit"
import { FileArchive } from "lucide-react"
import Cookies from "js-cookie"
import { toast } from "@/components/ui/use-toast"
import { HandoverUpdateDialog } from "@/components/handover-update-dialog"

// Tipo para antibióticos com dias de uso
type Antibiotic = {
  name: string
  startDate: string
  daysInUse: number
  dose?: string
  frequency?: string
  pendingLabs?: string[]
}

// Tipo para estatísticas da UTI
type UTIStats = {
  period: string
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
  discharges: {
    total: number
    toWard: number
    home: number
    rate: number
  }
  deaths: {
    total: number
    rate: number
    trend: string
  }
  readmissions: {
    total: number
    within48h: number
    rate: number
    trend: string
  }
  infections: {
    bloodstream: {
      total: number
      rate: number
      trend: string
    }
    ventilatorAssociated: {
      total: number
      rate: number
    }
    catheterAssociated: {
      total: number
      rate: number
    }
  }
  qualityIndicators: {
    mortalityRate: number
    averageStay: number
    ventilatorDays: number
    catheterDays: number
  }
  antibiotics: {
    totalPatients: number
    pendingVancocinemia: number
    broadSpectrum: number
    rate: number
  }
}

// Tipo para pacientes arquivados
type ArchivedPatient = {
  id: string
  name: string
  diagnosis: string
  admittedFrom: string
  admissionDate: string
  archiveDate: string
  archiveReason: "discharge" | "death" | "transfer"
  archiveNotes: string
  antibiotics?: Antibiotic[]
  relevantInfo?: string[]
}

export default function Dashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [loggedUser, setLoggedUser] = useState("")
  const [isEditingStats, setIsEditingStats] = useState(false)
  const [showLgpdDialog, setShowLgpdDialog] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  // Estados para controlar os modais de upload
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showPatientUploadDialog, setShowPatientUploadDialog] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [uploadedFileType, setUploadedFileType] = useState<"pdf" | "excel" | "word" | "">("")
  const [selectedPatientForUpdate, setSelectedPatientForUpdate] = useState<any>(null)

  // Adicionar após os outros estados
  const [showPdfAttachDialog, setShowPdfAttachDialog] = useState(false)
  const [attachedPdfFile, setAttachedPdfFile] = useState<File | null>(null)

  // Estados para o relatório panorama
  const [showPanoramaDialog, setShowPanoramaDialog] = useState(false)
  const [panoramaData, setPanoramaData] = useState({
    reportType: "geral",
    period: "24h",
    includeCharts: true,
    includeDetails: true,
    format: "pdf",
  })

  // Estado para o novo diálogo de atualização de plantão
  const [showHandoverUpdateDialog, setShowHandoverUpdateDialog] = useState(false)

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const authToken = Cookies.get("auth_token")
    const userEmail = Cookies.get("user_email")

    if (!authToken) {
      router.push("/login")
      return
    }

    if (userEmail) {
      setLoggedUser(userEmail)
    }
  }, [router])

  // Função de logout
  const handleLogout = () => {
    logAuditEvent({
      action: "manual_logout",
      user: loggedUser,
      data: { method: "button_click" },
    })

    // Remover cookies de autenticação
    Cookies.remove("auth_token")
    Cookies.remove("user_email")

    // Redirecionar para a página de login
    router.push("/login")
  }

  // Função para atualizar os dados
  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simular atualização de dados
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Dados atualizados",
        description: `Última atualização: ${new Date().toLocaleString("pt-BR")}`,
      })
    }, 1500)
  }

  // Função para salvar a nova passagem de plantão
  const handleSaveHandover = (content: string) => {
    // Registrar no log de auditoria
    logAuditEvent({
      action: "update_handover",
      user: loggedUser,
      data: {
        timestamp: new Date().toISOString(),
        contentLength: content.length,
      },
    })

    // Aqui você processaria o conteúdo e atualizaria os dados dos leitos
    // Por exemplo, parsing do texto para extrair informações dos pacientes

    toast({
      title: "Passagem de plantão atualizada",
      description: "Os dados foram processados e salvos com sucesso.",
    })

    // Simular atualização dos dados
    handleRefresh()
  }

  // Dados reais dos leitos da UTI
  const beds = [
    {
      id: "3001",
      name: "Leito Bloqueado",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "blocked",
    },
    {
      id: "3002",
      name: "Leito Bloqueado",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "blocked",
    },
    {
      id: "4001",
      name: "Leito Bloqueado",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "blocked",
    },
    {
      id: "4002",
      name: "Leito Bloqueado",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "blocked",
    },
    {
      id: "5001",
      name: "LUCI APARECIDA MORALES DI BERT, 66a",
      diagnosis:
        "Choque séptico (Foco A/E - hematoma coxa E infectado) / Hipovolêmico melhorado / FAARV revertida / DRC Dialítica / Mieloma Múltiplo em investigação",
      admittedFrom: "UPA III LAPA (D:20/05) / DIH:21/05",
      saps3: "SAPS3: 76 | 67,5%",
      pendingIssues: [
        "Avaliação CIR. GERAL p/ drenagem hematoma/coleção",
        "Recoleta vancocinemia 04/06",
        "Hemodiálise conforme programação nefro",
      ],
      exams: [
        "USG partes moles: coleção 999,6ml hematoma coxa E",
        "Hb 8,3, Ht 27,9, Leuco 16620, PLQ 83.000",
        "KAPPA 95,29 / LAMBDA 130,58 / DHL:811 / CEA:10,7",
        "HMC 21/05, 28/05: negativas",
      ],
      goals: [
        "Vigilância infecciosa",
        "Dieta pastosa + enteral 20ml/hr",
        "Mantido ATB em curso (Vanco suspensa)",
        "Vigilância hematoma MIE",
      ],
      status: "critical",
      devices: "PICC, AVC, Permcath",
      medications: "Gabapentina 300mg 12/12h, Amitriptilina 25mg/dia, Duloxetina 30mg/dia",
      allergies: "Nimesulida",
      antibiotics: [
        {
          name: "VANCOMICINA",
          startDate: "2025-05-21",
          daysInUse: 14,
          status: "suspensa",
          pendingLabs: ["Vancocinemia 04/06 - nível 27,83"],
        },
        {
          name: "MEROPENEM",
          startDate: "2025-05-24",
          daysInUse: 11,
          duration: "10 dias",
        },
        {
          name: "FLUCONAZOL",
          startDate: "2025-05-27",
          daysInUse: 8,
          duration: "7 dias",
        },
      ],
    },
    {
      id: "5002",
      name: "MARIA APARECIDA DA SILVA, 71a",
      diagnosis: "DPOC exacerbado / PO TQT D:21/05 / Ins resp + RNC / Tabagista",
      admittedFrom: "UPA Rio Pequeno (08/05/2025)",
      pendingIssues: [
        "CST D:29/05 gram negativo em identificação",
        "Clostridium coletado 03/06",
        "Desmame lento VM conforme tolerância",
      ],
      exams: [
        "TC crânio + tórax 12/05: broncopatia inflamatória",
        "Hb 8,1, Ht 26,2, Leuco 2460, PLQ 145.000",
        "Gasometria: pH 7,44, pO2 55, SpO2 89%",
        "TGO 41, TGP 173 (em queda), PCR 4",
      ],
      goals: ["Cuidados TQT D:21/05", "BD com espaçador", "Desmame lento e gradual VM", "Quetiapina 25mg 12/12h"],
      status: "stable",
      devices: "TQT, SVD, PICC MSD, SNE repassada 26/05",
      medications: "Quetiapina 25mg 12/12h, Beclometasona 2jt 8/8h se broncoespasmo",
      antibiotics: [
        {
          name: "TAZOCIN",
          startDate: "2025-05-28",
          daysInUse: 7,
          indication: "Subfebril + piora secreção TQT",
        },
      ],
    },
    {
      id: "5003",
      name: "MARIA SOCORRO MARQUES PEREIRA, 61a",
      diagnosis: "PO LE + COLECTOMIA DIREITA + ILEOTRANSVERSOANASTOMOSE + URETEROPLASTIA / Íleo paralítico",
      admittedFrom: "Centro Cirúrgico (DIH: 28/05/2025)",
      pendingIssues: ["Anatomopatológico 29/05 em andamento", "Seguimento conjunto CG", "NPT central iniciada 03/06"],
      exams: [
        "Hb 10→7 intra-op: transfundido 2CH + 4plasma",
        "Hb 10,7, Ht 34,4, Leuco 18450, PLQ 368.000",
        "PCR 16,7 (anterior 12,5), Ur 17,5, Cr 0,2",
      ],
      goals: [
        "Jejum + NPT central",
        "SNG aberta + procinéticos + simeticona",
        "Meta BH zerado",
        "Hidratação parcimoniosa",
      ],
      status: "stable",
      devices: "SVD 3 vias (trocada 30/05) + AVP + PICC (31/05)",
      medications: "Procinéticos, simeticona",
      antibiotics: [
        {
          name: "CEFTRIAXONA",
          startDate: "2025-05-28",
          daysInUse: 7,
        },
        {
          name: "METRONIDAZOL",
          startDate: "2025-05-28",
          daysInUse: 7,
        },
      ],
    },
    {
      id: "5004",
      name: "ISABEL CRISTINA MARTINS DA SILVA, 42a",
      diagnosis:
        "PO drenagem abscesso parede / PO histerectomia + salpingectomia / LRA KDIGO III / Íleo adinâmico em melhora",
      admittedFrom: "CCGO (DIH: 16/05/25)",
      pendingIssues: [
        "Cultura secreção lesão 29/05: gram negativo",
        "Avaliação CG para progressão dieta",
        "Furosemida 2amp 8/8h",
      ],
      exams: [
        "USG parede abdominal 27/05: coleção 17ml à direita",
        "Cr 5,1, U 82, K+ 3,6, HCO3- 22,1",
        "URC 28/05: sem crescimento / HMC 27/05: negativa",
      ],
      goals: [
        "Analgesia: gabapentina + amitriptilina + metadona 5mg 12/12h",
        "Não sacar SVD (rafia serosa vesical)",
        "Liberado água, chá e gelatina",
        "Não deambular - risco evisceração",
      ],
      status: "critical",
      devices: "SVD + PICC MSD (31/05)",
      medications: "Ketamina 4mL/h, Metadona 5mg 12/12h, Gabapentina, Amitriptilina",
      allergies: "Nefrolitíase, Esteatose hepática",
      comorbidities: "Drogadição (crack), Etilismo, Tabagismo",
      antibiotics: [
        {
          name: "MEROPENEM",
          startDate: "2025-05-31",
          daysInUse: 4,
        },
      ],
    },
    {
      id: "6001",
      name: "JOÃO PITA MARINHO, 83a",
      diagnosis:
        "DRC Agudizado (Cr 3,4 - basal 2,5) / ICC Perfil B (Pro BNP 83559) / DPOC exacerbado com infecção / Sd Consumptiva A/E",
      admittedFrom: "UPA Rio Pequeno (D:28/05) / DI UTI D:02/06",
      pendingIssues: [
        "ECO pendente",
        "US rins e vias urinárias",
        "Marcadores tumorais e função tireoidiana",
        "2ª amostra BARR para suspender isolamento respiratório",
      ],
      exams: ["Pro BNP 83559", "1ª e 2ª amostra TB negativa", "Swab vigilância pendente"],
      goals: [
        "Reconciliação medicamentosa",
        "Hidralazina 12,5mg 12/12h (reduzida)",
        "Furosemida 40mg 1x/dia",
        "Acompanhamento nefrologia",
      ],
      status: "stable",
      devices: "AVP",
      medications: "Hidralazina 12,5mg 12/12h, Furosemida 40mg/dia",
      allergies: "Dipirona",
      comorbidities: "DM, DPOC, Cardiopata, IC (IAM prévio), Ex-tabagista, Ex-etilista",
      antibiotics: [
        {
          name: "CEFTRIAXONE",
          startDate: "2025-05-28",
          daysInUse: 8,
        },
        {
          name: "AZITROMICINA",
          startDate: "2025-06-02",
          daysInUse: 2,
        },
      ],
    },
    {
      id: "6002",
      name: "GEORGINA VIEIRA DE ALMEIDA, 66a",
      diagnosis: "Bacteremia A/E (Infecção de cateter?) / Dor abdominal A/E / IRC dialítica",
      admittedFrom: "PS Lapa (D:02/06) / DI UTI D:03/06",
      pendingIssues: ["Laudo TC abdome", "HMC pareadas + cateter", "HD rotina (última HD sábado)"],
      exams: ["TC abdome pendente", "Tratamento prévio: Ceftazidima + Vancomicina"],
      goals: [
        "ATB empírico foco abdominal",
        "Analgesia otimizada S/N",
        "Seguimento conjunto CG",
        "Avaliação nefrologia para HD",
      ],
      status: "critical",
      devices: "AVP, Permicath",
      medications: "Analgesia S/N",
      comorbidities: "DM, IRC dialítica há 2 meses, HAS, Doença de Chagas, Sequela AVCI, Epilepsia",
      surgicalHistory: "Colecistectomia, Laqueadura, Cesárias",
      antibiotics: [
        {
          name: "CEFTRIAXONE",
          startDate: "2025-06-03",
          daysInUse: 1,
        },
        {
          name: "METRONIDAZOL",
          startDate: "2025-06-03",
          daysInUse: 1,
        },
      ],
    },
    {
      id: "7001",
      name: "Leito Vago",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "empty",
    },
    {
      id: "7002",
      name: "Leito Vago",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "empty",
    },
    {
      id: "7003",
      name: "Leito Vago",
      diagnosis: "",
      admittedFrom: "",
      pendingIssues: [],
      exams: [],
      goals: [],
      status: "empty",
    },
  ]

  // Dados estatísticos da UTI - agora como estado para permitir edição
  const [utiStats, setUtiStats] = useState<UTIStats>({
    period: "Últimas 24h",
    totalBeds: 13,
    occupiedBeds: 9,
    occupancyRate: 69.2,
    discharges: {
      total: 3,
      toWard: 2,
      home: 1,
      rate: 23.1,
    },
    deaths: {
      total: 1,
      rate: 7.7,
      trend: "stable",
    },
    readmissions: {
      total: 2,
      within48h: 1,
      rate: 15.4,
      trend: "up",
    },
    infections: {
      bloodstream: {
        total: 2,
        rate: 15.4,
        trend: "down",
      },
      ventilatorAssociated: {
        total: 1,
        rate: 7.7,
      },
      catheterAssociated: {
        total: 1,
        rate: 7.7,
      },
    },
    qualityIndicators: {
      mortalityRate: 7.7,
      averageStay: 8.5,
      ventilatorDays: 45,
      catheterDays: 38,
    },
    antibiotics: {
      totalPatients: 7,
      pendingVancocinemia: 3,
      broadSpectrum: 5,
      rate: 77.8,
    },
  })

  const [monthlyTrends, setMonthlyTrends] = useState({
    mortality: [8.2, 7.9, 8.5, 7.7],
    readmission: [12.1, 14.2, 13.8, 15.4],
    infection: [18.5, 16.2, 14.8, 15.4],
    occupancy: [72.3, 68.9, 71.2, 69.2],
  })

  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [patientToArchive, setPatientToArchive] = useState<any>(null)
  const [archiveReason, setArchiveReason] = useState<"discharge" | "death" | "transfer">("discharge")
  const [archiveNotes, setArchiveNotes] = useState("")
  const [showArchivedPatients, setShowArchivedPatients] = useState(false)
  const [archivedPatients, setArchivedPatients] = useState<ArchivedPatient[]>([
    {
      id: "4003",
      name: "J.S.P., 58a",
      diagnosis: "Pneumonia grave + DPOC",
      admittedFrom: "PS Lapa",
      admissionDate: "2025-05-15",
      archiveDate: "2025-05-28",
      archiveReason: "discharge",
      archiveNotes: "Alta para enfermaria após melhora clínica. Mantido antibiótico por mais 3 dias.",
      relevantInfo: [
        "Completou 10 dias de Ceftriaxona",
        "Culturas negativas",
        "Melhora radiológica significativa",
        "Encaminhado para pneumologia ambulatorial",
      ],
    },
    {
      id: "5005",
      name: "A.M.F., 72a",
      diagnosis: "Choque séptico refratário + IRpA",
      admittedFrom: "UPA Lapa",
      admissionDate: "2025-05-20",
      archiveDate: "2025-05-29",
      archiveReason: "death",
      archiveNotes: "Óbito por choque séptico refratário. Família ciente do prognóstico.",
      antibiotics: [
        {
          name: "MEROPENEM",
          startDate: "2025-05-20",
          daysInUse: 9,
        },
        {
          name: "VANCOMICINA",
          startDate: "2025-05-20",
          daysInUse: 9,
        },
      ],
      relevantInfo: [
        "Hemoculturas: Klebsiella pneumoniae MR",
        "Falência de múltiplos órgãos",
        "Família acompanhou todo o processo",
      ],
    },
  ])

  const filteredBeds = beds.filter(
    (bed) =>
      bed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const currentTime = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Função para salvar as alterações nas estatísticas
  const handleSaveStats = () => {
    // Registrar a ação de edição de estatísticas no log de auditoria LGPD
    logAuditEvent({
      action: "edit_statistics",
      user: loggedUser,
      data: { timestamp: new Date().toISOString() },
    })

    // Mostrar diálogo LGPD
    setShowLgpdDialog(true)

    // Desativar modo de edição
    setIsEditingStats(false)

    toast({
      title: "Estatísticas atualizadas",
      description: "As alterações foram salvas com sucesso.",
    })
  }

  // Função para atualizar um valor numérico nas estatísticas
  const updateStatValue = (path: string[], value: string) => {
    const numValue = Number.parseFloat(value) || 0

    // Cria uma cópia profunda do objeto de estatísticas
    const newStats = JSON.parse(JSON.stringify(utiStats))

    // Navega até o objeto pai
    let current = newStats
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }

    // Atualiza o valor
    current[path[path.length - 1]] = numValue

    // Atualiza o estado
    setUtiStats(newStats)
  }

  // Função para anexar arquivo ao paciente (nova funcionalidade)
  const handleAttachFileToPatient = (patient: any) => {
    setSelectedPatientForUpdate(patient)
    setShowPatientUploadDialog(true)
  }

  // Função para confirmar o arquivamento
  const confirmArchive = () => {
    // Criar o registro de paciente arquivado
    const archivedPatient: ArchivedPatient = {
      id: patientToArchive.id,
      name: patientToArchive.name,
      diagnosis: patientToArchive.diagnosis,
      admittedFrom: patientToArchive.admittedFrom,
      admissionDate: patientToArchive.admissionDate || new Date().toISOString().split("T")[0],
      archiveDate: new Date().toISOString().split("T")[0],
      archiveReason: archiveReason,
      archiveNotes: archiveNotes,
      antibiotics: patientToArchive.antibiotics,
      relevantInfo: [
        `${archiveReason === "discharge" ? "Alta" : archiveReason === "death" ? "Óbito" : "Transferência"} em ${new Date().toLocaleDateString("pt-BR")}`,
        archiveNotes,
      ],
    }

    // Adicionar à lista de pacientes arquivados
    setArchivedPatients([...archivedPatients, archivedPatient])

    // Registrar no log de auditoria LGPD
    logAuditEvent({
      action: `archive_patient_${archiveReason}`,
      user: loggedUser,
      data: {
        patientId: patientToArchive.id,
        reason: archiveReason,
      },
    })

    // Fechar o diálogo
    setShowArchiveDialog(false)
    setPatientToArchive(null)

    toast({
      title: "Paciente arquivado",
      description: `${patientToArchive.name} foi arquivado com sucesso.`,
    })

    // Em um sistema real, aqui atualizaríamos o status do leito para vago
    // e remover o paciente da lista de pacientes ativos
  }

  // Função para simular o upload e processamento do arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isPatientSpecific = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar o tipo de arquivo
    const fileType = file.name.toLowerCase().endsWith(".pdf")
      ? "pdf"
      : file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")
        ? "excel"
        : file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc")
          ? "word"
          : ""

    if (!fileType) {
      toast({
        title: "Formato não suportado",
        description: "Por favor, envie arquivos PDF, Excel ou Word.",
        variant: "destructive",
      })
      return
    }

    setUploadedFileName(file.name)
    setUploadedFileType(fileType as any)
    setUploadStatus("uploading")

    // Simular progresso de upload
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setUploadStatus("processing")

        // Simular processamento
        setTimeout(() => {
          setUploadStatus("success")

          // Registrar no log de auditoria
          logAuditEvent({
            action: isPatientSpecific ? "update_patient_data" : "import_data",
            user: loggedUser,
            data: {
              fileName: file.name,
              fileType: fileType,
              patientId: isPatientSpecific ? selectedPatientForUpdate?.id : undefined,
              timestamp: new Date().toISOString(),
            },
          })

          // Simular atualização dos dados após 1 segundo
          setTimeout(() => {
            handleRefresh()
            const message = isPatientSpecific
              ? `Dados do paciente ${selectedPatientForUpdate?.name} atualizados com sucesso`
              : `Os dados foram importados com sucesso de ${file.name}`

            toast({
              title: "Dados atualizados",
              description: message,
            })
          }, 1000)
        }, 2000)
      }
    }, 100)
  }

  // Função para reiniciar o estado de upload
  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setUploadedFileName("")
    setUploadedFileType("")
  }

  // Função para gerar panorama da UTI
  const handleGeneratePanorama = () => {
    logAuditEvent({
      action: "generate_panorama",
      user: loggedUser,
      data: {
        reportType: panoramaData.reportType,
        period: panoramaData.period,
        format: panoramaData.format,
        timestamp: new Date().toISOString(),
      },
    })

    setShowPanoramaDialog(false)

    toast({
      title: "Panorama gerado",
      description: `Relatório ${panoramaData.reportType} em formato ${panoramaData.format.toUpperCase()} foi gerado com sucesso.`,
    })

    // Simular download do arquivo
    setTimeout(() => {
      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado automaticamente.",
      })
    }, 1500)
  }

  // Função para processar PDF da passagem de plantão
  const handlePdfAttachment = (file: File) => {
    setAttachedPdfFile(file)
    setUploadStatus("uploading")

    // Simular processamento do PDF
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setUploadStatus("processing")

        // Simular extração de dados do PDF
        setTimeout(() => {
          setUploadStatus("success")

          // Registrar no log de auditoria
          logAuditEvent({
            action: "attach_handover_pdf",
            user: loggedUser,
            data: {
              fileName: file.name,
              timestamp: new Date().toISOString(),
            },
          })

          // Atualizar dados da passagem de plantão baseado no PDF
          updateHandoverFromPdf()

          toast({
            title: "PDF processado com sucesso",
            description: "A passagem de plantão foi atualizada com os dados do PDF anexado.",
          })
        }, 2000)
      }
    }, 200)
  }

  // Função para atualizar dados baseado no PDF
  const updateHandoverFromPdf = () => {
    // Aqui você atualizaria os dados dos leitos baseado no conteúdo do PDF
    // Por exemplo, atualizando informações dos pacientes
    toast({
      title: "Passagem de plantão atualizada",
      description: "Os dados foram sincronizados com o PDF anexado.",
    })
  }

  // Wrap the return statement with LGPDAuditProvider
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
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Buscar paciente..."
                className="w-[200px] pl-9 md:w-[260px] border-slate-200 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-slate-900"
              onClick={() => setShowStatsModal(true)}
              title="Estatísticas da UTI"
            >
              <BarChart2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <User className="h-5 w-5" />
              </Button>
              <span className="text-xs text-slate-600 hidden md:inline">{loggedUser}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 hover:text-slate-900"
              onClick={handleLogout}
              title="Sair do sistema"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6 px-4">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Passagem de Plantão UTI</h1>
              <p className="text-slate-600">Atualizado em {currentTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowHandoverUpdateDialog(true)}
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar Plantão
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowPanoramaDialog(true)}>
              <FileText className="h-4 w-4" />
              Panorama UTI
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowUploadDialog(true)}>
              <FileUp className="h-4 w-4" />
              Importar
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Novo Paciente
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowArchivedPatients(true)}>
              <FileArchive className="h-4 w-4" />
              Pacientes Arquivados
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" className="mb-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="todos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Todos os Leitos
            </TabsTrigger>
            <TabsTrigger value="criticos" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Críticos
            </TabsTrigger>
            <TabsTrigger value="estaveis" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              Estáveis
            </TabsTrigger>
            <TabsTrigger value="melhorando" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Melhorando
            </TabsTrigger>
            <TabsTrigger
              value="bloqueados"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Bloqueados
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBeds.map((bed) => (
            <Card
              key={bed.id}
              className="transition-all hover:shadow-lg hover:border-blue-200 bg-white border-slate-200 relative"
            >
              {bed.status !== "empty" && bed.status !== "blocked" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.preventDefault()
                    handleAttachFileToPatient(bed)
                  }}
                  title="Anexar arquivo para atualizar dados do paciente"
                >
                  <Key className="h-4 w-4" />
                </Button>
              )}
              <Link href={`/patient/${bed.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Leito {bed.id}</CardTitle>
                    <BedStatus status={bed.status} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{bed.name}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  {bed.status !== "empty" && bed.status !== "blocked" ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Diagnóstico</p>
                        <p className="text-sm text-slate-700 line-clamp-2">{bed.diagnosis}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Origem</p>
                        <p className="text-sm text-slate-700">{bed.admittedFrom}</p>
                      </div>

                      {bed.devices && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Dispositivos</p>
                          <p className="text-xs text-slate-600">{bed.devices}</p>
                        </div>
                      )}

                      {/* Seção de Antibióticos */}
                      {bed.antibiotics && bed.antibiotics.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                            Antibióticos
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {bed.antibiotics.map((atb, i) => (
                              <Badge
                                key={i}
                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1"
                              >
                                <Pill className="h-3 w-3" />
                                {atb.name.split("/")[0].substring(0, 4)}... D{atb.daysInUse}
                              </Badge>
                            ))}
                          </div>

                          {/* Mostrar pendências de vancocinemia */}
                          {bed.antibiotics.some(
                            (atb) =>
                              atb.name.includes("VANCOMICINA") &&
                              atb.pendingLabs &&
                              atb.pendingLabs.some((lab) => lab.toLowerCase().includes("vancocinemia")),
                          ) && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                                Vancocinemia pendente
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informações Clínicas Adicionais */}
                      {bed.saps3 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">SAPS 3</p>
                          <p className="text-xs text-slate-600">{bed.saps3}</p>
                        </div>
                      )}

                      {bed.allergies && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alergias</p>
                          <p className="text-xs text-red-600 font-medium">{bed.allergies}</p>
                        </div>
                      )}

                      {bed.comorbidities && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Comorbidades</p>
                          <p className="text-xs text-slate-600">{bed.comorbidities}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Pendências</p>
                        <div className="flex flex-wrap gap-1">
                          {bed.pendingIssues.slice(0, 2).map((issue, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs border-amber-200 text-amber-700 bg-amber-50"
                            >
                              {issue.length > 20 ? `${issue.substring(0, 20)}...` : issue}
                            </Badge>
                          ))}
                          {bed.pendingIssues.length > 2 && (
                            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
                              +{bed.pendingIssues.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : bed.status === "blocked" ? (
                    <div className="flex h-20 items-center justify-center">
                      <p className="text-purple-500 font-medium">Leito bloqueado</p>
                    </div>
                  ) : (
                    <div className="flex h-20 items-center justify-center">
                      <p className="text-slate-400">Leito disponível</p>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Componente de Atualização de Plantão */}
        <HandoverUpdateDialog
          open={showHandoverUpdateDialog}
          onOpenChange={setShowHandoverUpdateDialog}
          onSave={handleSaveHandover}
        />

        {/* LGPD Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 mt-0.5">
              <Heart className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Proteção de Dados - LGPD</h3>
              <p className="text-sm text-blue-800 mb-2">
                Este sistema processa dados pessoais sensíveis de pacientes exclusivamente para finalidades médicas e
                assistenciais, conforme Art. 11 da Lei 13.709/2018 (LGPD).
              </p>
              <div className="flex gap-2 text-xs">
                <Link href="/privacy" className="text-blue-700 hover:underline">
                  Política de Privacidade
                </Link>
                <span className="text-blue-600">•</span>
                <Link href="/data-rights" className="text-blue-700 hover:underline">
                  Direitos dos Titulares
                </Link>
                <span className="text-blue-600">•</span>
                <Link href="/contact-dpo" className="text-blue-700 hover:underline">
                  Contatar DPO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
