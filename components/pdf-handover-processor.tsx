"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Eye,
  RefreshCw,
  Pill,
  User,
  Activity,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { logAuditEvent } from "@/components/lgpd-audit"

interface ProcessedPatient {
  id: string
  name: string
  age: number
  diagnosis: string
  admittedFrom: string
  admissionDate: string
  saps3?: string
  devices: string[]
  medications: string[]
  antibiotics: Array<{
    name: string
    startDate: string
    daysInUse: number
    indication?: string
  }>
  pendingIssues: string[]
  exams: string[]
  goals: string[]
  status: "critical" | "stable" | "improving" | "blocked" | "empty"
  allergies?: string
  comorbidities?: string
  lastUpdate: string
}

interface PDFHandoverProcessorProps {
  onPatientsUpdated: (patients: ProcessedPatient[]) => void
  currentUser: string
}

export function PDFHandoverProcessor({ onPatientsUpdated, currentUser }: PDFHandoverProcessorProps) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [extractedData, setExtractedData] = useState<ProcessedPatient[]>([])
  const [processingLog, setProcessingLog] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [extractedText, setExtractedText] = useState("")

  // Simulação de extração de dados do PDF baseada no formato real
  const simulatePDFExtraction = (
    fileName: string,
  ): { patients: ProcessedPatient[]; log: string[]; rawText: string } => {
    const log: string[] = []
    log.push(`📄 Iniciando processamento do arquivo: ${fileName}`)
    log.push(`🔍 Detectando formato de passagem de plantão...`)
    log.push(`✅ Formato reconhecido: Passagem UTI Hospital Mario Degni`)

    // Texto simulado extraído do PDF
    const rawText = `
DADOS PESSOAIS | DIAGNÓSTICOS | DISPOSITIVOS / DROGAS | EVOLUÇÃO
LEITO | NOME | ORIGEM | SAPS 3 | PTS | HD | APD | DISPOSITIVOS | INFUSÃO | SEDAÇÃO | ATB | EXAMES CRÍTICOS

5001 | LUCI APARECIDA MORALES DI BERT, 66a | UPA III LAPA (D:20/05) / DIH:21/05 | SAPS3: 76 | 67,5%
Novo Choque Séptico D:08/06 -> Mero+Teico D:09/06 | PICC, AVC, permcath, MV 24% | Noradrenalina 4ml/h
Atual: Mero + Teico D:09/06 | Aguarda HMC D:09/06 | Vigilância hematoma coxa E (500ml)

5002 | MARIA APARECIDA DA SILVA, 71a | UPA Rio Pequeno (08/05/2025)
PAV (Tazocin D:28/05) | TQT D:21/05, SVD, PICC MSD | Meropenem Di: 05/06
CST: Pseudomonas sensível meropenem | Desmame VM conforme tolerância

5003 | MARIA SOCORRO MARQUES PEREIRA, 61a | Centro Cirúrgico (DIH: 28/05/2025)
PO LE + ressecção ileotransverso + ileostomia D:04/06 | SVD 3 vias + AVP + PICC
Tazocin D:04/06 | NPT central | Anatomopatológico em andamento

5004 | TEREZINHA BALENA, 77a | UPA CITY JARAGUÁ (07/06/2025)
Choque séptico foco urinário | SVD | Noradrenalina 5ml/h | Ceftriaxona D:07/06
Urina I: leucócitos >1 milhão | Aguarda ECOTT, USG rins

6001 | ROSINALVA DA CONCEIÇÃO SANTOS, 77a | Hospital Municipal Jd Iva (02/06)
DPOC exacerbado / Choque séptico pulmonar | IOT, CVC VSD, SVD, SNE
Noradrenalina 5ml/h, Propofol 5ml/h | Pipe/Tazo 08/06 | Falha extubação

6002 | GEORGINA VIEIRA DE ALMEIDA, 66a | PS Lapa (02/06)
Bacteremia / Infecção cateter | AVP, Permicath, SVD | Meropenem 08/06
HMC: BGN em identificação | HD última 06/06

7001 | ISABEL CRISTINA MARTINS DA SILVA, 42a | Clínica Cirúrgica (08/06)
Insuficiência hepática aguda MELD 23 | SVD | Ceftriaxona 06/06
E.coli multissensível | Retirado hepatotóxicos

7002 | RENATA D MELLOS MENDES FERREIRA, 35a | UPA Vergueiro (30/05)
Confusão mental / HIV primo diagnóstico | AVP | Ceftriaxona + Metronidazol 04/06
TR HIV positivo | Aguarda sorologia HIV

7003 | RAIMUNDO LOPES DE SOUSA, 71a | UPA III Lapa (02/06)
AVCI D:01/06 / Sd abstinência | AVP | Sem ATB
TC: área hipodensa temporal E | ECO agendado 01/07
    `

    log.push(`📊 Extraindo dados de pacientes...`)

    const patients: ProcessedPatient[] = [
      {
        id: "5001",
        name: "LUCI APARECIDA MORALES DI BERT",
        age: 66,
        diagnosis: "Novo Choque Séptico D:08/06 / Choque Misto Revertido / DRC Dialítica / FAARV",
        admittedFrom: "UPA III LAPA (D:20/05) / DIH:21/05",
        admissionDate: "2025-05-21",
        saps3: "SAPS3: 76 | 67,5%",
        devices: ["PICC", "AVC", "Permcath", "VM 24%"],
        medications: ["Noradrenalina 4ml/h", "Gabapentina 300mg 12/12h", "Amitriptilina 25mg/dia"],
        antibiotics: [
          {
            name: "MEROPENEM + TEICOPLANINA",
            startDate: "2025-06-09",
            daysInUse: 1,
            indication: "Novo choque séptico",
          },
        ],
        pendingIssues: ["Aguarda HMC D:09/06", "Vigilância hematoma coxa E (500ml)", "HD conforme demanda"],
        exams: ["US partes moles 06/06: hematoma 500ml", "Hemotransfusão 1CH D:09/06"],
        goals: ["Vigilância infecciosa", "Dieta mista pastosa", "Desmame O2"],
        status: "critical",
        allergies: "Nimesulida",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "5002",
        name: "MARIA APARECIDA DA SILVA",
        age: 71,
        diagnosis: "PAV / Desmame Difícil / PO TQT D:21/05 / DPOC exacerbado",
        admittedFrom: "UPA Rio Pequeno (08/05/2025)",
        admissionDate: "2025-05-08",
        devices: ["TQT D:21/05", "SVD", "PICC MSD", "SNE"],
        medications: ["Quetiapina 25mg 12/12h", "Broncodilatadores"],
        antibiotics: [
          {
            name: "MEROPENEM",
            startDate: "2025-06-05",
            daysInUse: 4,
            indication: "PAV - Pseudomonas",
          },
        ],
        pendingIssues: ["Desmame VM conforme tolerância", "Controle broncoespasmo"],
        exams: ["CST: Pseudomonas sensível meropenem", "Broncoespasmo grave 07/06 revertido"],
        goals: ["Desmame VM gradual", "Medidas broncodilatadoras", "Dieta enteral"],
        status: "stable",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "5003",
        name: "MARIA SOCORRO MARQUES PEREIRA",
        age: 61,
        diagnosis: "PO LE + ressecção ileotransverso + ileostomia D:04/06 / PO colectomia + ureteroplastia",
        admittedFrom: "Centro Cirúrgico (DIH: 28/05/2025)",
        admissionDate: "2025-05-28",
        devices: ["SVD 3 vias", "AVP", "PICC D:31/05"],
        medications: ["Anti-eméticos", "Procinéticos"],
        antibiotics: [
          {
            name: "TAZOCIN",
            startDate: "2025-06-04",
            daysInUse: 5,
            indication: "Escalonamento pós-operatório",
          },
        ],
        pendingIssues: ["Anatomopatológico em andamento", "NPT FA03 1250mL", "Controle dreno TL"],
        exams: ["PCR 16,7 (↑ de 12,5)", "Liberado dieta líquida"],
        goals: ["NPT central", "Meta BH zerado", "Enoxaparina profilática"],
        status: "stable",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "5004",
        name: "TEREZINHA BALENA",
        age: 77,
        diagnosis: "Choque séptico foco urinário / FA crônica / IRA KDIGO 1",
        admittedFrom: "UPA City Jaraguá (07/06/2025)",
        admissionDate: "2025-06-07",
        devices: ["SVD"],
        medications: ["Noradrenalina 5ml/h"],
        antibiotics: [
          {
            name: "CEFTRIAXONA",
            startDate: "2025-06-07",
            daysInUse: 2,
            indication: "Choque séptico foco urinário",
          },
        ],
        pendingIssues: ["Aguarda ECOTT", "USG rins e vias urinárias", "Urina I e urocultura"],
        exams: ["Urina I: leucócitos >1 milhão", "INR alargado"],
        goals: ["Desmame DVA", "Antibioticoterapia", "Vigilância função renal"],
        status: "critical",
        comorbidities: "HAS, FA crônica, DM, DLP, ex-tabagista",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "6001",
        name: "ROSINALVA DA CONCEIÇÃO SANTOS",
        age: 77,
        diagnosis: "DPOC exacerbado / Choque séptico foco pulmonar / Falha extubação",
        admittedFrom: "Hospital Municipal Jd Iva (02/06)",
        admissionDate: "2025-06-02",
        devices: ["IOT", "CVC VSD", "SVD", "SNE"],
        medications: ["Noradrenalina 5ml/h", "Propofol 5ml/h", "Fentanil 0,5ml/h"],
        antibiotics: [
          {
            name: "PIPERACILINA/TAZOBACTAM",
            startDate: "2025-06-08",
            daysInUse: 1,
            indication: "Choque séptico pulmonar",
          },
        ],
        pendingIssues: ["Exames admissionais", "HMC pareada", "ECO, RX tórax"],
        exams: ["Pro BNP >9000", "Falha extubação, re-IOT 08/06"],
        goals: ["Redução parâmetros ventilatórios", "Desmame DVA", "Vigilância infecciosa"],
        status: "critical",
        comorbidities: "DPOC, HAS, ICC, aneurisma aorta, RM 2022",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "6002",
        name: "GEORGINA VIEIRA DE ALMEIDA",
        age: 66,
        diagnosis: "Bacteremia A/E (infecção cateter) / IRC dialítica",
        admittedFrom: "PS Lapa (02/06)",
        admissionDate: "2025-06-02",
        devices: ["AVP", "Permicath", "SVD"],
        medications: ["Hidralazina", "Insulina basal-bolus"],
        antibiotics: [
          {
            name: "MEROPENEM",
            startDate: "2025-06-08",
            daysInUse: 1,
            indication: "BGN em cateter",
          },
        ],
        pendingIssues: ["HMC pareadas + cateter BGN", "HD sob demanda", "Ajuste insulina"],
        exams: ["TC abdome: sem alterações", "HMC: BGN em identificação"],
        goals: ["Dieta VO liberada", "HNF profilático", "Medidas laxativas"],
        status: "stable",
        comorbidities: "DM, IRC dialítica, HAS, Doença Chagas, sequela AVCI",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "7001",
        name: "ISABEL CRISTINA MARTINS DA SILVA",
        age: 42,
        diagnosis: "Insuficiência hepática aguda Child B MELD 23 / IRA em regressão",
        admittedFrom: "Clínica Cirúrgica (08/06)",
        admissionDate: "2025-05-16",
        devices: ["SVD"],
        medications: ["Medidas laxativas"],
        antibiotics: [
          {
            name: "CEFTRIAXONA",
            startDate: "2025-06-06",
            daysInUse: 3,
            indication: "E.coli sensível",
          },
        ],
        pendingIssues: ["Laboratoriais controle", "USG abdome", "Medidas laxativas 5x/dia"],
        exams: ["MELD 23, mortalidade 19,6%", "E.coli multissensível"],
        goals: ["Retirado hepatotóxicos", "Estímulo deambulação", "Acompanhamento CG"],
        status: "critical",
        comorbidities: "Nefrolitíase, esteatose hepática, drogadição",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "7002",
        name: "RENATA D MELLOS MENDES FERREIRA",
        age: 35,
        diagnosis: "Confusão mental / Encefalopatia hepática / HIV primo diagnóstico",
        admittedFrom: "UPA Vergueiro (30/05)",
        admissionDate: "2025-05-30",
        devices: ["AVP"],
        medications: ["Suspenso espironolactona"],
        antibiotics: [
          {
            name: "CEFTRIAXONA + METRONIDAZOL",
            startDate: "2025-06-04",
            daysInUse: 5,
            indication: "Profilático",
          },
        ],
        pendingIssues: ["Sorologia HIV", "Swab vigilância", "Clostridium", "Busca familiares"],
        exams: ["TR HIV positivo", "CD4 939, CD8 848", "TC crânio: proeminência espaços"],
        goals: ["Vigilância neurológica", "Acompanhamento CCIH", "Assistência social"],
        status: "stable",
        comorbidities: "Etilismo, ex-tabagismo, epilepsia, ex-usuária crack",
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "7003",
        name: "RAIMUNDO LOPES DE SOUSA",
        age: 71,
        diagnosis: "AVCI D:01/06 / Sd abstinência alcoólica / Troponina elevada",
        admittedFrom: "UPA III Lapa (02/06)",
        admissionDate: "2025-06-02",
        devices: ["AVP"],
        medications: [],
        antibiotics: [],
        pendingIssues: ["ECO agendado 01/07", "Reconciliação medicamentosa", "Vigilância neurológica"],
        exams: ["TC: área hipodensa temporal E", "Troponina 1041→1022.8"],
        goals: ["Medidas para AVCI", "Vigilância neurológica", "Aguarda familiares"],
        status: "stable",
        comorbidities: "Etilismo",
        lastUpdate: new Date().toISOString(),
      },
    ]

    log.push(`✅ Processados ${patients.length} pacientes`)
    log.push(`💊 Identificados ${patients.reduce((acc, p) => acc + p.antibiotics.length, 0)} esquemas antibióticos`)
    log.push(`🔬 Encontradas ${patients.reduce((acc, p) => acc + p.pendingIssues.length, 0)} pendências`)
    log.push(`📋 Extraídos ${patients.reduce((acc, p) => acc + p.exams.length, 0)} exames/resultados`)
    log.push(`🎯 Definidas ${patients.reduce((acc, p) => acc + p.goals.length, 0)} metas assistenciais`)
    log.push(`⚠️ Pacientes críticos: ${patients.filter((p) => p.status === "critical").length}`)
    log.push(`✅ Processamento concluído com sucesso!`)

    return { patients, log, rawText }
  }

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setUploadStatus("error")
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo PDF.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        setUploadStatus("error")
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 50MB.",
          variant: "destructive",
        })
        return
      }

      setFileName(file.name)
      setUploadStatus("uploading")
      setUploadProgress(0)
      setProcessingLog([])

      // Simular upload
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(uploadInterval)
            setUploadStatus("processing")

            // Simular processamento
            setTimeout(() => {
              const { patients, log, rawText } = simulatePDFExtraction(file.name)
              setExtractedData(patients)
              setProcessingLog(log)
              setExtractedText(rawText)
              setUploadStatus("success")

              // Registrar no log de auditoria
              logAuditEvent({
                action: "process_handover_pdf",
                user: currentUser,
                data: {
                  fileName: file.name,
                  fileSize: file.size,
                  patientsProcessed: patients.length,
                  timestamp: new Date().toISOString(),
                },
              })

              toast({
                title: "PDF processado com sucesso!",
                description: `${patients.length} pacientes identificados e processados.`,
              })
            }, 3000)

            return 100
          }
          return prev + 8
        })
      }, 150)
    },
    [currentUser],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const confirmUpdate = () => {
    onPatientsUpdated(extractedData)

    // Registrar confirmação no log de auditoria
    logAuditEvent({
      action: "confirm_handover_update",
      user: currentUser,
      data: {
        patientsUpdated: extractedData.length,
        timestamp: new Date().toISOString(),
      },
    })

    toast({
      title: "Passagem de plantão atualizada!",
      description: `${extractedData.length} pacientes foram atualizados no sistema.`,
    })

    resetUpload()
  }

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setFileName("")
    setExtractedData([])
    setProcessingLog([])
    setShowPreview(false)
    setExtractedText("")
  }

  const downloadTemplate = () => {
    toast({
      title: "Template baixado",
      description: "Use este modelo para estruturar sua passagem de plantão.",
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Processamento Automático de Passagem de Plantão
        </CardTitle>
        <p className="text-sm text-slate-600">
          Faça upload do PDF da passagem de plantão para atualização automática dos dados dos pacientes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadStatus === "idle" && (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Faça upload do PDF da passagem de plantão</h3>
              <p className="text-sm text-gray-600 mb-6">Arraste e solte o arquivo aqui ou clique para selecionar</p>

              <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" id="pdf-upload" />

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar PDF
                </Button>

                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Formatos suportados:</strong> PDF da passagem de plantão estruturada.
                <br />
                <strong>Tamanho máximo:</strong> 50MB.
                <br />
                <strong>Processamento:</strong> Extração automática de dados de pacientes, diagnósticos, medicações e
                pendências.
              </AlertDescription>
            </Alert>
          </>
        )}

        {(uploadStatus === "uploading" || uploadStatus === "processing") && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-600">
                  {uploadStatus === "uploading" ? "Enviando arquivo..." : "Processando dados dos pacientes..."}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{uploadStatus === "uploading" ? "Upload" : "Processamento"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3" />
            </div>

            {uploadStatus === "processing" && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Log de Processamento
                </h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {processingLog.map((log, index) => (
                    <div key={index} className="text-sm text-slate-600 font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>PDF processado com sucesso!</strong> Foram identificados {extractedData.length} pacientes com
                dados completos. Revise as informações abaixo antes de confirmar a atualização.
              </AlertDescription>
            </Alert>

            {/* Estatísticas do processamento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{extractedData.length}</div>
                <div className="text-xs text-blue-600">Pacientes</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {extractedData.filter((p) => p.status === "critical").length}
                </div>
                <div className="text-xs text-red-600">Críticos</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {extractedData.reduce((acc, p) => acc + p.antibiotics.length, 0)}
                </div>
                <div className="text-xs text-green-600">Antibióticos</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {extractedData.reduce((acc, p) => acc + p.pendingIssues.length, 0)}
                </div>
                <div className="text-xs text-amber-600">Pendências</div>
              </div>
            </div>

            {/* Preview dos pacientes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Pacientes Identificados</h4>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Ocultar" : "Ver"} Detalhes
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4 bg-gray-50">
                {extractedData.map((paciente) => (
                  <div key={paciente.id} className="bg-white p-4 rounded border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Leito {paciente.id}: {paciente.name}, {paciente.age}a
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{paciente.diagnosis.substring(0, 100)}...</div>
                      </div>
                      <Badge variant={paciente.status === "critical" ? "destructive" : "secondary"} className="text-xs">
                        {paciente.status === "critical" ? "Crítico" : "Estável"}
                      </Badge>
                    </div>

                    {showPreview && (
                      <div className="space-y-2 mt-3 pt-3 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="font-medium">Origem:</span> {paciente.admittedFrom}
                          </div>
                          <div>
                            <span className="font-medium">Admissão:</span>{" "}
                            {new Date(paciente.admissionDate).toLocaleDateString("pt-BR")}
                          </div>
                        </div>

                        {paciente.antibiotics.length > 0 && (
                          <div>
                            <span className="font-medium text-xs">Antibióticos:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {paciente.antibiotics.map((atb, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <Pill className="h-3 w-3 mr-1" />
                                  {atb.name} (D{atb.daysInUse})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {paciente.pendingIssues.length > 0 && (
                          <div>
                            <span className="font-medium text-xs">Pendências:</span>
                            <div className="text-xs text-amber-700 mt-1">
                              {paciente.pendingIssues.slice(0, 2).join(", ")}
                              {paciente.pendingIssues.length > 2 && ` (+${paciente.pendingIssues.length - 2} mais)`}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Texto extraído */}
            {showPreview && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Texto Extraído do PDF</h4>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="h-32 text-xs font-mono bg-slate-50"
                  placeholder="Texto extraído do PDF aparecerá aqui..."
                />
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button onClick={confirmUpdate} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Atualização da Passagem de Plantão
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Processar Novo PDF
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro ao processar arquivo.</strong> Verifique se o arquivo é um PDF válido da passagem de plantão.
              <Button variant="outline" size="sm" onClick={resetUpload} className="ml-2">
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
