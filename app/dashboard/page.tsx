"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  LogOut,
  User,
  Bell,
  Search,
  Download,
  RefreshCw,
  Pill,
  Edit,
  Save,
  X,
  BarChart2,
  Upload,
  FileUp,
  Key,
  FileText,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { BedStatus } from "@/components/bed-status"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Skull, RotateCcw, Droplets, Shield } from "lucide-react"
import { logAuditEvent } from "@/components/lgpd-audit"
import { Archive, FileArchive, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Cookies from "js-cookie"
import { toast } from "@/components/ui/use-toast"

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
        "Choque séptico (Foco A/E) / Hipovolêmico / Hematoma coxa E infectado / FAARV / DRC Dialítica / Mieloma Múltiplo em investigação",
      admittedFrom: "UPA III LAPA (D:20/05) / DIH:21/05",
      pendingIssues: ["Avaliação CIR. GERAL p/ drenagem hematoma", "Vancocinemia 04/06", "HD conforme nefrologia"],
      exams: ["SAPS3: 76 | 67,5%", "USG partes moles: coleção 999,6ml", "Hb 8,3, Leuco 16620"],
      goals: ["Vigilância infecciosa", "Manter dieta pastosa + enteral 20ml/hr", "Hemodiálise conforme programação"],
      status: "critical",
      devices: "PICC, AVC, permcath",
      medications: "Vancomicina suspensa por vancocinemia elevada",
      antibiotics: [
        {
          name: "VANCOMICINA",
          startDate: "2025-05-21",
          daysInUse: 14,
          pendingLabs: ["Vancocinemia 04/06"],
        },
        {
          name: "MEROPENEM",
          startDate: "2025-05-24",
          daysInUse: 11,
        },
        {
          name: "FLUCONAZOL",
          startDate: "2025-05-27",
          daysInUse: 8,
        },
      ],
    },
    {
      id: "5002",
      name: "MARIA APARECIDA DA SILVA, 71a",
      diagnosis: "DPOC exacerbado / PO TQT D:21/05 / Ins resp + RNC",
      admittedFrom: "UPA Rio Pequeno (08/05/2025)",
      pendingIssues: ["CST D:29/05 gram negativo", "Clostridium 03/06", "Desmame VM"],
      exams: ["TC crânio + tórax 12/05", "Anisocoria resolvida", "Hb 8,1, Leuco 2460"],
      goals: ["Cuidados TQT", "BD com espaçador", "Desmame lento VM"],
      status: "stable",
      devices: "TQT, SVD, PICC MSD, SNE",
      medications: "Quetiapina 25mg 12/12h",
      antibiotics: [
        {
          name: "TAZOCIN",
          startDate: "2025-05-28",
          daysInUse: 7,
        },
      ],
    },
    {
      id: "5003",
      name: "MARIA SOCORRO MARQUES PEREIRA, 61a",
      diagnosis: "PO LE + COLECTOMIA DIREITA + ILEOTRANSVERSOANASTOMOSE + URETEROPLASTIA / Íleo paralítico",
      admittedFrom: "Centro Cirúrgico (DIH: 28/05/2025)",
      pendingIssues: ["Anatomopatológico em andamento", "Seguimento CG", "NPT central"],
      exams: ["Hb 10→7 intra-op: 2CH + 4plasma", "PCR 16,7", "Leuco 18450"],
      goals: ["Jejum + NPT central", "SNG aberta + procinéticos", "Hidratação parcimoniosa"],
      status: "stable",
      devices: "SVD 3 vias + AVP, PICC",
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
      diagnosis: "PO drenagem abscesso parede / PO histerectomia + salpingectomia / LRA KDIGO III",
      admittedFrom: "CCGO (DIH: 16/05/25)",
      pendingIssues: ["Cultura secreção 29/05", "Avaliação nefrologia", "Não sacar SVD"],
      exams: ["USG parede: coleção 17ml", "Cr 5,1, U 82", "Cultura gram negativo"],
      goals: ["Analgesia otimizada", "Furosemida 8/8h", "Não deambular - risco evisceração"],
      status: "critical",
      devices: "SVD + PICC MSD",
      medications: "Ketamina 4mL/h, Metadona 5mg 12/12h",
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
      diagnosis: "DRC Agudizado / ICC Perfil B / DPOC exacerbado com infecção / Sd Consumptiva",
      admittedFrom: "UPA Rio Pequeno (D:28/05) / DI UTI D:02/06",
      pendingIssues: ["ECO", "US rins", "Marcadores tumorais", "2ª amostra BARR"],
      exams: ["Pro BNP 83559", "Cr 3,4 (basal 2,5)", "1ª e 2ª amostra TB negativa"],
      goals: ["Reconciliação medicamentosa", "Furosemida 40mg/dia", "Acompanhamento nefrologia"],
      status: "stable",
      devices: "AVP",
      medications: "Hidralazina 12,5mg 12/12h",
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
      diagnosis: "Bacteremia A/E / Infecção de cateter / Dor abdominal A/E / IRC dialítica",
      admittedFrom: "PS Lapa (D:02/06) / DI UTI D:03/06",
      pendingIssues: ["Laudo TC abdome", "HMC pareadas + cateter", "HD rotina"],
      exams: ["Última HD sábado", "TC abdome pendente"],
      goals: ["ATB empírico foco abdominal", "Analgesia otimizada", "Seguimento CG"],
      status: "critical",
      devices: "AVP, Permicath",
      medications: "Analgesia S/N",
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

          <div className="flex items-center gap-2">
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
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setShowPdfAttachDialog(true)}
                title="Anexar PDF da passagem de plantão"
              >
                <FileText className="h-4 w-4" />
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

        {/* Estatísticas e Indicadores */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Indicadores de Qualidade</h2>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-500">
                Período: {utiStats.period} | Atualizado: {currentTime}
              </div>
              {isEditingStats ? (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingStats(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveStats}>
                    <Save className="h-4 w-4 mr-1" /> Salvar
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditingStats(true)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar Indicadores
                </Button>
              )}
            </div>
          </div>

          {/* Cards de Estatísticas Principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Altas</p>
                    {isEditingStats ? (
                      <div className="space-y-1 mt-1">
                        <Input
                          type="number"
                          value={utiStats.discharges.total}
                          onChange={(e) => updateStatValue(["discharges", "total"], e.target.value)}
                          className="h-8 text-lg font-bold text-green-900 bg-white"
                        />
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <label className="text-xs text-green-700">Enfermaria</label>
                            <Input
                              type="number"
                              value={utiStats.discharges.toWard}
                              onChange={(e) => updateStatValue(["discharges", "toWard"], e.target.value)}
                              className="h-6 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-green-700">Domicílio</label>
                            <Input
                              type="number"
                              value={utiStats.discharges.home}
                              onChange={(e) => updateStatValue(["discharges", "home"], e.target.value)}
                              className="h-6 text-xs bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-green-900">{utiStats.discharges.total}</p>
                        <p className="text-xs text-green-600">{utiStats.discharges.rate}% dos pacientes</p>
                      </>
                    )}
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                {!isEditingStats && (
                  <div className="mt-2 text-xs text-green-600">
                    Enfermaria: {utiStats.discharges.toWard} | Domicílio: {utiStats.discharges.home}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Óbitos</p>
                    {isEditingStats ? (
                      <div className="space-y-1 mt-1">
                        <Input
                          type="number"
                          value={utiStats.deaths.total}
                          onChange={(e) => updateStatValue(["deaths", "total"], e.target.value)}
                          className="h-8 text-lg font-bold text-red-900 bg-white"
                        />
                        <div>
                          <label className="text-xs text-red-700">Taxa (%)</label>
                          <Input
                            type="number"
                            value={utiStats.deaths.rate}
                            onChange={(e) => updateStatValue(["deaths", "rate"], e.target.value)}
                            className="h-6 text-xs bg-white"
                            step="0.1"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-red-900">{utiStats.deaths.total}</p>
                        <p className="text-xs text-red-600">{utiStats.deaths.rate}% mortalidade</p>
                      </>
                    )}
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Skull className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                {!isEditingStats && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <Activity className="h-3 w-3" />
                    Tendência: {utiStats.deaths.trend === "stable" ? "Estável" : "Em alta"}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Readmissões</p>
                    {isEditingStats ? (
                      <div className="space-y-1 mt-1">
                        <Input
                          type="number"
                          value={utiStats.readmissions.total}
                          onChange={(e) => updateStatValue(["readmissions", "total"], e.target.value)}
                          className="h-8 text-lg font-bold text-amber-900 bg-white"
                        />
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <label className="text-xs text-amber-700">48h</label>
                            <Input
                              type="number"
                              value={utiStats.readmissions.within48h}
                              onChange={(e) => updateStatValue(["readmissions", "within48h"], e.target.value)}
                              className="h-6 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-amber-700">Taxa (%)</label>
                            <Input
                              type="number"
                              value={utiStats.readmissions.rate}
                              onChange={(e) => updateStatValue(["readmissions", "rate"], e.target.value)}
                              className="h-6 text-xs bg-white"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-amber-900">{utiStats.readmissions.total}</p>
                        <p className="text-xs text-amber-600">{utiStats.readmissions.rate}% dos casos</p>
                      </>
                    )}
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                {!isEditingStats && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                    <TrendingUp className="h-3 w-3" />
                    48h: {utiStats.readmissions.within48h} caso
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">IPCS</p>
                    {isEditingStats ? (
                      <div className="space-y-1 mt-1">
                        <Input
                          type="number"
                          value={utiStats.infections.bloodstream.total}
                          onChange={(e) => updateStatValue(["infections", "bloodstream", "total"], e.target.value)}
                          className="h-8 text-lg font-bold text-purple-900 bg-white"
                        />
                        <div>
                          <label className="text-xs text-purple-700">Taxa (%)</label>
                          <Input
                            type="number"
                            value={utiStats.infections.bloodstream.rate}
                            onChange={(e) => updateStatValue(["infections", "bloodstream", "rate"], e.target.value)}
                            className="h-6 text-xs bg-white"
                            step="0.1"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-purple-900">{utiStats.infections.bloodstream.total}</p>
                        <p className="text-xs text-purple-600">{utiStats.infections.bloodstream.rate}% dos pacientes</p>
                      </>
                    )}
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                {!isEditingStats && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                    <TrendingDown className="h-3 w-3" />
                    Tendência: Em queda
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Nova seção de Antibióticos */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                Monitoramento de Antibióticos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Pacientes em ATB</p>
                  {isEditingStats ? (
                    <div className="space-y-1 mt-1">
                      <Input
                        type="number"
                        value={utiStats.antibiotics.totalPatients}
                        onChange={(e) => updateStatValue(["antibiotics", "totalPatients"], e.target.value)}
                        className="h-8 text-lg font-bold text-slate-900 bg-white"
                      />
                      <div>
                        <label className="text-xs text-slate-500">Taxa (%)</label>
                        <Input
                          type="number"
                          value={utiStats.antibiotics.rate}
                          onChange={(e) => updateStatValue(["antibiotics", "rate"], e.target.value)}
                          className="h-6 text-xs bg-white"
                          step="0.1"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-slate-900">{utiStats.antibiotics.totalPatients}</p>
                      <p className="text-xs text-slate-500">{utiStats.antibiotics.rate}% dos pacientes</p>
                    </>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Vancocineamias Pendentes</p>
                  {isEditingStats ? (
                    <Input
                      type="number"
                      value={utiStats.antibiotics.pendingVancocinemia}
                      onChange={(e) => updateStatValue(["antibiotics", "pendingVancocinemia"], e.target.value)}
                      className="h-8 text-lg font-bold text-amber-600 bg-white mt-1"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-amber-600">{utiStats.antibiotics.pendingVancocinemia}</p>
                      <p className="text-xs text-slate-500">Pacientes aguardando</p>
                    </>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Espectro Amplo</p>
                  {isEditingStats ? (
                    <Input
                      type="number"
                      value={utiStats.antibiotics.broadSpectrum}
                      onChange={(e) => updateStatValue(["antibiotics", "broadSpectrum"], e.target.value)}
                      className="h-8 text-lg font-bold text-red-600 bg-white mt-1"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-red-600">{utiStats.antibiotics.broadSpectrum}</p>
                      <p className="text-xs text-slate-500">Meropenem/Vancomicina</p>
                    </>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Média de Dias</p>
                  {isEditingStats ? (
                    <Input
                      type="number"
                      value={5.2}
                      className="h-8 text-lg font-bold text-blue-600 bg-white mt-1"
                      step="0.1"
                    />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-blue-600">5.2</p>
                      <p className="text-xs text-slate-500">Dias de uso médio</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicadores Detalhados */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ocupação e Movimentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Taxa de Ocupação</span>
                    {isEditingStats ? (
                      <Input
                        type="number"
                        value={utiStats.occupancyRate}
                        onChange={(e) => updateStatValue(["occupancyRate"], e.target.value)}
                        className="w-20 h-6 text-sm font-medium bg-white"
                        step="0.1"
                      />
                    ) : (
                      <span className="font-medium">{utiStats.occupancyRate}%</span>
                    )}
                  </div>
                  <Progress value={utiStats.occupancyRate} className="h-2" />
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>
                      {utiStats.occupiedBeds} de {utiStats.totalBeds} leitos ocupados
                    </span>
                    {isEditingStats && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs">Ocupados:</label>
                        <Input
                          type="number"
                          value={utiStats.occupiedBeds}
                          onChange={(e) => updateStatValue(["occupiedBeds"], e.target.value)}
                          className="w-12 h-5 text-xs bg-white"
                        />
                        <label className="text-xs">Total:</label>
                        <Input
                          type="number"
                          value={utiStats.totalBeds}
                          onChange={(e) => updateStatValue(["totalBeds"], e.target.value)}
                          className="w-12 h-5 text-xs bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    {isEditingStats ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          value={utiStats.qualityIndicators.averageStay}
                          onChange={(e) => updateStatValue(["qualityIndicators", "averageStay"], e.target.value)}
                          className="h-8 text-lg font-bold text-slate-900 bg-white"
                          step="0.1"
                        />
                        <p className="text-xs text-slate-600">Dias médios de internação</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-slate-900">{utiStats.qualityIndicators.averageStay}</p>
                        <p className="text-xs text-slate-600">Dias médios de internação</p>
                      </>
                    )}
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    {isEditingStats ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          value={utiStats.qualityIndicators.ventilatorDays}
                          onChange={(e) => updateStatValue(["qualityIndicators", "ventilatorDays"], e.target.value)}
                          className="h-8 text-lg font-bold text-slate-900 bg-white"
                        />
                        <p className="text-xs text-slate-600">Ventilador-dias no mês</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-slate-900">{utiStats.qualityIndicators.ventilatorDays}</p>
                        <p className="text-xs text-slate-600">Ventilador-dias no mês</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Infecções Relacionadas à Assistência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-900">IPCS - Corrente Sanguínea</p>
                      <p className="text-sm text-red-700">{utiStats.infections.bloodstream.total} casos ativos</p>
                    </div>
                    <div className="text-right">
                      {isEditingStats ? (
                        <Input
                          type="number"
                          value={utiStats.infections.bloodstream.rate}
                          onChange={(e) => updateStatValue(["infections", "bloodstream", "rate"], e.target.value)}
                          className="w-16 h-8 text-lg font-bold text-red-900 bg-white"
                          step="0.1"
                        />
                      ) : (
                        <p className="text-lg font-bold text-red-900">{utiStats.infections.bloodstream.rate}%</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <TrendingDown className="h-3 w-3" />
                        <span>-2.1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-900">PAVM - Pneumonia Associada</p>
                      <p className="text-sm text-blue-700">
                        {utiStats.infections.ventilatorAssociated.total} caso ativo
                      </p>
                    </div>
                    <div className="text-right">
                      {isEditingStats ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={utiStats.infections.ventilatorAssociated.rate}
                            onChange={(e) =>
                              updateStatValue(["infections", "ventilatorAssociated", "rate"], e.target.value)
                            }
                            className="w-16 h-8 text-lg font-bold text-blue-900 bg-white"
                            step="0.1"
                          />
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-blue-700">Casos:</label>
                            <Input
                              type="number"
                              value={utiStats.infections.ventilatorAssociated.total}
                              onChange={(e) =>
                                updateStatValue(["infections", "ventilatorAssociated", "total"], e.target.value)
                              }
                              className="w-10 h-5 text-xs bg-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-blue-900">
                          {utiStats.infections.ventilatorAssociated.rate}%
                        </p>
                      )}
                      {!isEditingStats && <div className="text-xs text-blue-600">Estável</div>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="font-medium text-amber-900">ITU - Cateter Associada</p>
                      <p className="text-sm text-amber-700">
                        {utiStats.infections.catheterAssociated.total} caso ativo
                      </p>
                    </div>
                    <div className="text-right">
                      {isEditingStats ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={utiStats.infections.catheterAssociated.rate}
                            onChange={(e) =>
                              updateStatValue(["infections", "catheterAssociated", "rate"], e.target.value)
                            }
                            className="w-16 h-8 text-lg font-bold text-amber-900 bg-white"
                            step="0.1"
                          />
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-amber-700">Casos:</label>
                            <Input
                              type="number"
                              value={utiStats.infections.catheterAssociated.total}
                              onChange={(e) =>
                                updateStatValue(["infections", "catheterAssociated", "total"], e.target.value)
                              }
                              className="w-10 h-5 text-xs bg-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-amber-900">
                          {utiStats.infections.catheterAssociated.rate}%
                        </p>
                      )}
                      {!isEditingStats && <div className="text-xs text-amber-600">Estável</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas e Metas */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Metas de Qualidade - Hospital Mario Degni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Mortalidade (Meta: &lt;10%)</span>
                      {isEditingStats ? (
                        <Input
                          type="number"
                          value={utiStats.qualityIndicators.mortalityRate}
                          onChange={(e) => updateStatValue(["qualityIndicators", "mortalityRate"], e.target.value)}
                          className="w-16 h-6 text-sm font-medium bg-white"
                          step="0.1"
                        />
                      ) : (
                        <span
                          className={`font-medium ${
                            utiStats.qualityIndicators.mortalityRate <= 10 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {utiStats.qualityIndicators.mortalityRate}%
                        </span>
                      )}
                    </div>
                    <Progress value={utiStats.qualityIndicators.mortalityRate} className="h-2" max={15} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>IPCS (Meta: &lt;5%)</span>
                      {isEditingStats ? (
                        <Input
                          type="number"
                          value={utiStats.infections.bloodstream.rate}
                          onChange={(e) => updateStatValue(["infections", "bloodstream", "rate"], e.target.value)}
                          className="w-16 h-6 text-sm font-medium bg-white"
                          step="0.1"
                        />
                      ) : (
                        <span
                          className={`font-medium ${
                            utiStats.infections.bloodstream.rate <= 5 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {utiStats.infections.bloodstream.rate}%
                        </span>
                      )}
                    </div>
                    <Progress value={utiStats.infections.bloodstream.rate} className="h-2" max={20} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Readmissão 48h (Meta: &lt;8%)</span>
                      {isEditingStats ? (
                        <Input
                          type="number"
                          value={utiStats.readmissions.rate}
                          onChange={(e) => updateStatValue(["readmissions", "rate"], e.target.value)}
                          className="w-16 h-6 text-sm font-medium bg-white"
                          step="0.1"
                        />
                      ) : (
                        <span
                          className={`font-medium ${
                            utiStats.readmissions.rate <= 8 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {utiStats.readmissions.rate}%
                        </span>
                      )}
                    </div>
                    <Progress value={utiStats.readmissions.rate} className="h-2" max={20} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ocupação (Meta: 70-85%)</span>
                      {isEditingStats ? (
                        <Input
                          type="number"
                          value={utiStats.occupancyRate}
                          onChange={(e) => updateStatValue(["occupancyRate"], e.target.value)}
                          className="w-16 h-6 text-sm font-medium bg-white"
                          step="0.1"
                        />
                      ) : (
                        <span
                          className={`font-medium ${
                            utiStats.occupancyRate >= 70 && utiStats.occupancyRate <= 85
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {utiStats.occupancyRate}%
                        </span>
                      )}
                    </div>
                    <Progress value={utiStats.occupancyRate} className="h-2" max={100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas do Plantão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>IPCS acima da meta:</strong> {utiStats.infections.bloodstream.total} casos ativos de
                    infecção de corrente sanguínea. Revisar protocolos de CVC.
                  </AlertDescription>
                </Alert>

                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Vancocineamias pendentes:</strong> {utiStats.antibiotics.pendingVancocinemia} pacientes
                    aguardando dosagem. Verificar coletas.
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <Activity className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Meta atingida:</strong> Mortalidade dentro do esperado (
                    {utiStats.qualityIndicators.mortalityRate}%).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Tendências Mensais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendências dos Últimos 4 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-2">Mortalidade (%)</p>
                  <div className="space-y-1">
                    {monthlyTrends.mortality.map((value, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mês {index + 1}</span>
                        {isEditingStats ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newTrends = { ...monthlyTrends }
                              newTrends.mortality[index] = Number.parseFloat(e.target.value) || 0
                              setMonthlyTrends(newTrends)
                            }}
                            className="w-14 h-5 text-xs bg-white"
                            step="0.1"
                          />
                        ) : (
                          <span className={`font-medium ${value <= 10 ? "text-green-600" : "text-red-600"}`}>
                            {value}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-2">Readmissão (%)</p>
                  <div className="space-y-1">
                    {monthlyTrends.readmission.map((value, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mês {index + 1}</span>
                        {isEditingStats ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newTrends = { ...monthlyTrends }
                              newTrends.readmission[index] = Number.parseFloat(e.target.value) || 0
                              setMonthlyTrends(newTrends)
                            }}
                            className="w-14 h-5 text-xs bg-white"
                            step="0.1"
                          />
                        ) : (
                          <span className={`font-medium ${value <= 8 ? "text-green-600" : "text-amber-600"}`}>
                            {value}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-2">IPCS (%)</p>
                  <div className="space-y-1">
                    {monthlyTrends.infection.map((value, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mês {index + 1}</span>
                        {isEditingStats ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newTrends = { ...monthlyTrends }
                              newTrends.infection[index] = Number.parseFloat(e.target.value) || 0
                              setMonthlyTrends(newTrends)
                            }}
                            className="w-14 h-5 text-xs bg-white"
                            step="0.1"
                          />
                        ) : (
                          <span className={`font-medium ${value <= 5 ? "text-green-600" : "text-red-600"}`}>
                            {value}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-2">Ocupação (%)</p>
                  <div className="space-y-1">
                    {monthlyTrends.occupancy.map((value, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Mês {index + 1}</span>
                        {isEditingStats ? (
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newTrends = { ...monthlyTrends }
                              newTrends.occupancy[index] = Number.parseFloat(e.target.value) || 0
                              setMonthlyTrends(newTrends)
                            }}
                            className="w-14 h-5 text-xs bg-white"
                            step="0.1"
                          />
                        ) : (
                          <span
                            className={`font-medium ${
                              value >= 70 && value <= 85 ? "text-green-600" : "text-amber-600"
                            }`}
                          >
                            {value}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Diálogo LGPD para edição de estatísticas */}
        {showLgpdDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">Alteração Registrada - LGPD</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Ação:</strong> Edição de indicadores estatísticos da UTI
                </p>
                <p>
                  <strong>Usuário:</strong> {loggedUser}
                </p>
                <p>
                  <strong>Data/Hora:</strong> {new Date().toLocaleString("pt-BR")}
                </p>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    Esta ação foi registrada no sistema de auditoria em conformidade com a LGPD (Lei 13.709/2018). Todas
                    as alterações em dados sensíveis são monitoradas e podem ser auditadas.
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowLgpdDialog(false)}>Entendi</Button>
              </div>
            </div>
          </div>
        )}

        {/* Diálogo de arquivamento de paciente */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Arquivar Paciente</DialogTitle>
              <DialogDescription>
                Arquivar o paciente {patientToArchive?.name} do leito {patientToArchive?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo do arquivamento</label>
                <Select value={archiveReason} onValueChange={(value: any) => setArchiveReason(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discharge">Alta hospitalar</SelectItem>
                    <SelectItem value="death">Óbito</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  placeholder="Informações relevantes sobre o paciente"
                  value={archiveNotes}
                  onChange={(e) => setArchiveNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Conformidade LGPD</p>
                    <p>Esta ação será registrada no sistema de auditoria conforme a Lei 13.709/2018.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmArchive}>Confirmar Arquivamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de pacientes arquivados */}
        <Dialog open={showArchivedPatients} onOpenChange={setShowArchivedPatients}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileArchive className="h-5 w-5" />
                Pacientes Arquivados
              </DialogTitle>
              <DialogDescription>
                Histórico de pacientes que receberam alta, foram transferidos ou foram a óbito
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {archivedPatients.length > 0 ? (
                <div className="space-y-4">
                  {archivedPatients.map((patient) => (
                    <Card key={patient.id} className="overflow-hidden">
                      <CardHeader
                        className={`py-3 ${
                          patient.archiveReason === "discharge"
                            ? "bg-green-50"
                            : patient.archiveReason === "death"
                              ? "bg-red-50"
                              : "bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                patient.archiveReason === "discharge"
                                  ? "bg-green-100"
                                  : patient.archiveReason === "death"
                                    ? "bg-red-100"
                                    : "bg-blue-100"
                              }`}
                            >
                              {patient.archiveReason === "discharge" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : patient.archiveReason === "death" ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <Archive className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {patient.name} - Leito {patient.id}
                              </h3>
                              <p className="text-xs">
                                {patient.archiveReason === "discharge"
                                  ? "Alta"
                                  : patient.archiveReason === "death"
                                    ? "Óbito"
                                    : "Transferência"}{" "}
                                em {new Date(patient.archiveDate).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              patient.archiveReason === "discharge"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : patient.archiveReason === "death"
                                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                                  : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            }
                          >
                            {patient.archiveReason === "discharge"
                              ? "Alta"
                              : patient.archiveReason === "death"
                                ? "Óbito"
                                : "Transferência"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Informações do Paciente</h4>
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-2">
                                <span className="text-slate-500">Diagnóstico:</span>
                                <span>{patient.diagnosis}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                <span className="text-slate-500">Origem:</span>
                                <span>{patient.admittedFrom}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                <span className="text-slate-500">Internação:</span>
                                <span>{new Date(patient.admissionDate).toLocaleDateString("pt-BR")}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                <span className="text-slate-500">Permanência:</span>
                                <span>
                                  {Math.round(
                                    (new Date(patient.archiveDate).getTime() -
                                      new Date(patient.admissionDate).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )}{" "}
                                  dias
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Informações Relevantes</h4>
                            <div className="space-y-1">
                              {patient.relevantInfo?.map((info, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                                  <p className="text-sm">{info}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {patient.antibiotics && patient.antibiotics.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Antibióticos Utilizados</h4>
                            <div className="flex flex-wrap gap-2">
                              {patient.antibiotics.map((atb, index) => (
                                <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  {atb.name} - {atb.daysInUse}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Observações:</span> {patient.archiveNotes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileArchive className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhum paciente arquivado encontrado</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowArchivedPatients(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Estatísticas */}
        <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                Estatísticas da UTI - Hospital Mario Degni
              </DialogTitle>
              <DialogDescription>Indicadores de qualidade e dados estatísticos do período atual</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Resumo Geral */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-blue-800">Tempo de Internação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">
                      {utiStats.qualityIndicators.averageStay} dias
                    </div>
                    <p className="text-sm text-blue-700">Média do período atual</p>
                    <div className="mt-2 text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">-0.3 dias vs. mês anterior</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-green-800">Altas Hospitalares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">{utiStats.discharges.total}</div>
                    <p className="text-sm text-green-700">Nas últimas 24h</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-600 font-medium">{utiStats.discharges.toWard}</span>
                        <span className="text-green-600"> para enfermaria</span>
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">{utiStats.discharges.home}</span>
                        <span className="text-green-600"> para domicílio</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-red-800">Óbitos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-900">{utiStats.deaths.total}</div>
                    <p className="text-sm text-red-700">Nas últimas 24h</p>
                    <div className="mt-2 text-xs flex items-center gap-1">
                      <Activity className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">Taxa de mortalidade: {utiStats.deaths.rate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Infecções Relacionadas à Assistência */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Infecções Relacionadas à Assistência</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-900">IPCS - Infecção Primária de Corrente Sanguínea</p>
                      <p className="text-sm text-blue-700">{utiStats.infections.bloodstream.total} casos ativos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-900">{utiStats.infections.bloodstream.rate}%</p>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <TrendingDown className="h-3 w-3" />
                        <span>-2.1% vs. mês anterior</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <p className="font-medium text-purple-900">PAVM - Pneumonia Associada à Ventilação Mecânica</p>
                      <p className="text-sm text-purple-700">
                        {utiStats.infections.ventilatorAssociated.total} caso ativo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-900">
                        {utiStats.infections.ventilatorAssociated.rate}%
                      </p>
                      <div className="text-xs text-purple-600">
                        <span>Densidade: 12.5 por 1000 VM-dia</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="font-medium text-amber-900">
                        ITU-AC - Infecção do Trato Urinário Associada a Cateter
                      </p>
                      <p className="text-sm text-amber-700">
                        {utiStats.infections.catheterAssociated.total} caso ativo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-900">{utiStats.infections.catheterAssociated.rate}%</p>
                      <div className="text-xs text-amber-600">
                        <span>Densidade: 8.3 por 1000 SVD-dia</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas Detalhadas */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribuição de Tempo de Internação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Menos de 3 dias</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>3 a 7 dias</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>8 a 14 dias</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mais de 14 dias</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Desfechos Clínicos - Últimos 30 dias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Alta para Enfermaria</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2 bg-slate-100">
                        <div className="h-full bg-green-600" style={{ width: "68%" }} />
                      </Progress>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Alta para Domicílio</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <Progress value={12} className="h-2 bg-slate-100">
                        <div className="h-full bg-blue-600" style={{ width: "12%" }} />
                      </Progress>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Transferência</span>
                        <span className="font-medium">8%</span>
                      </div>
                      <Progress value={8} className="h-2 bg-slate-100">
                        <div className="h-full bg-amber-600" style={{ width: "8%" }} />
                      </Progress>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Óbito</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <Progress value={12} className="h-2 bg-slate-100">
                        <div className="h-full bg-red-600" style={{ width: "12%" }} />
                      </Progress>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Indicadores de Qualidade */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Indicadores de Qualidade - Comparativo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-200 p-2 text-left">Indicador</th>
                        <th className="border border-slate-200 p-2 text-center">Atual</th>
                        <th className="border border-slate-200 p-2 text-center">Meta</th>
                        <th className="border border-slate-200 p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 p-2">Taxa de Mortalidade</td>
                        <td className="border border-slate-200 p-2 text-center font-medium">
                          {utiStats.qualityIndicators.mortalityRate}%
                        </td>
                        <td className="border border-slate-200 p-2 text-center">&lt; 10%</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${utiStats.qualityIndicators.mortalityRate < 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {utiStats.qualityIndicators.mortalityRate < 10 ? "Adequado" : "Acima da meta"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">IPCS</td>
                        <td className="border border-slate-200 p-2 text-center font-medium">
                          {utiStats.infections.bloodstream.rate}%
                        </td>
                        <td className="border border-slate-200 p-2 text-center">&lt; 5%</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${utiStats.infections.bloodstream.rate < 5 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {utiStats.infections.bloodstream.rate < 5 ? "Adequado" : "Acima da meta"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">PAVM</td>
                        <td className="border border-slate-200 p-2 text-center font-medium">
                          {utiStats.infections.ventilatorAssociated.rate}%
                        </td>
                        <td className="border border-slate-200 p-2 text-center">&lt; 10%</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${utiStats.infections.ventilatorAssociated.rate < 10 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                          >
                            {utiStats.infections.ventilatorAssociated.rate < 10 ? "Adequado" : "Atenção"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">ITU-AC</td>
                        <td className="border border-slate-200 p-2 text-center font-medium">
                          {utiStats.infections.catheterAssociated.rate}%
                        </td>
                        <td className="border border-slate-200 p-2 text-center">&lt; 10%</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${utiStats.infections.catheterAssociated.rate < 10 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                          >
                            {utiStats.infections.catheterAssociated.rate < 10 ? "Adequado" : "Atenção"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">Tempo Médio de Internação</td>
                        <td className="border border-slate-200 p-2 text-center font-medium">
                          {utiStats.qualityIndicators.averageStay} dias
                        </td>
                        <td className="border border-slate-200 p-2 text-center">&lt; 10 dias</td>
                        <td className="border border-slate-200 p-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${utiStats.qualityIndicators.averageStay < 10 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}
                          >
                            {utiStats.qualityIndicators.averageStay < 10 ? "Adequado" : "Atenção"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nota LGPD */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Conformidade LGPD</p>
                    <p>
                      Estes dados estatísticos são apresentados de forma agregada e anonimizada, em conformidade com a
                      Lei Geral de Proteção de Dados (Lei 13.709/2018).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  logAuditEvent({
                    action: "export_statistics",
                    user: loggedUser,
                    data: { format: "pdf", timestamp: new Date().toISOString() },
                  })
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={() => setShowStatsModal(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Upload de Arquivo Geral */}
        <Dialog
          open={showUploadDialog}
          onOpenChange={(open) => {
            setShowUploadDialog(open)
            if (!open) resetUpload()
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-blue-600" />
                Importar Dados
              </DialogTitle>
              <DialogDescription>
                Faça upload de um arquivo para atualizar automaticamente os dados da passagem de plantão
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {uploadStatus === "idle" ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Arraste um arquivo ou clique para selecionar</p>
                    <p className="text-xs text-slate-500">
                      Formatos suportados: PDF, Excel (.xlsx, .xls), Word (.docx, .doc)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.xlsx,.xls,.docx,.doc"
                      onChange={(e) => handleFileUpload(e, false)}
                    />
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      Selecionar Arquivo
                    </Button>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Conformidade LGPD</p>
                        <p>Esta ação será registrada no sistema de auditoria conforme a Lei 13.709/2018.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {uploadedFileType === "pdf" ? (
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileUp className="h-6 w-6 text-red-600" />
                      </div>
                    ) : uploadedFileType === "excel" ? (
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileUp className="h-6 w-6 text-green-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileUp className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{uploadedFileName}</p>
                      <p className="text-xs text-slate-500">
                        {uploadStatus === "uploading"
                          ? "Enviando..."
                          : uploadStatus === "processing"
                            ? "Processando..."
                            : uploadStatus === "success"
                              ? "Processado com sucesso"
                              : "Erro ao processar"}
                      </p>
                    </div>
                  </div>

                  {uploadStatus === "uploading" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Enviando arquivo</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {uploadStatus === "processing" && (
                    <div className="flex items-center justify-center p-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="ml-3 text-sm">Processando dados do arquivo...</span>
                    </div>
                  )}

                  {uploadStatus === "success" && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">Arquivo processado com sucesso</p>
                          <p>Os dados da passagem de plantão serão atualizados automaticamente.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium mb-1">Erro ao processar arquivo</p>
                          <p>Verifique se o formato do arquivo é compatível e tente novamente.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              {uploadStatus === "idle" || uploadStatus === "error" ? (
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancelar
                </Button>
              ) : uploadStatus === "success" ? (
                <Button onClick={() => setShowUploadDialog(false)}>Fechar</Button>
              ) : (
                <Button disabled>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Aguarde...
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Upload de Arquivo para Paciente Específico */}
        <Dialog
          open={showPatientUploadDialog}
          onOpenChange={(open) => {
            setShowPatientUploadDialog(open)
            if (!open) {
              resetUpload()
              setSelectedPatientForUpdate(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Atualizar Dados do Paciente
              </DialogTitle>
              <DialogDescription>
                Anexar arquivo para atualizar dados do paciente {selectedPatientForUpdate?.name} - Leito{" "}
                {selectedPatientForUpdate?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {uploadStatus === "idle" ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                    <Key className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-800 mb-2 font-medium">
                      Anexar arquivo para {selectedPatientForUpdate?.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      Formatos suportados: PDF (exames, relatórios), Excel (dados laboratoriais)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      id="patient-file-upload"
                      accept=".pdf,.xlsx,.xls"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                    <Button
                      variant="outline"
                      className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => document.getElementById("patient-file-upload")?.click()}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </Button>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Atualização de Dados do Paciente</p>
                        <p>
                          Este arquivo será processado para atualizar automaticamente as informações do paciente na
                          passagem de plantão.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {uploadedFileType === "pdf" ? (
                      <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileUp className="h-6 w-6 text-red-600" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileUp className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{uploadedFileName}</p>
                      <p className="text-xs text-slate-500">
                        Paciente: {selectedPatientForUpdate?.name} - Leito {selectedPatientForUpdate?.id}
                      </p>
                    </div>
                  </div>

                  {uploadStatus === "uploading" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Enviando arquivo</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {uploadStatus === "processing" && (
                    <div className="flex items-center justify-center p-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="ml-3 text-sm">Processando dados do paciente...</span>
                    </div>
                  )}

                  {uploadStatus === "success" && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">Dados do paciente atualizados</p>
                          <p>
                            As informações de {selectedPatientForUpdate?.name} foram atualizadas com base no arquivo
                            anexado.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium mb-1">Erro ao processar arquivo</p>
                          <p>Verifique se o formato do arquivo é compatível e tente novamente.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              {uploadStatus === "idle" || uploadStatus === "error" ? (
                <Button variant="outline" onClick={() => setShowPatientUploadDialog(false)}>
                  Cancelar
                </Button>
              ) : uploadStatus === "success" ? (
                <Button onClick={() => setShowPatientUploadDialog(false)}>Fechar</Button>
              ) : (
                <Button disabled>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Aguarde...
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Panorama da UTI */}
        <Dialog open={showPanoramaDialog} onOpenChange={setShowPanoramaDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Gerar Panorama da UTI
              </DialogTitle>
              <DialogDescription>
                Configure e gere um relatório panorâmico completo da UTI com indicadores e estatísticas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Panorama</label>
                <Select
                  value={panoramaData.reportType}
                  onValueChange={(value) => setPanoramaData({ ...panoramaData, reportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de panorama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Panorama Geral da UTI</SelectItem>
                    <SelectItem value="clinico">Panorama Clínico</SelectItem>
                    <SelectItem value="infeccoes">Panorama de Infecções</SelectItem>
                    <SelectItem value="antibioticos">Panorama de Antibióticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select
                  value={panoramaData.period}
                  onValueChange={(value) => setPanoramaData({ ...panoramaData, period: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Últimas 24 horas</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Formato</label>
                <Select
                  value={panoramaData.format}
                  onValueChange={(value) => setPanoramaData({ ...panoramaData, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Executivo</SelectItem>
                    <SelectItem value="excel">Excel Detalhado</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint Apresentação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">Opções do Relatório</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={panoramaData.includeCharts}
                      onChange={(e) => setPanoramaData({ ...panoramaData, includeCharts: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="includeCharts" className="text-sm">
                      Incluir gráficos e visualizações
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeDetails"
                      checked={panoramaData.includeDetails}
                      onChange={(e) => setPanoramaData({ ...panoramaData, includeDetails: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="includeDetails" className="text-sm">
                      Incluir detalhes por paciente
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Conformidade LGPD</p>
                    <p>Esta ação será registrada no sistema de auditoria conforme a Lei 13.709/2018.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPanoramaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGeneratePanorama}>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Panorama
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Anexo de PDF da Passagem de Plantão */}
        <Dialog
          open={showPdfAttachDialog}
          onOpenChange={(open) => {
            setShowPdfAttachDialog(open)
            if (!open) {
              resetUpload()
              setAttachedPdfFile(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Anexar PDF da Passagem de Plantão
              </DialogTitle>
              <DialogDescription>
                Anexe o PDF oficial da passagem de plantão para sincronizar os dados automaticamente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {uploadStatus === "idle" ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-800 mb-2 font-medium">Selecione o PDF da passagem de plantão</p>
                    <p className="text-xs text-blue-600">Formato suportado: PDF (.pdf)</p>
                    <input
                      type="file"
                      className="hidden"
                      id="pdf-handover-upload"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePdfAttachment(file)
                      }}
                    />
                    <Button
                      variant="outline"
                      className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100"
                      onClick={() => document.getElementById("pdf-handover-upload")?.click()}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Selecionar PDF
                    </Button>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Sincronização Automática</p>
                        <p>
                          O sistema irá extrair automaticamente os dados do PDF e atualizar a passagem de plantão
                          digital.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachedPdfFile?.name}</p>
                      <p className="text-xs text-slate-500">
                        {uploadStatus === "uploading"
                          ? "Enviando PDF..."
                          : uploadStatus === "processing"
                            ? "Extraindo dados do PDF..."
                            : uploadStatus === "success"
                              ? "PDF processado com sucesso"
                              : "Erro ao processar PDF"}
                      </p>
                    </div>
                  </div>

                  {uploadStatus === "uploading" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Enviando PDF</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {uploadStatus === "processing" && (
                    <div className="flex items-center justify-center p-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="ml-3 text-sm">Extraindo dados da passagem de plantão...</span>
                    </div>
                  )}

                  {uploadStatus === "success" && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">PDF processado com sucesso</p>
                          <p>
                            Os dados da passagem de plantão foram atualizados automaticamente com base no PDF anexado.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium mb-1">Erro ao processar PDF</p>
                          <p>Verifique se o arquivo é um PDF válido da passagem de plantão.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              {uploadStatus === "idle" || uploadStatus === "error" ? (
                <Button variant="outline" onClick={() => setShowPdfAttachDialog(false)}>
                  Cancelar
                </Button>
              ) : uploadStatus === "success" ? (
                <Button onClick={() => setShowPdfAttachDialog(false)}>Fechar</Button>
              ) : (
                <Button disabled>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Processando...
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
